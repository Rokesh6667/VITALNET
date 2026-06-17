const Ambulance = require('../models/Ambulance');
const Hospital = require('../models/Hospital');
const Notification = require('../models/Notification');
const Booking = require('../models/Booking');
const { emitToRoom, emitToAll } = require('../sockets/socketHandler');

// @desc    Request an ambulance
// @route   POST /api/ambulance/request
// @access  Private (Patient role)
const requestAmbulance = async (req, res, next) => {
  try {
    const { hospitalId, latitude, longitude, patientCondition } = req.body;

    if (latitude === undefined || longitude === undefined) {
      res.status(400);
      throw new Error('Please provide your current latitude and longitude coordinates');
    }

    let targetHospitalId = hospitalId;
    const mongoose = require('mongoose');
    if (targetHospitalId && !mongoose.Types.ObjectId.isValid(targetHospitalId)) {
      targetHospitalId = null;
    }

    // If no hospitalId is provided, find the closest approved hospital
    if (!targetHospitalId) {
      const nearby = await Hospital.find({
        approvalStatus: 'approved',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
          },
        },
      }).limit(1);

      if (nearby.length === 0) {
        res.status(404);
        throw new Error('No hospitals nearby to request an ambulance from');
      }

      targetHospitalId = nearby[0]._id;
    }

    // Find an available ambulance at the target hospital
    const ambulance = await Ambulance.findOne({
      hospitalId: targetHospitalId,
      status: 'available',
    });

    if (!ambulance) {
      res.status(404);
      throw new Error('All ambulances for this hospital are currently busy or unavailable');
    }

    // Update status to assigned and link patient
    ambulance.status = 'assigned';
    ambulance.patientId = req.user._id;
    await ambulance.save();

    // Create a Booking record in the database
    const booking = await Booking.create({
      patientId: req.user._id,
      hospitalId: targetHospitalId,
      bookingType: 'ambulance',
      bookingStatus: 'approved',
      patientCondition: patientCondition || 'Emergency Transport',
      ambulanceId: ambulance._id
    });

    // Create notifications for patient and hospital user
    const hospital = await Hospital.findById(targetHospitalId);

    const hospitalNotification = await Notification.create({
      userId: hospital.userId,
      title: 'Ambulance Assigned',
      message: `Ambulance ${ambulance.vehicleNumber} has been assigned to patient ${req.user.name}.`,
    });

    const patientNotification = await Notification.create({
      userId: req.user._id,
      title: 'Ambulance On The Way',
      message: `Ambulance ${ambulance.vehicleNumber} (Driver: ${ambulance.driverName}) has been dispatched.`,
    });

    // Emits
    emitToRoom(targetHospitalId.toString(), 'ambulanceAssigned', ambulance);
    emitToRoom('admin', 'ambulanceAssigned', ambulance);
    emitToRoom(req.user._id.toString(), 'ambulanceAssigned', ambulance);

    emitToRoom(hospital.userId.toString(), 'notificationReceived', hospitalNotification);
    emitToRoom(req.user._id.toString(), 'notificationReceived', patientNotification);

    res.json({
      message: 'Ambulance requested and assigned successfully',
      ambulance,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ambulances
// @route   GET /api/ambulance
// @access  Private
const getAmbulances = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      // Return all ambulances to let patient see available counts across dispatch hubs
      query = {};
    } else if (req.user.role === 'hospital') {
      // Find ambulances belonging to this hospital
      const hospital = await Hospital.findOne({ userId: req.user._id });
      if (hospital) {
        query = { hospitalId: hospital._id };
      } else {
        return res.json([]);
      }
    }
    // Admins see all

    const ambulances = await Ambulance.find(query)
      .populate('hospitalId', 'hospitalName phone address')
      .populate('patientId', 'name phoneNumber');

    res.json(ambulances);
  } catch (error) {
    next(error);
  }
};

// @desc    Update ambulance status
// @route   PUT /api/ambulance/:id/status
// @access  Private (Hospital, Admin)
const updateAmbulanceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['available', 'assigned', 'onRoute', 'in-transit', 'completed'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status option');
    }

    const ambulance = await Ambulance.findById(req.params.id);
    if (!ambulance) {
      res.status(404);
      throw new Error('Ambulance not found');
    }

    // Verify hospital owner
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      if (!hospital || ambulance.hospitalId.toString() !== hospital._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to manage this vehicle');
      }
    }

    const previousPatientId = ambulance.patientId;

    ambulance.status = status;
    if (status === 'available' || status === 'completed') {
      // Clear patient reference when completed or freed
      ambulance.patientId = null;
    }
    await ambulance.save();

    // Notify patient if assigned
    if (previousPatientId) {
      const patientNotification = await Notification.create({
        userId: previousPatientId,
        title: 'Ambulance Status Update',
        message: `Your ambulance status has been changed to ${status}.`,
      });
      emitToRoom(previousPatientId.toString(), 'notificationReceived', patientNotification);
    }

    res.json({
      message: `Ambulance status updated to ${status}`,
      ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ambulance live location
// @route   PUT /api/ambulance/:id/location
// @access  Private (Hospital, Admin)
const updateAmbulanceLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      res.status(400);
      throw new Error('Please provide latitude and longitude coordinates');
    }

    const ambulance = await Ambulance.findById(req.params.id);
    if (!ambulance) {
      res.status(404);
      throw new Error('Ambulance not found');
    }

    // Verify hospital owner
    if (req.user.role === 'hospital') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      if (!hospital || ambulance.hospitalId.toString() !== hospital._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to manage this vehicle');
      }
    }

    ambulance.currentLatitude = parseFloat(latitude);
    ambulance.currentLongitude = parseFloat(longitude);
    await ambulance.save();

    // Socket.IO Emit: ambulanceLocationUpdated
    const locationData = {
      ambulanceId: ambulance._id,
      vehicleNumber: ambulance.vehicleNumber,
      latitude: ambulance.currentLatitude,
      longitude: ambulance.currentLongitude,
      status: ambulance.status,
    };

    emitToRoom(`ambulance_${ambulance._id}`, 'ambulanceLocationUpdated', locationData);
    if (ambulance.patientId) {
      emitToRoom(ambulance.patientId.toString(), 'ambulanceLocationUpdated', locationData);
    }
    emitToRoom('admin', 'ambulanceLocationUpdated', locationData);

    res.json({
      message: 'Ambulance location updated successfully',
      ambulance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new ambulance
// @route   POST /api/ambulance
// @access  Private (Hospital, Admin)
const addAmbulance = async (req, res, next) => {
  try {
    const { vehicleNumber, driverName, driverPhone, currentLatitude, currentLongitude } = req.body;

    if (!vehicleNumber || !driverName || !driverPhone) {
      res.status(400);
      throw new Error('Please enter vehicleNumber, driverName, and driverPhone');
    }

    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      res.status(404);
      throw new Error('Hospital profile not found for this user');
    }

    const ambulance = await Ambulance.create({
      hospitalId: hospital._id,
      vehicleNumber,
      driverName,
      driverPhone,
      currentLatitude: currentLatitude !== undefined ? parseFloat(currentLatitude) : hospital.latitude,
      currentLongitude: currentLongitude !== undefined ? parseFloat(currentLongitude) : hospital.longitude,
      status: 'available',
    });

    res.status(201).json(ambulance);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestAmbulance,
  getAmbulances,
  updateAmbulanceStatus,
  updateAmbulanceLocation,
  addAmbulance,
};
