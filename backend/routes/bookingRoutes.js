const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect); // All booking routes require authentication

router.route('/')
  .post(authorizeRoles('patient'), createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBookingById)
  .delete(deleteBooking);

router.put('/:id/status', authorizeRoles('hospital', 'admin', 'patient'), updateBookingStatus);

module.exports = router;
