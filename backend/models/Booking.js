const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['bed', 'ICU', 'ventilator', 'ambulance'],
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'payment-pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    patientCondition: {
      type: String,
      required: [true, 'Please add a patient condition summary'],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    ambulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ambulance',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
