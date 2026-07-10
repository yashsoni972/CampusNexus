const User = require('../models/User');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, department, search, batch } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (batch) query.batch = batch;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      users,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      pagination: {
        total, page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/:id  OR  GET /api/users/profile/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    // Support /profile/me route (req.params.id is undefined) or /:id with "me"
    const paramId = req.params.id;
    const userId = (!paramId || paramId === 'me') ? req.user._id : paramId;

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Students can only view their own profile
    if (req.user.role === 'student' && userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id  OR  PUT /api/users/profile
// @access  Private (own profile or admin)
const updateUserProfile = async (req, res) => {
  try {
    const paramId = req.params.id;
    const userId = (!paramId || paramId === 'me') ? req.user._id : paramId;

    // Only admin or faculty can update other users
    if (req.user._id.toString() !== userId.toString() && !['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedFields = ['name', 'phone', 'dateOfBirth', 'gender', 'address', 'bio', 'avatar', 'skills', 'achievements', 'projects', 'linkedIn', 'github', 'guardian', 'designation', 'department', 'semester', 'year', 'section'];
    const adminFields = [...allowedFields, 'batch', 'program', 'cgpa', 'attendance', 'rollNumber', 'employeeId', 'isActive'];
    const facultyFields = [...allowedFields, 'attendance', 'cgpa'];

    let fields;
    if (req.user.role === 'admin') fields = adminFields;
    else if (req.user.role === 'faculty') fields = facultyFields;
    else fields = allowedFields;
    const updateData = {};
    fields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Faculty can only update students from their own department
    if (req.user.role === 'faculty' && req.user._id.toString() !== userId.toString()) {
      const targetUser = await User.findById(userId).select('department role');
      if (!targetUser) return res.status(404).json({ message: 'User not found' });
      if (targetUser.role !== 'student') {
        return res.status(403).json({ message: 'Faculty can only update student profiles' });
      }
      if (req.user.department && targetUser.department !== req.user.department) {
        return res.status(403).json({ message: 'Access denied. You can only update students from your department.' });
      }
    }

    const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get students list (for faculty/admin)
// @route   GET /api/users/students
// @access  Private (faculty, admin)
const getStudents = async (req, res) => {
  try {
    const { department, batch, semester, search } = req.query;
    const query = { role: 'student', isActive: true };

    // Faculty can only see students from their own department
    if (req.user.role === 'faculty') {
      if (req.user.department) {
        query.department = req.user.department;
      }
    } else {
      // Admin can filter by department optionally
      if (department) query.department = department;
    }

    if (batch) query.batch = batch;
    if (semester) query.semester = parseInt(semester);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('name email rollNumber department semester batch cgpa attendance avatar program')
      .sort({ rollNumber: 1 });

    res.json({ students, count: students.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Deactivate / Activate user  OR  Toggle verification
// @route   PUT /api/users/:id/toggle-status  or  /verify
// @access  Private (admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Handle verify toggle
    if (req.body.isVerified !== undefined) {
      user.isVerified = req.body.isVerified;
    } else {
      user.isActive = !user.isActive;
    }
    await user.save({ validateBeforeSave: false });

    res.json({
      message: `User updated successfully`,
      user: { isActive: user.isActive, isVerified: user.isVerified }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change user role
// @route   PUT /api/users/:id/role
// @access  Private (admin)
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Audit log entry
    console.log(`[AUDIT] ${new Date().toISOString()} | role_change | by:${req.user._id}(${req.user.name}) | target:${req.params.id}(${user.name}) | newRole:${role}`);

    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get audit log (admin only)
// @route   GET /api/users/audit-log
// @access  Private (admin)
const getAuditLog = async (req, res) => {
  try {
    // Return last 50 user changes — sorted by most recent
    const users = await User.find({})
      .select('name email role department isActive updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({ log: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting yourself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload certificate PDF for an achievement
// @route   POST /api/users/achievements/certificate
// @access  Private (student)
const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded' });
    const url = `/uploads/certificates/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

// @desc    Change own password
// @route   PUT /api/users/profile/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload avatar image
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const url = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { avatar: url });
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

module.exports = {
  getUsers, getUserProfile, updateUserProfile,
  getStudents, toggleUserStatus, deleteUser,
  changeUserRole, changePassword, uploadCertificate, uploadAvatar, getAuditLog
};
