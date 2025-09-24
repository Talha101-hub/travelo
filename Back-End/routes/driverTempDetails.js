const express = require('express');
const router = express.Router();
const {
  getDriverTempDetails,
  getDriverTempDetail,
  createDriverTempDetail,
  updateDriverTempDetail,
  deleteDriverTempDetail
} = require('../controllers/driverTempDetailsController');
const { protect } = require('../middleware/auth');
const { validateDriverTempDetails } = require('../middleware/validation');

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/driver-temp-details - Get all driver temp details
router.get('/', getDriverTempDetails);

// GET /api/driver-temp-details/:id - Get single driver temp detail
router.get('/:id', getDriverTempDetail);

// POST /api/driver-temp-details - Create new driver temp detail
router.post('/', validateDriverTempDetails, createDriverTempDetail);

// PUT /api/driver-temp-details/:id - Update driver temp detail
router.put('/:id', validateDriverTempDetails, updateDriverTempDetail);

// DELETE /api/driver-temp-details/:id - Delete driver temp detail
router.delete('/:id', deleteDriverTempDetail);

module.exports = router;
