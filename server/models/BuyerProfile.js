const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      trim: true,
      required: [true, 'Crop name is required for requirement item']
    },
    variety: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      min: [0.01, 'Requirement quantity must be greater than zero']
    },
    quantityUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid quantity unit'
      },
      default: 'quintal'
    }
  },
  { _id: false }
);

const buyerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    // Business Information
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true
    },
    businessType: {
      type: String,
      enum: {
        values: ['individual', 'retailer', 'wholesaler', 'processor', 'exporter', 'fpo', 'company', 'other'],
        message: '{VALUE} is not a valid business type'
      },
      default: 'wholesaler',
      required: [true, 'Business type is required']
    },
    // Contact Information
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    businessEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    businessPhone: {
      type: String,
      trim: true,
      default: ''
    },
    // Business Address
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
    addressLine: {
      type: String,
      trim: true,
      default: ''
    },
    // Requirements array
    requirements: {
      type: [requirementSchema],
      default: []
    },
    // Verification Status (Immutable by buyer)
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'verified', 'rejected'],
        message: '{VALUE} is not a valid verification status'
      },
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Format JSON response
buyerProfileSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const BuyerProfile = mongoose.model('BuyerProfile', buyerProfileSchema);

module.exports = BuyerProfile;
