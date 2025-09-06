const mongoose = require('mongoose');

const carMaintenanceSchema = new mongoose.Schema({
  carNumber: {
    type: String,
    required: [true, 'Car number is required'],
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
  maintenanceDate: {
    type: Date,
    required: [true, 'Maintenance date is required']
  },
  cost: {
    type: Number,
    required: [true, 'Maintenance cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Additional maintenance details
  maintenanceType: {
    type: String,
    enum: ['routine', 'repair', 'inspection', 'emergency'],
    default: 'routine'
  },
  serviceProvider: {
    type: String,
    trim: true,
    maxlength: [100, 'Service provider name cannot exceed 100 characters']
  },
  nextMaintenanceDate: {
    type: Date
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed'],
    default: 'scheduled'
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
carMaintenanceSchema.index({ carNumber: 1 });
carMaintenanceSchema.index({ maintenanceDate: 1 });
carMaintenanceSchema.index({ status: 1 });
carMaintenanceSchema.index({ maintenanceType: 1 });

// Virtual for days since maintenance
carMaintenanceSchema.virtual('daysSinceMaintenance').get(function() {
  if (this.status === 'completed') {
    return Math.ceil((new Date() - this.maintenanceDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtual fields are serialized
carMaintenanceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('CarMaintenance', carMaintenanceSchema);
