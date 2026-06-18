const Announcement = require('../models/Announcement');
const fs = require('fs');
const path = require('path');

// @desc    Get all announcements (with filtering)
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const {
      page = 1, limit = 10, category, priority,
      search, pinned, audience
    } = req.query;

    const query = { isPublished: true };

    // Filter expired announcements
    query.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ];

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (pinned === 'true') query.isPinned = true;

    // Audience filtering based on user role
    const user = req.user;
    if (user.role === 'student') {
      query.$and = [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'students' },
            { targetAudience: 'specific_department', targetDepartment: user.department },
            { targetAudience: 'specific_batch', targetBatch: user.batch }
          ]
        }
      ];
    } else if (user.role === 'faculty') {
      query.$and = [
        {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'faculty' },
            { targetAudience: 'specific_department', targetDepartment: user.department }
          ]
        }
      ];
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchCond = { $or: [{ title: searchRegex }, { content: searchRegex }] };
      if (query.$and) {
        query.$and.push(searchCond);
      } else {
        query.$and = [searchCond];
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Announcement.countDocuments(query);

    const announcements = await Announcement.find(query)
      .populate('author', 'name role department avatar')
      .sort({ isPinned: -1, publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      announcements,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name role department avatar');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Increment view count and mark as read
    announcement.views += 1;
    const alreadyRead = announcement.readBy.some(
      r => r.user.toString() === req.user._id.toString()
    );
    if (!alreadyRead) {
      announcement.readBy.push({ user: req.user._id });
    }
    await announcement.save({ validateBeforeSave: false });

    res.json({ announcement });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (admin, faculty)
const createAnnouncement = async (req, res) => {
  try {
    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      url: `/uploads/announcements/${f.filename}`,
      size: f.size
    }));

    const body = { ...req.body };
    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const announcement = await Announcement.create({
      ...body,
      author: req.user._id,
      attachments
    });

    await announcement.populate('author', 'name role department avatar');
    res.status(201).json({ message: 'Announcement created successfully', announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (admin, faculty - own)
const updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }

    const body = { ...req.body };
    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const newAttachments = (req.files || []).map(f => ({
      filename: f.originalname,
      url: `/uploads/announcements/${f.filename}`,
      size: f.size
    }));

    if (newAttachments.length > 0) {
      body.attachments = [...(announcement.attachments || []), ...newAttachments];
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('author', 'name role department avatar');

    res.json({ message: 'Announcement updated successfully', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (admin, faculty - own)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle pin announcement
// @route   PUT /api/announcements/:id/pin
// @access  Private (admin only)
const togglePin = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.json({ message: `Announcement ${announcement.isPinned ? 'pinned' : 'unpinned'}`, announcement });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAnnouncements, getAnnouncement, createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin };
