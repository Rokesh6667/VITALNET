const Hospital = require('../models/Hospital');
const Resource = require('../models/Resource');
const { emitToAll } = require('../sockets/socketHandler');

// @desc    Get all approved hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find({ approvalStatus: 'approved' });
    const hospitalsWithResources = await Promise.all(
      hospitals.map(async (hospital) => {
        const resources = await Resource.findOne({ hospitalId: hospital._id });
        return {
          ...hospital._doc,
          resources: resources || {
            availableBeds: 0,
            availableICUBeds: 0,
            availableVentilators: 0,
            totalBeds: 0,
            totalICUBeds: 0,
            totalVentilators: 0
          }
        };
      })
    );
    res.json(hospitalsWithResources);
  } catch (error) {
    next(error);
  }
};

// @desc    Get hospital details by ID
// @route   GET /api/hospitals/:id
// @access  Public
const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      res.status(404);
      throw new Error('Hospital not found');
    }

    const resources = await Resource.findOne({ hospitalId: hospital._id });

    res.json({
      hospital,
      resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby approved hospitals
// @route   GET /api/hospitals/nearby
// @access  Public
const getNearbyHospitals = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance } = req.query;

    if (!lat || !lng) {
      res.status(400);
      throw new Error('Please provide lat and lng coordinates');
    }

    // Default max distance to 10 km (10000 meters)
    const distanceLimit = parseFloat(maxDistance) || 10000;

    const hospitals = await Hospital.find({
      approvalStatus: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: distanceLimit,
        },
      },
    });

    res.json(hospitals);
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital resources
// @route   PUT /api/hospitals/resources
// @access  Private (Hospital role only)
const updateResources = async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });

    if (!hospital) {
      res.status(404);
      throw new Error('Hospital profile not found for this user');
    }

    const {
      totalBeds,
      availableBeds,
      totalICUBeds,
      availableICUBeds,
      totalVentilators,
      availableVentilators,
    } = req.body;

    let resources = await Resource.findOne({ hospitalId: hospital._id });

    if (!resources) {
      resources = new Resource({ hospitalId: hospital._id });
    }

    if (totalBeds !== undefined) resources.totalBeds = totalBeds;
    if (availableBeds !== undefined) resources.availableBeds = availableBeds;
    if (totalICUBeds !== undefined) resources.totalICUBeds = totalICUBeds;
    if (availableICUBeds !== undefined) resources.availableICUBeds = availableICUBeds;
    if (totalVentilators !== undefined) resources.totalVentilators = totalVentilators;
    if (availableVentilators !== undefined) resources.availableVentilators = availableVentilators;

    await resources.save();

    // Socket.IO Emit: resourceUpdated
    emitToAll('resourceUpdated', {
      hospitalId: hospital._id,
      hospitalName: hospital.hospitalName,
      resources,
    });

    res.json({
      message: 'Resources updated successfully',
      resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hospital resources
// @route   GET /api/hospitals/resources
// @access  Private (Hospital role only)
const getResources = async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });

    if (!hospital) {
      res.status(404);
      throw new Error('Hospital profile not found for this user');
    }

    const resources = await Resource.findOne({ hospitalId: hospital._id });

    if (!resources) {
      res.status(404);
      throw new Error('Resources not found for this hospital');
    }

    res.json(resources);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  getNearbyHospitals,
  updateResources,
  getResources,
};
