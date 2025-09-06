const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  startingPlace: {
    type: String,
    required: [true, 'Starting place is required'],
    trim: true,
    maxlength: [100, 'Starting place cannot exceed 100 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: [100, 'Destination cannot exceed 100 characters']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  tripDate: {
    type: Date,
    required: [true, 'Trip date is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required']
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  carNumber: {
    type: String,
    required: [true, 'Car number is required'],
    trim: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'ongoing', 'complete'],
    default: 'pending'
  },
  
  // Additional trip details
  actualCost: {
    type: Number,
    default: 0,
    min: [0, 'Actual cost cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  completedAt: {
    type: Date
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
tripSchema.index({ tripDate: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ driver: 1 });
tripSchema.index({ vendor: 1 });
tripSchema.index({ startingPlace: 1, destination: 1 });

// Virtual for trip duration (if completed)
tripSchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return Math.ceil((this.completedAt - this.createdAt) / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Virtual for profit/loss
tripSchema.virtual('profit').get(function() {
  return this.budget - this.actualCost;
});

// Ensure virtual fields are serialized
tripSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to set completedAt when status changes to complete
tripSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'complete' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);
