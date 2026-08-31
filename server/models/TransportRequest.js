const mongoose = require('mongoose');

const addressSubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    addressLine: {
      type: String,
      trim: true,
      default: ''
    },
    addressLine1: {
      type: String,
      trim: true,
      default: ''
    },
    village: {
      type: String,
      trim: true,
      default: ''
    },
    taluka: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const transportRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: [true, 'Request ID is required'],
      unique: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      unique: true,
      index: true
    },
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      required: [true, 'ProduceLot reference is required']
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required'],
      index: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required'],
      index: true
    },
    transporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    pickupAddress: {
      type: addressSubSchema,
      default: () => ({})
    },
    deliveryAddress: {
      type: addressSubSchema,
      default: () => ({})
    },
    cargoQuantity: {
      type: Number,
      required: [true, 'Cargo quantity is required'],
      min: [0.01, 'Cargo quantity must be greater than zero']
    },
    cargoUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid cargo unit'
      },
      required: [true, 'Cargo unit is required']
    },
    vehicleType: {
      type: String,
      enum: {
        values: ['mini_truck', 'pickup', 'truck', 'tractor', 'tempo', 'other'],
        message: '{VALUE} is not a valid vehicle type'
      },
      default: 'truck'
    },
    transportFee: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: {
        values: [
          'requested',
          'assigned',
          'accepted',
          'pickup_ready',
          'picked_up',
          'in_transit',
          'delivered',
          'cancelled'
        ],
        message: '{VALUE} is not a valid transport request status'
      },
      default: 'requested',
      index: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    pickedUpAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
transportRequestSchema.index({ status: 1, 'pickupAddress.district': 1, createdAt: -1 });
transportRequestSchema.index({ transporter: 1, status: 1, createdAt: -1 });
transportRequestSchema.index({ farmer: 1, status: 1, createdAt: -1 });

transportRequestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const TransportRequest = mongoose.model('TransportRequest', transportRequestSchema);

module.exports = TransportRequest;
