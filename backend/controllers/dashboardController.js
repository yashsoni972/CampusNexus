const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Complaint = require('../models/Complaint');
const Event = require('../models/Event');

// @desc    Get dashboard analytics
// @route   GET /api/dashboard/analytics
// @access  Private (admin)
const getAdminAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // User stats
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalFaculty = await User.countDocuments({ role: 'faculty', isActive: true });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Announcement stats
    const totalAnnouncements = await Announcement.countDocuments({ isPublished: true });
    const announcementsThisMonth = await Announcement.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Complaint stats
    const totalComplaints = await Complaint.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: 'open' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in_progress' });
    const complaintsThisMonth = await Complaint.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Resolution rate
    const resolutionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0;

    // Event stats
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ startDate: { $gte: now }, status: 'upcoming' });
    const eventsThisMonth = await Event.countDocuments({ startDate: { $gte: startOfMonth } });

    // Complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Complaints by month (last 6 months)
    const complaintsTrend = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Department distribution
    const departmentStats = await User.aggregate([
      { $match: { role: 'student', isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent activity
    const recentComplaints = await Complaint.find()
      .populate('submittedBy', 'name rollNumber')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('ticketId title status category createdAt');

    const recentAnnouncements = await Announcement.find({ isPublished: true })
      .populate('author', 'name role')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category priority createdAt');

    res.json({
      overview: {
        totalUsers, totalStudents, totalFaculty,
        newUsersThisMonth, totalAnnouncements, announcementsThisMonth,
        totalComplaints, openComplaints, resolvedComplaints,
        inProgressComplaints, complaintsThisMonth, resolutionRate,
        totalEvents, upcomingEvents, eventsThisMonth
      },
      charts: {
        complaintsByCategory,
        complaintsTrend,
        departmentStats,
        complaintStatusBreakdown: [
          { status: 'Open', count: openComplaints },
          { status: 'In Progress', count: inProgressComplaints },
          { status: 'Resolved', count: resolvedComplaints }
        ]
      },
      recentActivity: {
        complaints: recentComplaints,
        announcements: recentAnnouncements
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private (student)
const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    // Always fetch fresh user from DB so attendance/cgpa updates are reflected immediately
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const now = new Date();

    // Personal complaints
    const myComplaints = await Complaint.find({ submittedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('ticketId title status category createdAt');

    const myComplaintsCount = {
      total: await Complaint.countDocuments({ submittedBy: userId }),
      open: await Complaint.countDocuments({ submittedBy: userId, status: 'open' }),
      resolved: await Complaint.countDocuments({ submittedBy: userId, status: 'resolved' })
    };

    // Recent announcements for this student
    const audienceFilter = {
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { targetAudience: 'specific_department', targetDepartment: user.department },
        { targetAudience: 'specific_batch', targetBatch: user.batch }
      ]
    };

    const announcements = await Announcement.find({
      isPublished: true,
      ...audienceFilter,
      $or: [{ expiryDate: { $gt: now } }, { expiryDate: null }]
    })
      .populate('author', 'name role')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5)
      .select('title category priority isPinned createdAt');

    // Upcoming events
    const upcomingEvents = await Event.find({
      startDate: { $gte: now },
      status: 'upcoming',
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { targetAudience: 'specific_department', targetDepartment: user.department }
      ]
    })
      .sort({ startDate: 1 })
      .limit(5)
      .select('title category startDate venue isOnline');

    // Events registered for
    const myEvents = await Event.find({
      'registeredUsers.user': userId,
      startDate: { $gte: now }
    })
      .sort({ startDate: 1 })
      .limit(3)
      .select('title startDate venue');

    res.json({
      profile: {
        name: user.name,
        rollNumber: user.rollNumber,
        department: user.department,
        semester: user.semester,
        batch: user.batch,
        cgpa: user.cgpa,
        attendance: user.attendance,
        avatar: user.avatar
      },
      complaints: { list: myComplaints, stats: myComplaintsCount },
      announcements: { list: announcements, unreadCount: announcements.length },
      events: { upcoming: upcomingEvents, myRegistrations: myEvents }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get faculty dashboard data
// @route   GET /api/dashboard/faculty
// @access  Private (faculty)
const getFacultyDashboard = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const dept = req.user.department;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const deptFilter = dept ? { department: dept } : {};

    const [totalStudents, announcementsThisMonth, openComplaints, upcomingEvents, recentComplaints, recentAnnouncements, myEvents] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true, ...deptFilter }),
      Announcement.countDocuments({ author: facultyId, createdAt: { $gte: startOfMonth } }),
      Complaint.countDocuments({ status: 'open' }),
      Event.countDocuments({ organizer: facultyId, startDate: { $gte: now }, status: 'upcoming' }),
      Complaint.find().populate('submittedBy', 'name rollNumber').sort({ createdAt: -1 }).limit(5).select('ticketId title status category createdAt'),
      Announcement.find({ author: facultyId }).populate('author', 'name role').sort({ createdAt: -1 }).limit(5).select('title category priority createdAt'),
      Event.find({ organizer: facultyId, startDate: { $gte: now } }).sort({ startDate: 1 }).limit(5).select('title startDate venue status'),
    ]);

    res.json({
      overview: { totalStudents, announcementsThisMonth, openComplaints, upcomingEvents },
      recentActivity: { complaints: recentComplaints, announcements: recentAnnouncements },
      myEvents
    });
  } catch (error) {
    console.error('Faculty dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAdminAnalytics, getFacultyDashboard, getStudentDashboard };
