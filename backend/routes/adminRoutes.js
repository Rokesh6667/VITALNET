const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getHospitalsList,
  getUsersList,
  getBookingsList,
  getAnalytics,
  approveHospital,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Lock down all routes to admin only
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);
router.get('/hospitals', getHospitalsList);
router.get('/users', getUsersList);
router.get('/bookings', getBookingsList);
router.get('/analytics', getAnalytics);
router.put('/approve-hospital/:id', approveHospital);

module.exports = router;
