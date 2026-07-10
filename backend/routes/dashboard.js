const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminAnalytics, getFacultyDashboard, getStudentDashboard } = require('../controllers/dashboardController');

router.get('/analytics', protect, authorize('admin'), getAdminAnalytics);
router.get('/faculty', protect, authorize('faculty'), getFacultyDashboard);
router.get('/student', protect, authorize('student'), getStudentDashboard);

module.exports = router;
