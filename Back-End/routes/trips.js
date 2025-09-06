const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  getPendingTrips,
  getCompletedTrips,
  getTripStats
} = require('../controllers/tripController');
const { validateTrip, validateObjectId, validateStatus } = require('../middleware/validation');

// @route   GET /api/trips
// @desc    Get all trips
// @access  Public
router.get('/', getTrips);

// @route   GET /api/trips/stats/overview
// @desc    Get trip statistics
// @access  Public
router.get('/stats/overview', getTripStats);

// @route   GET /api/trips/pending
// @desc    Get pending trips
// @access  Public
router.get('/pending', getPendingTrips);

// @route   GET /api/trips/completed
// @desc    Get completed trips
// @access  Public
router.get('/completed', getCompletedTrips);

// @route   GET /api/trips/:id
// @desc    Get single trip
// @access  Public
router.get('/:id', validateObjectId, getTrip);

// @route   POST /api/trips
// @desc    Create new trip
// @access  Public
router.post('/', validateTrip, createTrip);

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Public
router.put('/:id', validateObjectId, validateTrip, updateTrip);

// @route   PATCH /api/trips/:id/status
// @desc    Update trip status
// @access  Public
router.patch('/:id/status', validateObjectId, validateStatus, updateTripStatus);

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Public
router.delete('/:id', validateObjectId, deleteTrip);

module.exports = router;
