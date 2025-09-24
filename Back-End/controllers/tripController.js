const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const { validationResult } = require('express-validator');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
const getTrips = async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    let query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { startingPlace: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { carNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add date range filter
    if (startDate || endDate) {
      query.tripDate = {};
      if (startDate) {
        query.tripDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.tripDate.$lte = new Date(endDate);
      }
    }

    const trips = await Trip.find(query)
      .populate('driver', 'name carNumber akamaNumber')
      .populate('vendors', 'name email phone')
      .sort({ tripDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trips',
      error: error.message
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Public
const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('driver', 'name carNumber akamaNumber driverSalary')
      .populate('vendors', 'name email phone')
      .select('-__v');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip',
      error: error.message
    });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Public
const createTrip = async (req, res) => {
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

    // Verify driver and vendors exist
    const driver = await Driver.findById(req.body.driver);
    
    if (!driver) {
      return res.status(400).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Verify all vendors exist
    if (req.body.vendors && req.body.vendors.length > 0) {
      const vendors = await Vendor.find({ _id: { $in: req.body.vendors } });
      if (vendors.length !== req.body.vendors.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more vendors not found'
        });
      }
    }

    // Check if driver is available (not on another ongoing trip)
    const existingTrip = await Trip.findOne({
      driver: req.body.driver,
      status: 'ongoing'
    });

    if (existingTrip) {
      return res.status(400).json({
        success: false,
        message: 'Driver is already on an ongoing trip'
      });
    }

    const trip = await Trip.create(req.body);

    // Auto-update driver's vendor list with new vendors from this trip
    if (req.body.vendors && req.body.vendors.length > 0) {
      await Driver.findByIdAndUpdate(
        req.body.driver,
        {
          $addToSet: { vendorIds: { $each: req.body.vendors } }
        },
        { new: true }
      );
      console.log(`Auto-linked driver ${req.body.driver} to vendors: ${req.body.vendors.join(', ')}`);
    }

    // Populate the created trip
    const populatedTrip = await Trip.findById(trip._id)
      .populate('driver', 'name carNumber akamaNumber')
      .populate('vendors', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: populatedTrip
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating trip',
      error: error.message
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Public
const updateTrip = async (req, res) => {
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

    // Get the original trip to check if status changed
    const originalTrip = await Trip.findById(req.params.id);
    
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('driver', 'name carNumber akamaNumber')
    .populate('vendors', 'name email phone')
    .select('-__v');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Auto-update driver's vendor list with new vendors from this trip update
    if (req.body.vendors && req.body.vendors.length > 0 && trip.driver) {
      await Driver.findByIdAndUpdate(
        trip.driver._id,
        {
          $addToSet: { vendorIds: { $each: req.body.vendors } }
        },
        { new: true }
      );
      console.log(`Auto-linked driver ${trip.driver._id} to vendors: ${req.body.vendors.join(', ')}`);
    }

    // Emit socket events if status changed
    const io = req.app.get('io');
    if (io && originalTrip && originalTrip.status !== trip.status) {
      io.to('trips').emit('trip:updated', trip);
      
      // If trip is completed, emit driver update event
      if (trip.status === 'complete' && trip.driver) {
        // Get updated driver with trip count
        const driver = await Driver.findById(trip.driver._id)
          .populate('vendorIds', 'name contactPerson');
        
        const completedTrips = await Trip.countDocuments({ 
          driver: trip.driver._id, 
          status: 'complete' 
        });
        
        const driverWithStats = {
          ...driver.toObject(),
          completedTrips
        };
        
        console.log(`Emitting driver:updated event for driver ${trip.driver._id} with ${completedTrips} completed trips`);
        io.to('drivers').emit('driver:updated', driverWithStats);
        console.log(`Number of clients in drivers room: ${io.sockets.adapter.rooms.get('drivers')?.size || 0}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: trip
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating trip',
      error: error.message
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Public
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
      data: trip
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting trip',
      error: error.message
    });
  }
};

// @desc    Update trip status
// @route   PATCH /api/trips/:id/status
// @access  Public
const updateTripStatus = async (req, res) => {
  try {
    const { status, actualCost, notes } = req.body;

    if (!['pending', 'ongoing', 'complete'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, ongoing, or complete'
      });
    }

    const updateData = { status };
    if (actualCost !== undefined) updateData.actualCost = actualCost;
    if (notes) updateData.notes = notes;

    // Get the original trip to check if status changed
    const originalTrip = await Trip.findById(req.params.id);
    
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('driver', 'name carNumber akamaNumber')
    .populate('vendors', 'name email phone')
    .select('-__v');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Emit socket events if status changed
    const io = req.app.get('io');
    if (io && originalTrip && originalTrip.status !== trip.status) {
      console.log(`Trip status changed from ${originalTrip.status} to ${trip.status}`);
      io.to('trips').emit('trip:updated', trip);
      
      // If trip is completed, emit driver update event
      if (trip.status === 'complete' && trip.driver) {
        console.log(`Trip completed, updating driver ${trip.driver._id}`);
        // Get updated driver with trip count
        const driver = await Driver.findById(trip.driver._id)
          .populate('vendorIds', 'name contactPerson');
        
        const completedTrips = await Trip.countDocuments({ 
          driver: trip.driver._id, 
          status: 'complete' 
        });
        
        const driverWithStats = {
          ...driver.toObject(),
          completedTrips
        };
        
        console.log(`Emitting driver:updated event for driver ${trip.driver._id} with ${completedTrips} completed trips`);
        io.to('drivers').emit('driver:updated', driverWithStats);
        console.log(`Number of clients in drivers room: ${io.sockets.adapter.rooms.get('drivers')?.size || 0}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Trip status updated successfully',
      data: trip
    });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating trip status',
      error: error.message
    });
  }
};

// @desc    Get pending trips
// @route   GET /api/trips/pending
// @access  Public
const getPendingTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ status: 'pending' })
      .populate('driver', 'name carNumber akamaNumber')
      .populate('vendors', 'name email phone')
      .sort({ tripDate: 1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error('Error fetching pending trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending trips',
      error: error.message
    });
  }
};

