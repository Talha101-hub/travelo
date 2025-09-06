const express = require('express');
const router = express.Router();
const {
  getCarMaintenance,
  getCarMaintenanceRecord,
  createCarMaintenance,
  updateCarMaintenance,
  deleteCarMaintenance,
  updateMaintenanceStatus,
  getMaintenanceByCar,
  getUpcomingMaintenance,
  getMaintenanceStats
} = require('../controllers/carMaintenanceController');
const { validateCarMaintenance, validateObjectId, validateStatus } = require('../middleware/validation');

// @route   GET /api/maintenance
// @desc    Get all car maintenance records
// @access  Public
router.get('/', getCarMaintenance);

// @route   GET /api/maintenance/stats/overview
// @desc    Get maintenance statistics
// @access  Public
router.get('/stats/overview', getMaintenanceStats);

// @route   GET /api/maintenance/upcoming
// @desc    Get upcoming maintenance
// @access  Public
router.get('/upcoming', getUpcomingMaintenance);

// @route   GET /api/maintenance/car/:carNumber
// @desc    Get maintenance by car number
// @access  Public
router.get('/car/:carNumber', getMaintenanceByCar);

// @route   GET /api/maintenance/:id
// @desc    Get single maintenance record
// @access  Public
router.get('/:id', validateObjectId, getCarMaintenanceRecord);

// @route   POST /api/maintenance
// @desc    Create new maintenance record
// @access  Public
router.post('/', validateCarMaintenance, createCarMaintenance);

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance record
// @access  Public
router.put('/:id', validateObjectId, validateCarMaintenance, updateCarMaintenance);

// @route   PATCH /api/maintenance/:id/status
// @desc    Update maintenance status
// @access  Public
router.patch('/:id/status', validateObjectId, validateStatus, updateMaintenanceStatus);

// @route   DELETE /api/maintenance/:id
// @desc    Delete maintenance record
// @access  Public
router.delete('/:id', validateObjectId, deleteCarMaintenance);

module.exports = router;
