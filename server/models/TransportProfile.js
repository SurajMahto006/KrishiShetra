const mongoose = require('mongoose');

const transportProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    driverName: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    vehicleType: {
      type: String,
      enum: {
        values: ['mini_truck', 'pickup', 'truck', 'tractor', 'tempo', 'other'],
        message: '{VALUE} is not a valid vehicle type'
      },
      required: [true, 'Vehicle type is required']
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
      uppercase: true
    },
    vehicleCapacity: {
      type: Number,
      required: [true, 'Vehicle capacity is required'],
      min: [0.01, 'Vehicle capacity must be greater than zero']
    },
    capacityUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid capacity unit'
      },
      default: 'ton'
    },
    operatingState: {
      type: String,
      trim: true,
      default: ''
    },
    operatingDistrict: {
      type: String,
      trim: true,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: '{VALUE} is not a valid verification status'
      },
      default: 'verified',
      index: true
    }
  },
  {
    timestamps: true
  }
);

transportProfileSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const TransportProfile = mongoose.model('TransportProfile', transportProfileSchema);

module.exports = TransportProfile;
