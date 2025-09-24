const Trip = require('../models/Trip');
const Driver = require('../models/Driver');
const Vendor = require('../models/Vendor');
const CarMaintenance = require('../models/CarMaintenance');
const DriverTempDetails = require('../models/DriverTempDetails');

// Helper function to get date range based on period
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'weekly':
      start.setDate(now.getDate() - 7);
      break;
    case '15days':
      start.setDate(now.getDate() - 15);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'yearly':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1); // Default to monthly
  }
  
  return { start, end: now };
};

// @desc    Get comprehensive reports
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    
    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    } else {
      dateRange = getDateRange(period);
    }

    // Get trip reports
    const tripReports = await getTripReports(dateRange);
    
    // Get revenue reports
    const revenueReports = await getRevenueReports(dateRange);
    
    // Get expense reports
    const expenseReports = await getExpenseReports(dateRange);
    
    // Get driver reports
    const driverReports = await getDriverReports(dateRange);
    
    // Get vendor reports
    const vendorReports = await getVendorReports(dateRange);
    
    // Get maintenance reports
    const maintenanceReports = await getMaintenanceReports(dateRange);

    res.status(200).json({
      success: true,
      data: {
        period,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        trips: tripReports,
        revenue: revenueReports,
        expenses: expenseReports,
        drivers: driverReports,
        vendors: vendorReports,
        maintenance: maintenanceReports
      }
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating reports',
      error: error.message
    });
  }
};

// @desc    Get trip reports
const getTripReports = async (dateRange) => {
  const tripStats = await Trip.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        pendingTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        ongoingTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
        },
        completedTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] }
        },
        totalBudget: { $sum: '$budget' },
        totalActualCost: { $sum: '$actualCost' },
        avgBudget: { $avg: '$budget' },
        avgActualCost: { $avg: '$actualCost' }
      }
    }
  ]);

  // Get trips by route
  const tripsByRoute = await Trip.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: {
          startingPlace: '$startingPlace',
          destination: '$destination'
        },
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget' },
        avgBudget: { $avg: '$budget' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return {
    ...tripStats[0],
    tripsByRoute
  };
};

// @desc    Get revenue reports
const getRevenueReports = async (dateRange) => {
  const revenueStats = await Trip.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'complete'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$budget' },
        totalActualRevenue: { $sum: '$actualCost' },
        avgRevenue: { $avg: '$budget' },
        totalProfit: {
          $sum: { $subtract: ['$budget', '$actualCost'] }
        }
      }
    }
  ]);

  // Get daily revenue breakdown
  const dailyRevenue = await Trip.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'complete'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$budget' },
        trips: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return {
    ...revenueStats[0],
    dailyRevenue
  };
};

// @desc    Get expense reports
const getExpenseReports = async (dateRange) => {
  // Driver salary expenses
  const driverExpenses = await Driver.aggregate([
    {
      $group: {
        _id: null,
        totalSalary: { $sum: '$driverSalary' },
        totalTempExpenses: { $sum: 0 } // These are now in DriverTempDetails
      }
    }
  ]);

  // Driver temporary expenses
  const driverTempExpenses = await DriverTempDetails.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: null,
        totalTempExpenses: { $sum: '$totalExpense' },
        avgTempExpenses: { $avg: '$totalExpense' },
        tempExpenseCount: { $sum: 1 }
      }
    }
  ]);

  // Maintenance expenses
  const maintenanceExpenses = await CarMaintenance.aggregate([
    {
      $match: {
        maintenanceDate: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'completed' // Only count completed maintenance as actual expense
      }
    },
    {
      $group: {
        _id: null,
        totalMaintenanceCost: { $sum: '$cost' },
        avgMaintenanceCost: { $avg: '$cost' },
        maintenanceCount: { $sum: 1 }
      }
    }
  ]);

  // Vendor payments
  const vendorPayments = await Vendor.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: '$payments' },
        totalPaymentAsked: { $sum: '$paymentAsked' },
        outstandingPayments: {
          $sum: { $subtract: ['$paymentAsked', '$payments'] }
        }
      }
    }
  ]);

  const result = {
    driverExpenses: driverExpenses[0] || {},
    driverTempExpenses: driverTempExpenses[0] || {},
    maintenanceExpenses: maintenanceExpenses[0] || {},
    vendorPayments: vendorPayments[0] || {}
  };
  
  console.log('Expense Reports Debug:', {
    maintenanceExpenses: result.maintenanceExpenses,
    dateRange: dateRange
  });
  
  return result;
};

