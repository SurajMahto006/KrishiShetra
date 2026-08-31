const mongoose = require('mongoose');

const buyerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    buyerType: {
      type: String,
      enum: {
        values: ['individual', 'business', 'trader', 'processor', 'retailer', 'fpo'],
        message: '{VALUE} is not a valid buyer type'
      },
      default: 'individual'
    },
    gstNumber: {
      type: String,
      trim: true,
      default: ''
    },
    businessAddress: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      required: [true, 'State is required']
    },
    district: {
      type: String,
      trim: true,
      required: [true, 'District is required']
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
      required: [true, 'Pincode is required']
    },
    interestedCrops: [
      {
        type: String,
        trim: true
      }
    ],
    preferredQuantityUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid preferred quantity unit'
      },
      default: 'quintal'
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
