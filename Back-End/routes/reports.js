const express = require('express');
const router = express.Router();
const { getReports, getDashboardData } = require('../controllers/reportsController');
const { validateReportQuery } = require('../middleware/validation');

// @route   GET /api/reports
// @desc    Get comprehensive reports
// @access  Public
router.get('/', validateReportQuery, getReports);

// @route   GET /api/reports/dashboard
// @desc    Get dashboard summary data
// @access  Public
router.get('/dashboard', getDashboardData);

module.exports = router;