// @desc    Get driver reports
const getDriverReports = async (dateRange) => {
  const driverStats = await Driver.aggregate([
    {
      $group: {
        _id: null,
        totalDrivers: { $sum: 1 },
        activeDrivers: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        inactiveDrivers: {
          $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
        },
        totalSalary: { $sum: '$driverSalary' },
        avgSalary: { $avg: '$driverSalary' }
      }
    }
  ]);

  // Driver performance (trips completed)
  const driverPerformance = await Trip.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'complete'
      }
    },
    {
      $group: {
        _id: '$driver',
        tripsCompleted: { $sum: 1 },
        totalRevenue: { $sum: '$budget' },
        avgTripValue: { $avg: '$budget' }
      }
    },
    {
      $lookup: {
        from: 'drivers',
        localField: '_id',
        foreignField: '_id',
        as: 'driverInfo'
      }
    },
    {
      $unwind: '$driverInfo'
    },
    {
      $project: {
        driverName: '$driverInfo.name',
        carNumber: '$driverInfo.carNumber',
        tripsCompleted: 1,
        totalRevenue: 1,
        avgTripValue: 1
      }
    },
    { $sort: { tripsCompleted: -1 } },
    { $limit: 10 }
  ]);

  return {
    ...driverStats[0],
    driverPerformance
  };
};

// @desc    Get vendor reports
const getVendorReports = async (dateRange) => {
  const vendorStats = await Vendor.aggregate([
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        activeVendors: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        pendingVendors: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        paidVendors: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        totalPayments: { $sum: '$payments' },
        totalPaymentAsked: { $sum: '$paymentAsked' }
      }
    }
  ]);

  // Vendor performance (trips assigned)
  const vendorPerformance = await Trip.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: '$vendor',
        tripsAssigned: { $sum: 1 },
        totalBudget: { $sum: '$budget' },
        completedTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'complete'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'vendors',
        localField: '_id',
        foreignField: '_id',
        as: 'vendorInfo'
      }
    },
    {
      $unwind: '$vendorInfo'
    },
    {
      $project: {
        vendorName: '$vendorInfo.name',
        vendorId: '$vendorInfo.vendorId',
        tripsAssigned: 1,
        totalBudget: 1,
        completedTrips: 1,
        completionRate: {
          $multiply: [
            { $divide: ['$completedTrips', '$tripsAssigned'] },
            100
          ]
        }
      }
    },
    { $sort: { tripsAssigned: -1 } },
    { $limit: 10 }
  ]);

  return {
    ...vendorStats[0],
    vendorPerformance
  };
};

// @desc    Get maintenance reports
const getMaintenanceReports = async (dateRange) => {
  const maintenanceStats = await CarMaintenance.aggregate([
    {
      $match: {
        maintenanceDate: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'completed' // Only count completed maintenance
      }
    },
    {
      $group: {
        _id: null,
        totalMaintenance: { $sum: 1 },
        scheduledMaintenance: {
          $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
        },
        inProgressMaintenance: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        completedMaintenance: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalCost: { $sum: '$cost' },
        avgCost: { $avg: '$cost' }
      }
    }
  ]);

  // Maintenance by car
  const maintenanceByCar = await CarMaintenance.aggregate([
    {
      $match: {
        maintenanceDate: { $gte: dateRange.start, $lte: dateRange.end },
        status: 'completed' // Only count completed maintenance
      }
    },
    {
      $group: {
        _id: {
          carNumber: '$carNumber',
          carModel: '$carModel'
        },
        maintenanceCount: { $sum: 1 },
        totalCost: { $sum: '$cost' },
        avgCost: { $avg: '$cost' }
      }
    },
    { $sort: { maintenanceCount: -1 } }
  ]);

  const result = {
    ...maintenanceStats[0],
    maintenanceByCar
  };
  
  console.log('Maintenance Reports Debug:', {
    maintenanceStats: result,
    dateRange: dateRange
  });
  
  return result;
};

// @desc    Get summary dashboard data
// @route   GET /api/reports/dashboard
// @access  Public
const getDashboardData = async (req, res) => {
  try {
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Quick stats
    const totalDrivers = await Driver.countDocuments({ status: 'active' });
    const totalTrips = await Trip.countDocuments();
    const ongoingTrips = await Trip.countDocuments({ status: 'ongoing' });
    const totalRevenue = await Trip.aggregate([
      { $match: { status: 'complete' } },
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]);

    // Recent trips
    const recentTrips = await Trip.find()
      .populate('driver', 'name')
      .populate('vendors', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('startingPlace destination budget status createdAt');

    // Upcoming maintenance
    const upcomingMaintenance = await CarMaintenance.find({
      maintenanceDate: { $gte: now },
      status: { $in: ['scheduled', 'in-progress'] }
    })
    .sort({ maintenanceDate: 1 })
    .limit(5)
    .select('carNumber carModel maintenanceDate cost description status');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalDrivers,
          totalTrips,
          ongoingTrips,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentTrips,
        upcomingMaintenance
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: error.message
    });
  }
};

module.exports = {
  getReports,
  getDashboardData
};
