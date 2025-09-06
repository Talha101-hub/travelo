const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    unique: true,
    default: function() {
      return 'V' + String(this._id).slice(-6).toUpperCase();
    }
  },
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  payments: {
    type: Number,
    default: 0,
    min: [0, 'Payments cannot be negative']
  },
  paymentAsked: {
    type: Number,
    required: [true, 'Payment asked amount is required'],
    min: [0, 'Payment asked cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'paid'],
    default: 'active'
  },
  
  // Additional fields
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters']
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
vendorSchema.index({ email: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ vendorId: 1 });

// Virtual for outstanding balance
vendorSchema.virtual('outstandingBalance').get(function() {
  return this.paymentAsked - this.payments;
});

// Virtual for payment status
vendorSchema.virtual('paymentStatus').get(function() {
  if (this.payments >= this.paymentAsked) return 'fully_paid';
  if (this.payments > 0) return 'partially_paid';
  return 'unpaid';
});

// Ensure virtual fields are serialized
vendorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Vendor', vendorSchema);
