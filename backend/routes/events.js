const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createUpload } = require('../middleware/upload');
const upload = createUpload('events');
const {
  getEvents, getEvent, createEvent, updateEvent,
  deleteEvent, registerForEvent, unregisterFromEvent, getUpcomingEvents
} = require('../controllers/eventController');

router.get('/', protect, getEvents);
router.get('/upcoming', protect, getUpcomingEvents);
router.get('/:id', protect, getEvent);

router.post('/', protect, authorize('admin', 'faculty'), upload.array('attachments', 10), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('category').isIn(['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Placement', 'Holiday', 'Exam', 'Other']).withMessage('Invalid category')
], validate, createEvent);

router.put('/:id', protect, authorize('admin', 'faculty'), upload.array('attachments', 10), updateEvent);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteEvent);
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, unregisterFromEvent);

module.exports = router;
