const CarMaintenance = require('../models/CarMaintenance');
const { validationResult } = require('express-validator');

// @desc    Get all car maintenance records
// @route   GET /api/maintenance
// @access  Public
const getCarMaintenance = async (req, res) => {
  try {
    const { search, status, carNumber, maintenanceType } = req.query;
    let query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { carNumber: { $regex: search, $options: 'i' } },
        { carModel: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { serviceProvider: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add car number filter
    if (carNumber) {
      query.carNumber = { $regex: carNumber, $options: 'i' };
    }

    // Add maintenance type filter
    if (maintenanceType) {
      query.maintenanceType = maintenanceType;
    }

    const maintenanceRecords = await CarMaintenance.find(query)
      .sort({ maintenanceDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: maintenanceRecords.length,
      data: maintenanceRecords
    });
  } catch (error) {
    console.error('Error fetching car maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching maintenance records',
      error: error.message
    });
  }
};

// @desc    Get single car maintenance record
// @route   GET /api/maintenance/:id
// @access  Public
const getCarMaintenanceRecord = async (req, res) => {
  try {
    const record = await CarMaintenance.findById(req.params.id).select('-__v');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching maintenance record',
      error: error.message
    });
  }
};

// @desc    Create new car maintenance record
// @route   POST /api/maintenance
// @access  Public
const createCarMaintenance = async (req, res) => {
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

    const maintenanceRecord = await CarMaintenance.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenanceRecord
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating maintenance record',
      error: error.message
    });
  }
};

// @desc    Update car maintenance record
// @route   PUT /api/maintenance/:id
// @access  Public
const updateCarMaintenance = async (req, res) => {
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

    const record = await CarMaintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: record
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating maintenance record',
      error: error.message
    });
  }
};

// @desc    Delete car maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Public
const deleteCarMaintenance = async (req, res) => {
  try {
    const record = await CarMaintenance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully',
      data: record
    });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting maintenance record',
      error: error.message
    });
  }
};

// @desc    Update maintenance status
// @route   PATCH /api/maintenance/:id/status
// @access  Public
const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['scheduled', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be scheduled, in-progress, or completed'
      });
    }

    const record = await CarMaintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Maintenance status updated successfully',
      data: record
    });
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating maintenance status',
      error: error.message
    });
  }
};

// @desc    Get maintenance by car number
// @route   GET /api/maintenance/car/:carNumber
// @access  Public
const getMaintenanceByCar = async (req, res) => {
  try {
    const { carNumber } = req.params;
    const { status } = req.query;

    let query = { carNumber: { $regex: carNumber, $options: 'i' } };
    if (status) {
      query.status = status;
    }

    const records = await CarMaintenance.find(query)
      .sort({ maintenanceDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching maintenance by car:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching maintenance by car',
      error: error.message
    });
  }
};

// @desc    Get upcoming maintenance
// @route   GET /api/maintenance/upcoming
// @access  Public
const getUpcomingMaintenance = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const upcomingMaintenance = await CarMaintenance.find({
      maintenanceDate: {
        $gte: new Date(),
        $lte: futureDate
      },
      status: { $in: ['scheduled', 'in-progress'] }
    })
    .sort({ maintenanceDate: 1 })
    .select('-__v');

    res.status(200).json({
      success: true,
      count: upcomingMaintenance.length,
      data: upcomingMaintenance
    });
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming maintenance',
      error: error.message
    });
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats/overview
// @access  Public
const getMaintenanceStats = async (req, res) => {
  try {
    const totalRecords = await CarMaintenance.countDocuments();
    const scheduledRecords = await CarMaintenance.countDocuments({ status: 'scheduled' });
    const inProgressRecords = await CarMaintenance.countDocuments({ status: 'in-progress' });
    const completedRecords = await CarMaintenance.countDocuments({ status: 'completed' });

    // Calculate cost statistics
    const costStats = await CarMaintenance.aggregate([
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          avgCost: { $avg: '$cost' },
          maxCost: { $max: '$cost' },
          minCost: { $min: '$cost' }
        }
      }
    ]);

    // Calculate maintenance by type
    const maintenanceByType = await CarMaintenance.aggregate([
      {
        $group: {
          _id: '$maintenanceType',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get unique cars maintained
    const uniqueCars = await CarMaintenance.distinct('carNumber');

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        scheduledRecords,
        inProgressRecords,
        completedRecords,
        costStats: costStats[0] || {},
        maintenanceByType,
        uniqueCarsCount: uniqueCars.length,
        uniqueCars
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching maintenance statistics',
      error: error.message
    });
  }
};

module.exports = {
  getCarMaintenance,
  getCarMaintenanceRecord,
  createCarMaintenance,
  updateCarMaintenance,
  deleteCarMaintenance,
  updateMaintenanceStatus,
  getMaintenanceByCar,
  getUpcomingMaintenance,
  getMaintenanceStats
};
