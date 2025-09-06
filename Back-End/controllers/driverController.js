const Driver = require('../models/Driver');
const { validationResult } = require('express-validator');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Public
const getDrivers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { carNumber: { $regex: search, $options: 'i' } },
        { akamaNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    const drivers = await Driver.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching drivers',
      error: error.message
    });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Public
const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('-__v');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching driver',
      error: error.message
    });
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Public
const createDriver = async (req, res) => {
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

    const driver = await Driver.create(req.body);

    // Emit WebSocket event
    if (global.emitDriverUpdate) {
      global.emitDriverUpdate('created', driver);
    }

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    
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
      message: 'Server error while creating driver',
      error: error.message
    });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Public
const updateDriver = async (req, res) => {
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

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Emit WebSocket event
    if (global.emitDriverUpdate) {
      global.emitDriverUpdate('updated', driver);
    }

    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    
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
      message: 'Server error while updating driver',
      error: error.message
    });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Public
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Emit WebSocket event
    if (global.emitDriverUpdate) {
      global.emitDriverUpdate('deleted', { id: driver._id });
    }

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting driver',
      error: error.message
    });
  }
};

// @desc    Get driver statistics
// @route   GET /api/drivers/stats/overview
// @access  Public
const getDriverStats = async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ status: 'active' });
    const inactiveDrivers = await Driver.countDocuments({ status: 'inactive' });

    // Calculate total salary expenses
    const salaryStats = await Driver.aggregate([
      {
        $group: {
          _id: null,
          totalSalary: { $sum: '$driverSalary' },
          avgSalary: { $avg: '$driverSalary' },
          maxSalary: { $max: '$driverSalary' },
          minSalary: { $min: '$driverSalary' }
        }
      }
    ]);

    // Calculate total temporary expenses
    const tempExpenseStats = await Driver.aggregate([
      {
        $group: {
          _id: null,
          totalMeal: { $sum: '$driverMeal' },
          totalRoomRent: { $sum: '$roomRent' },
          totalFurtherExpense: { $sum: '$furtherExpense' },
          totalTempExpenses: { 
            $sum: { 
              $add: ['$driverMeal', '$roomRent', '$furtherExpense'] 
            } 
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDrivers,
        activeDrivers,
        inactiveDrivers,
        salaryStats: salaryStats[0] || {},
        tempExpenseStats: tempExpenseStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Error fetching driver stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching driver statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverStats
};
