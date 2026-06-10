const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const { emitToRoom } = require('../sockets/socketHandler');

// @desc    Register a new patient
// @route   POST /api/auth/register-patient
// @access  Public
const registerPatient = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'patient',
      phoneNumber,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new hospital
// @route   POST /api/auth/register-hospital
// @access  Public
const registerHospital = async (req, res, next) => {
  try {
    const {
      hospitalName,
      email,
      password,
      phone,
      address,
      city,
      latitude,
      longitude,
      emergencyAvailable,
    } = req.body;

    if (
      !hospitalName ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !city ||
      latitude === undefined ||
      longitude === undefined
    ) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email already registered');
    }

    // Create the credentials user
    const user = await User.create({
      name: hospitalName,
      email,
      password,
      role: 'hospital',
      phoneNumber: phone,
    });

    // Create the hospital profile
    const hospital = await Hospital.create({
      userId: user._id,
      hospitalName,
      email,
      phone,
      address,
      city,
      latitude,
      longitude,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      emergencyAvailable: emergencyAvailable !== undefined ? emergencyAvailable : true,
      approvalStatus: 'pending',
    });

    // Initialize blank resources for the hospital
    await Resource.create({
      hospitalId: hospital._id,
      totalBeds: 0,
      availableBeds: 0,
      totalICUBeds: 0,
      availableICUBeds: 0,
      totalVentilators: 0,
      availableVentilators: 0,
    });

    // Notify Admins
    const notification = await Notification.create({
      userId: user._id, // Referenced to registering user
      title: 'New Hospital Registration',
      message: `${hospitalName} has registered and is pending approval.`,
    });

    // Emit event to admin room
    emitToRoom('admin', 'notificationReceived', notification);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      hospitalProfile: hospital,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      let hospitalProfile = null;
      if (user.role === 'hospital') {
        hospitalProfile = await Hospital.findOne({ userId: user._id });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id),
        hospitalProfile,
      });
    } else {
      res.status(401);
      throw new Error('Kindly enter the valid email ID and password.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let extraInfo = {};
      if (user.role === 'hospital') {
        const hospital = await Hospital.findOne({ userId: user._id });
        if (hospital) {
          const resources = await Resource.findOne({ hospitalId: hospital._id });
          extraInfo = { hospital, resources };
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        ...extraInfo,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPatient,
  registerHospital,
  login,
  getProfile,
};
