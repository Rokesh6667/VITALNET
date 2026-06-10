const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Please add a hospital name'],
    },
    email: {
      type: String,
      required: [true, 'Please add a hospital email'],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    latitude: {
      type: Number,
      required: [true, 'Please add latitude'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please add longitude'],
    },
    // GeoJSON Point for geospatial queries (nearby hospitals)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    emergencyAvailable: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for location queries
hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);
