const DriverTempDetails = require('../models/DriverTempDetails');
const Driver = require('../models/Driver');

// Get all driver temp details
const getDriverTempDetails = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { driverName: { $regex: search, $options: 'i' } },
          { carNumber: { $regex: search, $options: 'i' } },
          { month: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const tempDetails = await DriverTempDetails.find(query)
      .sort({ createdAt: -1 })
      .populate('driverId', 'name carNumber');

    res.status(200).json({
      success: true,
      data: tempDetails
    });
  } catch (error) {
    console.error('Error fetching driver temp details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching driver temp details',
      error: error.message
    });
  }
};

// Get single driver temp detail
const getDriverTempDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tempDetail = await DriverTempDetails.findById(id)
      .populate('driverId', 'name carNumber');

    if (!tempDetail) {
      return res.status(404).json({
        success: false,
        message: 'Driver temp detail not found'
      });
    }

    res.status(200).json({
      success: true,
      data: tempDetail
    });
  } catch (error) {
    console.error('Error fetching driver temp detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching driver temp detail',
      error: error.message
    });
  }
};

// Create new driver temp detail
const createDriverTempDetail = async (req, res) => {
  try {
    const { driverId, driverMeal, roomRent, furtherExpense, month, year, status } = req.body;

    // Get driver details
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if temp detail already exists for this driver for this month/year
    const existingDetail = await DriverTempDetails.findOne({
      driverId,
      month,
      year
    });

    if (existingDetail) {
      return res.status(400).json({
        success: false,
        message: 'Temp detail already exists for this driver for this month and year'
      });
    }

    const tempDetail = new DriverTempDetails({
      driverId,
      driverName: driver.name,
      carNumber: driver.carNumber,
      driverMeal,
      roomRent,
      furtherExpense,
      month,
      year,
      status: status || 'pending'
    });

    await tempDetail.save();

    res.status(201).json({
      success: true,
      message: 'Driver temp detail created successfully',
      data: tempDetail
    });
  } catch (error) {
    console.error('Error creating driver temp detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating driver temp detail',
      error: error.message
    });
  }
};

// Update driver temp detail
const updateDriverTempDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverMeal, roomRent, furtherExpense, month, year, status } = req.body;

    const tempDetail = await DriverTempDetails.findById(id);
    if (!tempDetail) {
      return res.status(404).json({
        success: false,
        message: 'Driver temp detail not found'
      });
    }

    // Update fields
    tempDetail.driverMeal = driverMeal;
    tempDetail.roomRent = roomRent;
    tempDetail.furtherExpense = furtherExpense;
    tempDetail.month = month;
    tempDetail.year = year;
    tempDetail.status = status;

    await tempDetail.save();

    res.status(200).json({
      success: true,
      message: 'Driver temp detail updated successfully',
      data: tempDetail
    });
  } catch (error) {
    console.error('Error updating driver temp detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating driver temp detail',
      error: error.message
    });
  }
};

// Delete driver temp detail
const deleteDriverTempDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const tempDetail = await DriverTempDetails.findById(id);
    if (!tempDetail) {
      return res.status(404).json({
        success: false,
        message: 'Driver temp detail not found'
      });
    }

    await DriverTempDetails.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Driver temp detail deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver temp detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting driver temp detail',
      error: error.message
    });
  }
};

module.exports = {
  getDriverTempDetails,
  getDriverTempDetail,
  createDriverTempDetail,
  updateDriverTempDetail,
  deleteDriverTempDetail
};
