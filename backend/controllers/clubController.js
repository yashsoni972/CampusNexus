const Club = require('../models/Club');
const ClubMessage = require('../models/ClubMessage');

// GET /api/clubs
const getClubs = async (req, res) => {
  try {
    const { search, tag } = req.query;
    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (tag) query.tags = tag;

    const clubs = await Club.find(query)
      .populate('createdBy', 'name avatar role')
      .populate('members.user', 'name avatar role department')
      .sort({ createdAt: -1 });

    res.json({ clubs });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/clubs/:id
const getClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('createdBy', 'name avatar role')
      .populate('members.user', 'name avatar role department');
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json({ club });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/clubs  (admin/faculty only)
const createClub = async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    if (!name) return res.status(400).json({ message: 'Club name is required' });

    const club = await Club.create({
      name, description,
      tags: tags || [],
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await club.populate('createdBy', 'name avatar role');
    await club.populate('members.user', 'name avatar role department');
    res.status(201).json({ message: 'Club created', club });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Club name already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/clubs/:id  (club admin only)
const updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const isClubAdmin = club.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isClubAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only club admins can update' });
    }

    const { name, description, tags } = req.body;
    if (name) club.name = name;
    if (description !== undefined) club.description = description;
    if (tags) club.tags = tags;
    await club.save();

    await club.populate('createdBy', 'name avatar role');
    await club.populate('members.user', 'name avatar role department');
    res.json({ message: 'Club updated', club });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Club name already exists' });
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/clubs/:id  (site admin only)
const deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    await Club.findByIdAndDelete(req.params.id);
    await ClubMessage.deleteMany({ club: req.params.id });
    res.json({ message: 'Club deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/clubs/:id/join
const joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const already = club.members.some(m => m.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'Already a member' });

    club.members.push({ user: req.user._id, role: 'member' });
    await club.save();
    await club.populate('members.user', 'name avatar role department');
    res.json({ message: 'Joined club', club });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/clubs/:id/leave
const leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const memberEntry = club.members.find(m => m.user.toString() === req.user._id.toString());
    if (!memberEntry) return res.status(400).json({ message: 'Not a member' });
    if (memberEntry.role === 'admin' && club.members.filter(m => m.role === 'admin').length === 1) {
      return res.status(400).json({ message: 'Assign another admin before leaving' });
    }

    club.members = club.members.filter(m => m.user.toString() !== req.user._id.toString());
    await club.save();
    res.json({ message: 'Left club' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/clubs/:id/members/:userId/role  (club admin only)
const changeMemberRole = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const isClubAdmin = club.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isClubAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only club admins can change roles' });
    }

    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const member = club.members.find(m => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    member.role = role;
    await club.save();
    await club.populate('members.user', 'name avatar role department');
    res.json({ message: 'Member role updated', club });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/clubs/:id/members/:userId  (club admin only)
const removeMember = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const isClubAdmin = club.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isClubAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only club admins can remove members' });
    }

    club.members = club.members.filter(m => m.user.toString() !== req.params.userId);
    await club.save();
    res.json({ message: 'Member removed' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/clubs/:id/messages  — paginated
const getMessages = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const isMember = club.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Join the club to view messages' });

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;
    const total = await ClubMessage.countDocuments({ club: req.params.id });

    const messages = await ClubMessage.find({ club: req.params.id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })   // newest first for pagination
      .skip(skip)
      .limit(limit);

    res.json({
      messages: messages.reverse(), // return in ascending order
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + messages.length < total,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getClubs, getClub, createClub, updateClub, deleteClub,
  joinClub, leaveClub, changeMemberRole, removeMember, getMessages
};
