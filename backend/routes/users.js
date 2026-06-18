const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers, getUserProfile, updateUserProfile,
  getStudents, toggleUserStatus, deleteUser,
  changeUserRole, changePassword, uploadCertificate
} = require('../controllers/userController');

// PDF-only multer for certificates
const certStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/certificates'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}.pdf`)
});
const certUpload = multer({
  storage: certStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are allowed'));
  }
});

router.get('/', protect, authorize('admin', 'faculty'), getUsers);
router.get('/students', protect, authorize('admin', 'faculty'), getStudents);

// Certificate upload
router.post('/achievements/certificate', protect, certUpload.single('certificate'), uploadCertificate);

// Own profile routes (must come BEFORE /:id to avoid conflicts)
router.get('/profile/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/profile/password', protect, changePassword);

// Admin actions on specific users
router.get('/:id', protect, getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.put('/:id/role', protect, authorize('admin'), changeUserRole);
router.put('/:id/verify', protect, authorize('admin'), toggleUserStatus);
router.put('/:id/toggle-status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
