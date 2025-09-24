const mongoose = require('mongoose');

const driverTempDetailsSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver ID is required']
  },
  driverName: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true
  },
  carNumber: {
    type: String,
    required: [true, 'Car number is required'],
    trim: true
  },
  driverMeal: {
    type: Number,
    required: [true, 'Driver meal expense is required'],
    min: [0, 'Meal expense cannot be negative']
  },
  roomRent: {
    type: Number,
    required: [true, 'Room rent is required'],
    min: [0, 'Room rent cannot be negative']
  },
  furtherExpense: {
    type: Number,
    required: [true, 'Further expense is required'],
    min: [0, 'Further expense cannot be negative']
  },
  totalExpense: {
    type: Number,
    default: 0,
    min: [0, 'Total expense cannot be negative']
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later'],
    max: [2030, 'Year must be 2030 or earlier']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
driverTempDetailsSchema.index({ driverId: 1 });
driverTempDetailsSchema.index({ month: 1, year: 1 });
driverTempDetailsSchema.index({ status: 1 });

// Pre-save middleware to calculate total expense
driverTempDetailsSchema.pre('save', function(next) {
  this.totalExpense = this.driverMeal + this.roomRent + this.furtherExpense;
  next();
});

module.exports = mongoose.model('DriverTempDetails', driverTempDetailsSchema);
