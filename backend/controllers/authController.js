const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, employeeId, department, semester, batch, program, phone } = req.body;

    // Basic identity guardrails
    const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN || 'gmail.com').toLowerCase();
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail.endsWith(`@${allowedDomain}`)) {
      return res.status(400).json({ message: `Email must be a ${allowedDomain} address` });
    }

    // Restrict role self-registration to student/faculty/admin only if needed
    const safeRole = role || 'student';
    if (!['student', 'faculty', 'admin'].includes(safeRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // rollNumber: allow digits length 1..14 (your note: max length 14 digits)
    const rn = (rollNumber ?? '').toString().trim();
    if (safeRole === 'student' && rn.length === 0) {
      return res.status(400).json({ message: 'Roll number is required for students' });
    }
    if (rn && !/^\d{1,14}$/.test(rn)) {
      return res.status(400).json({ message: 'Roll number must be up to 14 digits' });
    }

    // phone: exact 10 digits if provided
    const p = (phone ?? '').toString().trim();
    if (p && !/^\d{10}$/.test(p)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    // normalize email
    email = normalizedEmail;
    role = safeRole;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check duplicate rollNumber for students
    if (role === 'student' && rollNumber) {
      const existingRoll = await User.findOne({ rollNumber });
      if (existingRoll) {
        return res.status(400).json({ message: 'Roll number already registered' });
      }
    }

    const user = await User.create({
      name, email, password, role: role || 'student',
      rollNumber, employeeId, department, semester, batch, program,
      // Require verification before dashboard access
      isActive: false,
      isEmailVerified: false
    });

    // NOTE: No email-sending flow exists in this codebase right now,
    // so we return a verification token for you to hook up later.
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.VERIFY_EXPIRE || '15m' }
    );

    res.status(201).json({
      message: 'Registration successful. Please verify your email before login.',
      verificationToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        department: user.department,
        semester: user.semester,
        batch: user.batch,
        program: user.program,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate field value entered' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not active. Please verify your email first.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Email not verified. Please verify your email first.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        employeeId: user.employeeId,
        department: user.department,
        semester: user.semester,
        batch: user.batch,
        program: user.program,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email (activate account)
// @route   GET /api/auth/verify-email?token=...
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id;
    if (!userId) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isEmailVerified = true;
    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Verification token has expired' });
    }
    return res.status(400).json({ message: 'Invalid verification token' });
  }
};

module.exports = { register, login, getMe, changePassword, verifyEmail };
