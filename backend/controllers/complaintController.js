const Complaint = require('../models/Complaint');

// @desc    Get complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority, search } = req.query;
    const query = {};

    // Students see only their own complaints; admin/faculty see all
    if (req.user.role === 'student') {
      query.submittedBy = req.user._id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name rollNumber department avatar')
      .populate('assignedTo', 'name role department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      complaints,
      pagination: {
        total, page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name rollNumber department avatar email')
      .populate('assignedTo', 'name role department email')
      .populate('comments.author', 'name role avatar')
      .populate('statusHistory.changedBy', 'name role');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Students can only see their own
    if (req.user.role === 'student' && complaint.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      ...req.body,
      submittedBy: req.user._id,
      statusHistory: [{
        status: 'open',
        changedBy: req.user._id,
        note: 'Complaint submitted'
      }]
    });

    await complaint.populate('submittedBy', 'name rollNumber department avatar');
    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (admin, faculty)
const updateStatus = async (req, res) => {
  try {
    const { status, note, assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status changed to ${status}`
    });

    if (assignedTo) complaint.assignedTo = assignedTo;
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      if (note) complaint.resolutionNote = note;
    }

    await complaint.save();
    await complaint.populate('submittedBy', 'name rollNumber department');
    await complaint.populate('assignedTo', 'name role');

    res.json({ message: 'Status updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content, isInternal } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Students can only comment on their own complaints
    if (req.user.role === 'student' && complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only admin/faculty can add internal notes
    const internal = isInternal && ['admin', 'faculty'].includes(req.user.role);

    complaint.comments.push({
      author: req.user._id,
      content,
      isInternal: internal
    });

    await complaint.save();
    await complaint.populate('comments.author', 'name role avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: complaint.comments[complaint.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit feedback for resolved complaint
// @route   POST /api/complaints/:id/feedback
// @access  Private (complaint owner)
const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (complaint.status !== 'resolved') {
      return res.status(400).json({ message: 'Can only rate resolved complaints' });
    }

    complaint.feedback = { rating, comment, submittedAt: new Date() };
    await complaint.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private (admin, faculty)
const getStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statusMap = {};
    stats.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      total: await Complaint.countDocuments(),
      byStatus: statusMap,
      byCategory,
      open: statusMap['open'] || 0,
      in_progress: statusMap['in_progress'] || 0,
      resolved: statusMap['resolved'] || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getComplaints, getComplaint, createComplaint, updateStatus, addComment, submitFeedback, getStats };
