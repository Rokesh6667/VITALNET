const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Please add a vehicle number'],
      unique: true,
    },
    driverName: {
      type: String,
      required: [true, 'Please add a driver name'],
    },
    driverPhone: {
      type: String,
      required: [true, 'Please add a driver phone number'],
    },
    currentLatitude: {
      type: Number,
      required: true,
      default: 0.0,
    },
    currentLongitude: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'onRoute', 'in-transit', 'completed'],
      default: 'available',
    },
    // Optional associations for assignments
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ambulance', ambulanceSchema);
