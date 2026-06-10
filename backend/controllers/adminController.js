const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const Ambulance = require('../models/Ambulance');
const Notification = require('../models/Notification');
const { emitToRoom } = require('../sockets/socketHandler');

// @desc    Get dashboard summary statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin role only)
const getDashboard = async (req, res, next) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAmbulances = await Ambulance.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Summing up resources across all hospitals
    const resourceAgg = await Resource.aggregate([
      {
        $group: {
          _id: null,
          availableBeds: { $sum: '$availableBeds' },
          availableICUBeds: { $sum: '$availableICUBeds' },
          availableVentilators: { $sum: '$availableVentilators' },
        },
      },
    ]);

    const resourceSummary = resourceAgg[0] || {
      availableBeds: 0,
      availableICUBeds: 0,
      availableVentilators: 0,
    };

    // Calculate emergency bookings today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const emergencyRequestsToday = await Booking.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    // Booking Trends grouping by date
    const bookingTrends = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalHospitals,
      totalPatients,
      totalAmbulances,
      totalBookings,
      availableBeds: resourceSummary.availableBeds,
      availableICUBeds: resourceSummary.availableICUBeds,
      availableVentilators: resourceSummary.availableVentilators,
      emergencyRequestsToday,
      bookingTrends,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hospitals
// @route   GET /api/admin/hospitals
// @access  Private (Admin role only)
const getHospitalsList = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find()
      .populate('userId', 'name email phoneNumber')
      .sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin role only)
const getUsersList = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin role only)
const getBookingsList = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('patientId', 'name email phoneNumber')
      .populate('hospitalId', 'hospitalName address city phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics metrics
// @route   GET /api/admin/analytics
// @access  Private (Admin role only)
const getAnalytics = async (req, res, next) => {
  try {
    // Advanced aggregations: hospital-by-hospital resource analytics
    const hospitalResources = await Hospital.aggregate([
      {
        $lookup: {
          from: 'resources',
          localField: '_id',
          foreignField: 'hospitalId',
          as: 'resourceDetails',
        },
      },
      { $unwind: { path: '$resourceDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          hospitalName: 1,
          city: 1,
          approvalStatus: 1,
          availableBeds: { $ifNull: ['$resourceDetails.availableBeds', 0] },
          availableICUBeds: { $ifNull: ['$resourceDetails.availableICUBeds', 0] },
          availableVentilators: { $ifNull: ['$resourceDetails.availableVentilators', 0] },
        },
      },
    ]);

    // Booking distributions by type
    const bookingDistribution = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingType',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      hospitalResources,
      bookingDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject a hospital
// @route   PUT /api/admin/approve-hospital/:id
// @access  Private (Admin role only)
const approveHospital = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Please provide a valid approval status (approved or rejected)');
    }

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      res.status(404);
      throw new Error('Hospital not found');
    }

    hospital.approvalStatus = status;
    await hospital.save();

    // Notify the Hospital User
    const notification = await Notification.create({
      userId: hospital.userId,
      title: `Registration Status Update`,
      message: `Your hospital registration request has been ${status}.`,
    });

    emitToRoom(hospital.userId.toString(), 'notificationReceived', notification);

    res.json({
      message: `Hospital registration has been ${status}`,
      hospital,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getHospitalsList,
  getUsersList,
  getBookingsList,
  getAnalytics,
  approveHospital,
};
