const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorPayment,
  getVendorStats,
  getVendorTripHistory
} = require('../controllers/vendorController');
const { validateVendor, validateObjectId, validatePayment } = require('../middleware/validation');

// @route   GET /api/vendors
// @desc    Get all vendors
// @access  Public
router.get('/', getVendors);

// @route   GET /api/vendors/stats/overview
// @desc    Get vendor statistics
// @access  Public
router.get('/stats/overview', getVendorStats);

// @route   GET /api/vendors/:id
// @desc    Get single vendor
// @access  Public
router.get('/:id', validateObjectId, getVendor);

// @route   GET /api/vendors/:id/trips
// @desc    Get vendor trip history
// @access  Public
router.get('/:id/trips', validateObjectId, getVendorTripHistory);

// @route   POST /api/vendors
// @desc    Create new vendor
// @access  Public
router.post('/', validateVendor, createVendor);

// @route   PUT /api/vendors/:id
// @desc    Update vendor
// @access  Public
router.put('/:id', validateObjectId, validateVendor, updateVendor);

// @route   PATCH /api/vendors/:id/payment
// @desc    Update vendor payment
// @access  Public
router.patch('/:id/payment', validateObjectId, validatePayment, updateVendorPayment);

// @route   DELETE /api/vendors/:id
// @desc    Delete vendor
// @access  Public
router.delete('/:id', validateObjectId, deleteVendor);

module.exports = router;