// @desc    Get completed trips
// @route   GET /api/trips/completed
// @access  Public
const getCompletedTrips = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: 'complete' };

    // Add date range filter
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) {
        query.completedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.completedAt.$lte = new Date(endDate);
      }
    }

    const trips = await Trip.find(query)
      .populate('driver', 'name carNumber akamaNumber')
      .populate('vendors', 'name email phone')
      .sort({ completedAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error('Error fetching completed trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching completed trips',
      error: error.message
    });
  }
};

// @desc    Get trip statistics
// @route   GET /api/trips/stats/overview
// @access  Public
const getTripStats = async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const pendingTrips = await Trip.countDocuments({ status: 'pending' });
    const ongoingTrips = await Trip.countDocuments({ status: 'ongoing' });
    const completedTrips = await Trip.countDocuments({ status: 'complete' });

    // Calculate revenue statistics
    const revenueStats = await Trip.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalActualCost: { $sum: '$actualCost' },
          avgBudget: { $avg: '$budget' },
          avgActualCost: { $avg: '$actualCost' },
          totalProfit: { 
            $sum: { 
              $subtract: ['$budget', '$actualCost'] 
            } 
          }
        }
      }
    ]);

    // Get recent trips
    const recentTrips = await Trip.find()
      .populate('driver', 'name')
      .populate('vendors', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('startingPlace destination budget status createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalTrips,
        pendingTrips,
        ongoingTrips,
        completedTrips,
        revenueStats: revenueStats[0] || {},
        recentTrips
      }
    });
  } catch (error) {
    console.error('Error fetching trip stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip statistics',
      error: error.message
    });
  }
};

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  getPendingTrips,
  getCompletedTrips,
  getTripStats
};
