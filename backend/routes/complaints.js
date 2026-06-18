const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getComplaints, getComplaint, createComplaint,
  updateStatus, addComment, submitFeedback, getStats
} = require('../controllers/complaintController');

router.get('/', protect, getComplaints);
router.get('/stats', protect, authorize('admin', 'faculty'), getStats);
router.get('/:id', protect, getComplaint);

router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Academic', 'Infrastructure', 'Administrative', 'Hostel', 'Library', 'Canteen', 'IT Support', 'Harassment', 'Other']).withMessage('Invalid category')
], validate, createComplaint);

router.put('/:id/status', protect, authorize('admin', 'faculty'), [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed', 'rejected']).withMessage('Invalid status')
], validate, updateStatus);

router.post('/:id/comments', protect, [
  body('content').trim().notEmpty().withMessage('Comment content is required')
], validate, addComment);

router.post('/:id/feedback', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], validate, submitFeedback);

module.exports = router;
