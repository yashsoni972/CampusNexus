const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, sendOTP, verifyMailConfig } = require('../utils/sendOTP');

// ── helpers ────────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Cache whether email works — checked once on startup
let emailWorks = false;
verifyMailConfig().then(ok => { emailWorks = ok; });

const isEmailConfigured = () => emailWorks;

// Safe user payload (never expose password / otp)
const safeUser = (u) => ({
  _id:        u._id,
  name:       u.name,
  email:      u.email,
  role:       u.role,
  rollNumber: u.rollNumber,
  employeeId: u.employeeId,
  department: u.department,
  semester:   u.semester,
  batch:      u.batch,
  program:    u.program,
  avatar:     u.avatar,
  isEmailVerified: u.isEmailVerified,
});

// ── REGISTER ──────────────────────────────────────────────────────────────
// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const {
      name, email, password, role,
      rollNumber, employeeId, department,
      semester, batch, program, phone,
    } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ message: 'Full name is required' });
    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const finalEmail = (email || '').toLowerCase().trim();
    if (!finalEmail || !/^\S+@\S+\.\S+$/.test(finalEmail))
      return res.status(400).json({ message: 'Please provide a valid email address' });

    const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN || '').toLowerCase().trim();
    if (allowedDomain && !finalEmail.endsWith(`@${allowedDomain}`))
      return res.status(400).json({ message: `Email must be a @${allowedDomain} address` });

    const finalRole = ['student', 'faculty', 'admin'].includes(role) ? role : 'student';

    const rn = (rollNumber ?? '').toString().trim();
    if (finalRole === 'student' && rn.length === 0)
      return res.status(400).json({ message: 'Roll number is required for students' });
    if (rn && !/^[A-Za-z0-9/_\-.]{1,20}$/.test(rn))
      return res.status(400).json({ message: 'Roll number: max 20 chars, letters/digits/._-/ only' });

    const ph = (phone ?? '').toString().trim();
    if (ph && !/^\d{10}$/.test(ph))
      return res.status(400).json({ message: 'Phone must be exactly 10 digits' });

    // Duplicate checks
    if (await User.findOne({ email: finalEmail }))
      return res.status(400).json({ message: 'An account with this email already exists' });
    if (finalRole === 'student' && rn && await User.findOne({ rollNumber: rn }))
      return res.status(400).json({ message: 'This roll number is already registered' });

    // Generate OTP
    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Email configured → require verification; else activate immediately
    const emailReady = isEmailConfigured();

    const user = await User.create({
      name: name.trim(), email: finalEmail, password,
      role: finalRole, rollNumber: rn || undefined,
      employeeId: employeeId || undefined,
      department: department || undefined,
      semester:   semester   || undefined,
      batch:      batch      || undefined,
      program:    program    || 'B.Tech',
      phone:      ph         || undefined,
      isActive:        !emailReady, // active immediately if no email
      isEmailVerified: !emailReady,
      otp,
      otpExpiry,
      otpPurpose: 'verification',
    });

    if (emailReady) {
      try {
        await sendOTP(finalEmail, otp, 'verification');
      } catch (mailErr) {
        console.error('OTP mail failed:', mailErr.message);
        // Fallback — activate account so user isn't stuck
        await User.findByIdAndUpdate(user._id, {
          isActive: true, isEmailVerified: true,
          otp: undefined, otpExpiry: undefined,
        });
        const token = generateToken(user._id);
        return res.status(201).json({
          message: 'Account created. (Email service unavailable — logged in directly)',
          token,
          user: safeUser(user),
          otpRequired: false,
        });
      }

      return res.status(201).json({
        message: `OTP sent to ${finalEmail}. Enter it to activate your account.`,
        email: finalEmail,
        otpRequired: true,
      });
    }

    // No email configured — log in directly
    const token = generateToken(user._id);
    return res.status(201).json({
      message: 'Account created successfully! Welcome to CampusNexus.',
      token,
      user: safeUser(user),
      otpRequired: false,
    });

  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(400).json({ message: `${field} is already taken` });
    }
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map(e => e.message).join('. ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ── VERIFY OTP (registration) ──────────────────────────────────────────────
// @route  POST /api/auth/verify-otp
// @access Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+otp +otpExpiry +otpPurpose');

    if (!user)
      return res.status(404).json({ message: 'Account not found' });

    if (!user.otp)
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    if (user.otp !== otp.toString().trim())
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });

    const wasLogin = user.otpPurpose === 'login';

    // Activate account + clear OTP
    user.isEmailVerified = true;
    user.isActive        = true;
    user.otp             = undefined;
    user.otpExpiry       = undefined;
    user.otpPurpose      = undefined;
    if (wasLogin) user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    return res.json({
      message: wasLogin ? 'Login successful!' : 'Email verified! Welcome to CampusNexus.',
      token,
      user: safeUser(user),
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// ── RESEND OTP ─────────────────────────────────────────────────────────────
// @route  POST /api/auth/resend-otp
// @access Public
const resendOtp = async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body;
    if (!email)
      return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+otp +otpExpiry +otpPurpose');

    if (!user)
      return res.status(404).json({ message: 'Account not found' });

    if (!isEmailConfigured())
      return res.status(503).json({ message: 'Email service not configured on this server.' });

    // Rate limit — don't resend within 60 seconds
    if (user.otpExpiry && user.otpExpiry > new Date(Date.now() + 9 * 60 * 1000))
      return res.status(429).json({ message: 'Please wait 60 seconds before requesting a new OTP.' });

    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp        = otp;
    user.otpExpiry  = otpExpiry;
    user.otpPurpose = purpose;
    await user.save({ validateBeforeSave: false });

    await sendOTP(email.toLowerCase().trim(), otp, purpose);

    res.json({ message: `New OTP sent to ${email}` });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

// ── LOGIN ──────────────────────────────────────────────────────────────────
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +otp +otpExpiry +otpPurpose');

    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    // Auto-heal old accounts that got stuck unverified
    if (!user.isActive || !user.isEmailVerified) {
      if (!isEmailConfigured()) {
        user.isActive        = true;
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
      }
    }

    // If still not verified (email configured) → send OTP to finish verification
    if (!user.isEmailVerified && isEmailConfigured()) {
      const otp       = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      user.otp        = otp;
      user.otpExpiry  = otpExpiry;
      user.otpPurpose = 'verification';
      await user.save({ validateBeforeSave: false });
      try { await sendOTP(user.email, otp, 'verification'); } catch (_) {}
      return res.status(403).json({
        message: 'Account not verified. OTP sent to your email.',
        email: user.email,
        otpRequired: true,
        purpose: 'verification',
      });
    }

    // Email configured → send login OTP (2FA)
    if (isEmailConfigured()) {
      const otp       = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      user.otp        = otp;
      user.otpExpiry  = otpExpiry;
      user.otpPurpose = 'login';
      await user.save({ validateBeforeSave: false });

      try {
        await sendOTP(user.email, otp, 'login');
        return res.json({
          message: `OTP sent to ${user.email}. Enter it to complete login.`,
          email: user.email,
          otpRequired: true,
          purpose: 'login',
        });
      } catch (mailErr) {
        console.error('Login OTP mail failed:', mailErr.message);
        // Fallback to direct login if mail fails
      }
    }

    // Direct login (no email configured or mail failed)
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser(user),
      otpRequired: false,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ── GET ME ────────────────────────────────────────────────────────────────
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: 'Current password is incorrect' });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── LEGACY VERIFY EMAIL (kept so old links don't 404) ─────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, {
            isEmailVerified: true, isActive: true,
            otp: undefined, otpExpiry: undefined,
          });
        }
      } catch (_) {}
    }
    res.json({ message: 'Account verified. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always respond OK to prevent email enumeration
    if (!user) return res.json({ message: 'If that email exists, an OTP has been sent.' });

    if (!isEmailConfigured()) {
      return res.status(503).json({ message: 'Email service not configured. Contact admin to reset your password.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'reset';
    await user.save({ validateBeforeSave: false });
    try { await sendOTP(user.email, otp, 'reset'); } catch (_) {}

    res.json({ message: 'If that email exists, an OTP has been sent.', email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── RESET PASSWORD ─────────────────────────────────────────────────────────
// @route  POST /api/auth/reset-password
// @access Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+otp +otpExpiry +otpPurpose');

    if (!user || user.otpPurpose !== 'reset')
      return res.status(400).json({ message: 'Invalid or expired reset request' });
    if (!user.otp || user.otpExpiry < new Date())
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    if (user.otp !== otp.toString().trim())
      return res.status(400).json({ message: 'Invalid OTP' });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe, changePassword, verifyEmail, verifyOtp, resendOtp, forgotPassword, resetPassword };
