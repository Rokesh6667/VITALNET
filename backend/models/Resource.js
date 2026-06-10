const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      unique: true,
    },
    totalBeds: {
      type: Number,
      required: true,
      default: 0,
    },
    availableBeds: {
      type: Number,
      required: true,
      default: 0,
    },
    totalICUBeds: {
      type: Number,
      required: true,
      default: 0,
    },
    availableICUBeds: {
      type: Number,
      required: true,
      default: 0,
    },
    totalVentilators: {
      type: Number,
      required: true,
      default: 0,
    },
    availableVentilators: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
