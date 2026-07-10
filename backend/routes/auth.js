const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const {
  register, login, getMe, changePassword,
  verifyEmail, verifyOtp, resendOtp, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate    = require('../middleware/validate');

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
], validate, register);

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

// Verify OTP (registration OR login 2FA)
router.post('/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], validate, verifyOtp);

// Resend OTP
router.post('/resend-otp', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
], validate, resendOtp);

// Forgot / Reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Get current user
router.get('/me', protect, getMe);

// Legacy verify-email link support
router.get('/verify-email', verifyEmail);

// Change password
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, changePassword);

module.exports = router;
