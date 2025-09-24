const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverStats,
  getDriverTripHistory
} = require('../controllers/driverController');
const { validateDriver, validateObjectId } = require('../middleware/validation');

// @route   GET /api/drivers
// @desc    Get all drivers
// @access  Public
router.get('/', getDrivers);

// @route   GET /api/drivers/stats/overview
// @desc    Get driver statistics
// @access  Public
router.get('/stats/overview', getDriverStats);

// @route   GET /api/drivers/:id
// @desc    Get single driver
// @access  Public
router.get('/:id', validateObjectId, getDriver);

// @route   GET /api/drivers/:id/trips
// @desc    Get driver trip history
// @access  Public
router.get('/:id/trips', validateObjectId, getDriverTripHistory);

// @route   POST /api/drivers
// @desc    Create new driver
// @access  Public
router.post('/', validateDriver, createDriver);

// @route   PUT /api/drivers/:id
// @desc    Update driver
// @access  Public
router.put('/:id', validateObjectId, validateDriver, updateDriver);

// @route   DELETE /api/drivers/:id
// @desc    Delete driver
// @access  Public
router.delete('/:id', validateObjectId, deleteDriver);

module.exports = router;