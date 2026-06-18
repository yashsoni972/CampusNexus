const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createUpload } = require('../middleware/upload');
const upload = createUpload('announcements');
const {
  getAnnouncements, getAnnouncement, createAnnouncement,
  updateAnnouncement, deleteAnnouncement, togglePin
} = require('../controllers/announcementController');

router.get('/', protect, getAnnouncements);
router.get('/:id', protect, getAnnouncement);

router.post('/', protect, authorize('admin', 'faculty'), upload.array('attachments', 10), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(['Academic', 'Administrative', 'Cultural', 'Sports', 'Placement', 'Holiday', 'Exam', 'General']).withMessage('Invalid category')
], validate, createAnnouncement);

router.put('/:id', protect, authorize('admin', 'faculty'), upload.array('attachments', 10), updateAnnouncement);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteAnnouncement);
router.put('/:id/pin', protect, authorize('admin'), togglePin);

module.exports = router;
