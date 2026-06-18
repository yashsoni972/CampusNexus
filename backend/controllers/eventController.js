const Event = require('../models/Event');
const path = require('path');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, month, year, featured, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (featured === 'true') query.isFeatured = true;

    // Filter by month/year for calendar view
    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.$or = [
        { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { startDate: { $lte: startOfMonth }, endDate: { $gte: endOfMonth } }
      ];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Audience filter
    const user = req.user;
    if (user.role === 'student') {
      const audienceCond = {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'students' },
          { targetAudience: 'specific_department', targetDepartment: user.department },
          { targetAudience: 'specific_batch', targetBatch: user.batch }
        ]
      };
      query.$and = query.$and ? [...query.$and, audienceCond] : [audienceCond];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate('organizer', 'name role department avatar')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      events,
      pagination: {
        total, page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name role department avatar email')
      .populate('registeredUsers.user', 'name rollNumber department');

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (admin, faculty)
const createEvent = async (req, res) => {
  try {
    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      url: `/uploads/events/${f.filename}`
    }));

    const body = { ...req.body };
    if (body.maxParticipants) body.maxParticipants = parseInt(body.maxParticipants);
    if (body.requiresRegistration) body.requiresRegistration = body.requiresRegistration === 'true';
    if (body.isFeatured) body.isFeatured = body.isFeatured === 'true';
    if (body.isOnline) body.isOnline = body.isOnline === 'true';

    const event = await Event.create({
      ...body,
      organizer: req.user._id,
      organizerName: req.user.name,
      attachments
    });

    await event.populate('organizer', 'name role department avatar');
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (admin, organizer)
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const body = { ...req.body };
    const newAttachments = (req.files || []).map(f => ({
      filename: f.originalname,
      url: `/uploads/events/${f.filename}`
    }));
    if (newAttachments.length > 0) {
      body.attachments = [...(event.attachments || []), ...newAttachments];
    }

    event = await Event.findByIdAndUpdate(req.params.id, { $set: body }, { new: true, runValidators: true })
      .populate('organizer', 'name role department avatar');

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (admin, organizer)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.requiresRegistration) {
      return res.status(400).json({ message: 'This event does not require registration' });
    }

    const alreadyRegistered = event.registeredUsers.some(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    if (event.maxParticipants && event.registeredUsers.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    event.registeredUsers.push({ user: req.user._id });
    await event.save();

    res.json({ message: 'Successfully registered for event', registeredCount: event.registeredUsers.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.registeredUsers = event.registeredUsers.filter(
      r => r.user.toString() !== req.user._id.toString()
    );
    await event.save();

    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get upcoming events (next 7 days)
// @route   GET /api/events/upcoming
// @access  Private
const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await Event.find({
      startDate: { $gte: today, $lte: nextWeek },
      status: { $ne: 'cancelled' }
    })
      .populate('organizer', 'name role')
      .sort({ startDate: 1 })
      .limit(5);

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent, getUpcomingEvents };
