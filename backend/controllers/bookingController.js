const Booking = require('../models/Booking');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const { emitToRoom, emitToAll } = require('../sockets/socketHandler');

// Helper to validate and manage resource counts
const getResourceField = (type) => {
  if (type === 'bed') return 'availableBeds';
  if (type === 'ICU') return 'availableICUBeds';
  if (type === 'ventilator') return 'availableVentilators';
  return null;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Patient role)
const createBooking = async (req, res, next) => {
  try {
    const { hospitalId, bookingType, patientCondition } = req.body;

    if (!hospitalId || !bookingType || !patientCondition) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      res.status(404);
      throw new Error('Hospital not found');
    }

    // Verify resource availability first
    const resources = await Resource.findOne({ hospitalId });
    const resourceField = getResourceField(bookingType);
    
    if (!resources || !resourceField || resources[resourceField] <= 0) {
      res.status(400);
      throw new Error(`No available ${bookingType}s at this hospital`);
    }

    const booking = await Booking.create({
      patientId: req.user._id,
      hospitalId,
      bookingType,
      bookingStatus: 'pending',
      patientCondition,
    });

    // Notify Hospital User and Admin
    const notification = await Notification.create({
      userId: hospital.userId,
      title: 'New Resource Booking Request',
      message: `A new request for ${bookingType} booking has been received.`,
    });

    // Real-time events
    emitToRoom(hospital._id.toString(), 'bookingCreated', booking);
    emitToRoom('admin', 'bookingCreated', booking);
    emitToRoom(hospital.userId.toString(), 'notificationReceived', notification);

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings
// @route   GET /api/bookings
// @access  Private (Patient, Hospital, Admin)
const getBookings = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query = { patientId: req.user._id };
    } else if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      if (hospital) {
        query = { hospitalId: hospital._id };
      } else {
        return res.json([]);
      }
    }
    // Admins see all bookings

    const bookings = await Booking.find(query)
      .populate('patientId', 'name email phoneNumber')
      .populate('hospitalId', 'hospitalName address city phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('patientId', 'name email phoneNumber')
      .populate('hospitalId', 'hospitalName address city phone');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Authorization checks
    if (req.user.role === 'patient' && booking.patientId._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this booking');
    }

    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      if (!hospital || booking.hospitalId._id.toString() !== hospital._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this booking');
      }
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (approve, reject, complete)
// @route   PUT /api/bookings/:id/status
// @access  Private (Hospital, Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status option');
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Authorization check
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      if (!hospital || booking.hospitalId.toString() !== hospital._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to modify this booking');
      }
    }

    const previousStatus = booking.bookingStatus;

    if (previousStatus === status) {
      return res.json(booking);
    }

    // Handle resource modifications based on state transitions
    const resources = await Resource.findOne({ hospitalId: booking.hospitalId });
    const resourceField = getResourceField(booking.bookingType);

    if (resources && resourceField) {
      // 1. Going from non-approved/completed to APPROVED -> Decrement resources
      if (status === 'approved' && previousStatus !== 'approved') {
        if (resources[resourceField] <= 0) {
          res.status(400);
          throw new Error(`No available ${booking.bookingType}s remaining to approve booking`);
        }
        resources[resourceField] -= 1;
      }
      
      // 2. Going from APPROVED to REJECTED/COMPLETED -> Increment resources back
      if (previousStatus === 'approved' && (status === 'rejected' || status === 'completed')) {
        resources[resourceField] += 1;
      }

      await resources.save();
      
      // Emit resource updates
      const hospitalData = await Hospital.findById(booking.hospitalId);
      emitToAll('resourceUpdated', {
        hospitalId: booking.hospitalId,
        hospitalName: hospitalData ? hospitalData.hospitalName : '',
        resources,
      });
    }

    booking.bookingStatus = status;
    await booking.save();

    // Notify patient
    const patientNotification = await Notification.create({
      userId: booking.patientId,
      title: `Booking Request Update`,
      message: `Your booking request for a ${booking.bookingType} has been ${status}.`,
    });

    emitToRoom(booking.patientId.toString(), 'notificationReceived', patientNotification);

    if (status === 'approved') {
      emitToRoom(booking.patientId.toString(), 'bookingApproved', booking);
      emitToRoom('admin', 'bookingApproved', booking);
    }

    res.json({
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Patient, Admin)
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Patients can only cancel their own pending/approved bookings
    if (req.user.role === 'patient' && booking.patientId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this booking');
    }

    // Revert resources if deleting an approved booking
    if (booking.bookingStatus === 'approved') {
      const resources = await Resource.findOne({ hospitalId: booking.hospitalId });
      const resourceField = getResourceField(booking.bookingType);
      if (resources && resourceField) {
        resources[resourceField] += 1;
        await resources.save();
        
        const hospitalData = await Hospital.findById(booking.hospitalId);
        emitToAll('resourceUpdated', {
          hospitalId: booking.hospitalId,
          hospitalName: hospitalData ? hospitalData.hospitalName : '',
          resources,
        });
      }
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};
