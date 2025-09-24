const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Driver validation rules
const validateDriver = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Driver name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('carNumber')
    .trim()
    .notEmpty()
    .withMessage('Car number is required')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Please enter a valid car number'),
  
  body('carModel')
    .trim()
    .notEmpty()
    .withMessage('Car model is required')
    .isLength({ max: 50 })
    .withMessage('Car model cannot exceed 50 characters'),
  
  body('akamaNumber')
    .trim()
    .notEmpty()
    .withMessage('Akama number is required')
    .matches(/^\d{10}$/)
    .withMessage('Akama number must be exactly 10 digits'),
  
  body('driverSalary')
    .isNumeric()
    .withMessage('Driver salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Salary cannot be negative'),
  
  body('vendorIds')
    .isArray({ min: 1 })
    .withMessage('At least one vendor must be selected'),
  body('vendorIds.*')
    .isMongoId()
    .withMessage('Each vendor ID must be valid'),
  
  body('driverMeal')
    .optional()
    .isNumeric()
    .withMessage('Driver meal expense must be a number')
    .isFloat({ min: 0 })
    .withMessage('Meal expense cannot be negative'),
  
  body('roomRent')
    .optional()
    .isNumeric()
    .withMessage('Room rent must be a number')
    .isFloat({ min: 0 })
    .withMessage('Room rent cannot be negative'),
  
  body('furtherExpense')
    .optional()
    .isNumeric()
    .withMessage('Further expense must be a number')
    .isFloat({ min: 0 })
    .withMessage('Further expense cannot be negative'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive')
];

// Vendor validation rules
const validateVendor = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Vendor name is required')
    .isLength({ max: 100 })
    .withMessage('Vendor name cannot exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('payments')
    .optional()
    .isNumeric()
    .withMessage('Payments must be a number')
    .isFloat({ min: 0 })
    .withMessage('Payments cannot be negative'),
  
  body('paymentAsked')
    .isNumeric()
    .withMessage('Payment asked must be a number')
    .isFloat({ min: 0 })
    .withMessage('Payment asked cannot be negative'),
  
  body('status')
    .optional()
    .isIn(['active', 'pending', 'paid'])
    .withMessage('Status must be active, pending, or paid'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  
  body('contactPerson')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters')
];

// Trip validation rules
const validateTrip = [
  body('startingPlace')
    .trim()
    .notEmpty()
    .withMessage('Starting place is required')
    .isLength({ max: 100 })
    .withMessage('Starting place cannot exceed 100 characters'),
  
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ max: 100 })
    .withMessage('Destination cannot exceed 100 characters'),
  
  body('budget')
    .isNumeric()
    .withMessage('Budget must be a number')
    .isFloat({ min: 0 })
    .withMessage('Budget cannot be negative'),
  
  body('tripDate')
    .isISO8601()
    .withMessage('Trip date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Trip date cannot be in the past');
      }
      return true;
    }),
  
  body('driver')
    .isMongoId()
    .withMessage('Driver must be a valid ObjectId'),
  
  body('vendors')
    .isArray({ min: 1 })
    .withMessage('At least one vendor must be selected'),
  body('vendors.*')
    .isMongoId()
    .withMessage('Each vendor must be a valid ObjectId'),
  
  body('carNumber')
    .trim()
    .notEmpty()
    .withMessage('Car number is required'),
  
  body('status')
    .optional()
    .isIn(['pending', 'ongoing', 'complete'])
    .withMessage('Status must be pending, ongoing, or complete'),
  
  body('actualCost')
    .optional()
    .isNumeric()
    .withMessage('Actual cost must be a number')
    .isFloat({ min: 0 })
    .withMessage('Actual cost cannot be negative'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Car Maintenance validation rules
const validateCarMaintenance = [
  body('carNumber')
    .trim()
    .notEmpty()
    .withMessage('Car number is required')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Please enter a valid car number'),
  
  body('carModel')
    .trim()
    .notEmpty()
    .withMessage('Car model is required')
    .isLength({ max: 50 })
    .withMessage('Car model cannot exceed 50 characters'),
  
  body('maintenanceDate')
    .isISO8601()
    .withMessage('Maintenance date must be a valid date'),
  
  body('cost')
    .isNumeric()
    .withMessage('Cost must be a number')
    .isFloat({ min: 0 })
    .withMessage('Cost cannot be negative'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('maintenanceType')
    .optional()
    .isIn(['routine', 'repair', 'inspection', 'emergency'])
    .withMessage('Maintenance type must be routine, repair, inspection, or emergency'),
  
  body('serviceProvider')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Service provider name cannot exceed 100 characters'),
  
  body('nextMaintenanceDate')
    .optional()
    .isISO8601()
    .withMessage('Next maintenance date must be a valid date'),
  
  body('mileage')
    .optional()
    .isNumeric()
    .withMessage('Mileage must be a number')
    .isFloat({ min: 0 })
    .withMessage('Mileage cannot be negative'),
  
  body('status')
    .optional()
    .isIn(['scheduled', 'in-progress', 'completed'])
    .withMessage('Status must be scheduled, in-progress, or completed')
];

// ID validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Payment validation
const validatePayment = [
  body('paymentAmount')
    .isNumeric()
    .withMessage('Payment amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0')
];

// Status validation
const validateStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'ongoing', 'complete', 'scheduled', 'in-progress', 'completed', 'active', 'inactive', 'paid'])
    .withMessage('Invalid status value')
];

// Query validation for reports
const validateReportQuery = [
  query('period')
    .optional()
    .isIn(['weekly', '15days', 'monthly', 'yearly'])
    .withMessage('Period must be weekly, 15days, monthly, or yearly'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

// User validation rules
const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'dispatcher', 'viewer'])
    .withMessage('Role must be admin, dispatcher, or viewer')
];

// Login validation rules
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

// Driver temp details validation rules
const validateDriverTempDetails = [
  body('driverId')
    .isMongoId()
    .withMessage('Please provide a valid driver ID'),
  body('driverMeal')
    .isNumeric()
    .withMessage('Driver meal expense must be a number')
    .isFloat({ min: 0 })
    .withMessage('Driver meal expense cannot be negative'),
  body('roomRent')
    .isNumeric()
    .withMessage('Room rent must be a number')
    .isFloat({ min: 0 })
    .withMessage('Room rent cannot be negative'),
  body('furtherExpense')
    .isNumeric()
    .withMessage('Further expense must be a number')
    .isFloat({ min: 0 })
    .withMessage('Further expense cannot be negative'),
  body('month')
    .isIn(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
    .withMessage('Please provide a valid month'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be pending, approved, or rejected'),
  handleValidationErrors
];

module.exports = {
  validateDriver,
  validateVendor,
  validateTrip,
  validateCarMaintenance,
  validateObjectId,
  validatePayment,
  validateStatus,
  validateReportQuery,
  validateUser,
  validateLogin,
  validateDriverTempDetails
};
