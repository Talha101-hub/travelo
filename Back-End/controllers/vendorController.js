const Vendor = require('../models/Vendor');
const { validationResult } = require('express-validator');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
const getVendors = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { vendorId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vendors',
      error: error.message
    });
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Public
const getVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select('-__v');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vendor',
      error: error.message
    });
  }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Public
const createVendor = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const vendor = await Vendor.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field: field
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating vendor',
      error: error.message
    });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Public
const updateVendor = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field: field
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating vendor',
      error: error.message
    });
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Public
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting vendor',
      error: error.message
    });
  }
};

// @desc    Update vendor payment
// @route   PATCH /api/vendors/:id/payment
// @access  Public
const updateVendorPayment = async (req, res) => {
  try {
    const { paymentAmount } = req.body;

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update payment
    vendor.payments += paymentAmount;
    
    // Update status based on payment
    if (vendor.payments >= vendor.paymentAsked) {
      vendor.status = 'paid';
    } else if (vendor.payments > 0) {
      vendor.status = 'active';
    }

    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error updating vendor payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment',
      error: error.message
    });
  }
};

// @desc    Get vendor statistics
// @route   GET /api/vendors/stats/overview
// @access  Public
const getVendorStats = async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ status: 'active' });
    const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
    const paidVendors = await Vendor.countDocuments({ status: 'paid' });

    // Calculate payment statistics
    const paymentStats = await Vendor.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: '$payments' },
          totalPaymentAsked: { $sum: '$paymentAsked' },
          totalOutstanding: { 
            $sum: { 
              $subtract: ['$paymentAsked', '$payments'] 
            } 
          },
          avgPayment: { $avg: '$payments' },
          avgPaymentAsked: { $avg: '$paymentAsked' }
        }
      }
    ]);

    // Get vendors with outstanding payments
    const outstandingVendors = await Vendor.find({
      $expr: { $gt: ['$paymentAsked', '$payments'] }
    }).select('name vendorId outstandingBalance paymentStatus');

    res.status(200).json({
      success: true,
      data: {
        totalVendors,
        activeVendors,
        pendingVendors,
        paidVendors,
        paymentStats: paymentStats[0] || {},
        outstandingVendors
      }
    });
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vendor statistics',
      error: error.message
    });
  }
};

module.exports = {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorPayment,
  getVendorStats
};
