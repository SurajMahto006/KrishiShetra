const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: ''
    },
    publicId: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const produceLotSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: [true, 'Farmer profile reference is required'],
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User creator reference is required'],
      index: true
    },
    lotId: {
      type: String,
      required: [true, 'Lot ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    // Crop Details
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    variety: {
      type: String,
      required: [true, 'Crop variety is required'],
      trim: true
    },
    // Quantity
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than zero']
    },
    availableQuantity: {
      type: Number,
      min: [0, 'Available quantity cannot be negative'],
      default: function () {
        return this.quantity;
      }
    },
    quantityUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid quantity unit'
      },
      default: 'quintal',
      required: [true, 'Quantity unit is required']
    },
    // Harvest
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required']
    },
    // Quality Information
    qualityGrade: {
      type: String,
      enum: {
        values: ['A', 'B', 'C'],
        message: '{VALUE} is not a valid quality grade (Allowed: A, B, C)'
      },
      default: 'A',
      required: [true, 'Quality grade is required']
    },
    qualityNotes: {
      type: String,
      trim: true,
      default: ''
    },
    // Storage
    storageType: {
      type: String,
      enum: {
        values: ['farm', 'warehouse', 'cold_storage', 'other'],
        message: '{VALUE} is not a valid storage type'
      },
      default: 'farm'
    },
    storageLocation: {
      type: String,
      trim: true,
      default: ''
    },
    storageRequired: {
      type: Boolean,
      default: false
    },
    preferredStorageType: {
      type: String,
      enum: ['warehouse', 'cold_storage', 'silo', 'farm', 'other'],
      default: 'warehouse'
    },
    storageFacility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StorageFacility',
      default: null
    },
    storageDurationDays: {
      type: Number,
      default: 0
    },
    currentStorageStatus: {
      type: String,
      enum: ['on_farm', 'stored_in_warehouse', 'in_transit_to_storage', 'dispatched_from_storage'],
      default: 'on_farm'
    },
    estimatedStorageCost: {
      type: Number,
      default: 0
    },
    sellNowOrHoldDecision: {
      recommendation: { type: String, default: '' },
      projectedNetGain: { type: Number, default: 0 },
      holdingPeriodDays: { type: Number, default: 0 },
      calculatedAt: { type: Date, default: null }
    },
    // Pricing
    askingPrice: {
      type: Number,
      required: [true, 'Asking price is required'],
      min: [0.01, 'Asking price must be greater than zero']
    },
    priceUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid price unit'
      },
      default: 'quintal'
    },
    // Location
    state: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    taluka: {
      type: String,
      trim: true,
      default: ''
    },
    village: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      trim: true,
      default: ''
    },
    // Photos
    photos: {
      type: [photoSchema],
      default: []
    },
    // Status
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'sold', 'cancelled'],
        message: '{VALUE} is not a valid status'
      },
      default: 'draft',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for marketplace querying and filtering
produceLotSchema.index({ status: 1, cropName: 1, createdAt: -1 });
produceLotSchema.index({ status: 1, state: 1, district: 1 });
produceLotSchema.index({ status: 1, askingPrice: 1 });

// Format JSON response
produceLotSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const ProduceLot = mongoose.model('ProduceLot', produceLotSchema);

module.exports = ProduceLot;
