const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminAnalytics, getStudentDashboard } = require('../controllers/dashboardController');

router.get('/analytics', protect, authorize('admin', 'faculty'), getAdminAnalytics);
router.get('/student', protect, authorize('student'), getStudentDashboard);

module.exports = router;
