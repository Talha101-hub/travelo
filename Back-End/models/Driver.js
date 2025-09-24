const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  // Permanent Details
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  carNumber: {
    type: String,
    required: [true, 'Car number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'Please enter a valid car number']
  },
  carModel: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true,
    maxlength: [50, 'Car model cannot exceed 50 characters']
  },
  akamaNumber: {
    type: String,
    required: [true, 'Akama number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Akama number must be exactly 10 digits']
  },
  driverSalary: {
    type: Number,
    required: [true, 'Driver salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  vendorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  
  // Temporary Details
  driverMeal: {
    type: Number,
    default: 0,
    min: [0, 'Meal expense cannot be negative']
  },
  roomRent: {
    type: Number,
    default: 0,
    min: [0, 'Room rent cannot be negative']
  },
  furtherExpense: {
    type: Number,
    default: 0,
    min: [0, 'Further expense cannot be negative']
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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
driverSchema.index({ carNumber: 1 });
driverSchema.index({ akamaNumber: 1 });
driverSchema.index({ status: 1 });

// Virtual for total temporary expenses
driverSchema.virtual('totalTemporaryExpenses').get(function() {
  return this.driverMeal + this.roomRent + this.furtherExpense;
});

// Ensure virtual fields are serialized
driverSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);
