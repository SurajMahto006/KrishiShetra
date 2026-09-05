const mongoose = require('mongoose');

const storageFacilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Storage facility name is required'],
      trim: true
    },
    facilityCode: {
      type: String,
      required: [true, 'Facility code is required'],
      unique: true,
      index: true,
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ['warehouse', 'cold_storage', 'silo', 'dry_storage', 'hermetic_storage'],
        message: '{VALUE} is not a valid storage type'
      },
      required: [true, 'Storage type is required'],
      default: 'warehouse'
    },
    address: {
      addressLine1: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, required: true },
      state: { type: String, trim: true, required: true },
      pincode: { type: String, trim: true, default: '' },
      taluka: { type: String, trim: true, default: '' },
      landmark: { type: String, trim: true, default: '' }
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    totalCapacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Total capacity must be greater than 0']
    },
    availableCapacity: {
      type: Number,
      required: [true, 'Available capacity is required'],
      min: [0, 'Available capacity cannot be negative']
    },
    capacityUnit: {
      type: String,
      enum: ['MT', 'quintal', 'bags'],
      default: 'MT'
    },
    storageRate: {
      type: Number,
      required: [true, 'Storage rate is required'],
      min: [0, 'Storage rate cannot be negative']
    },
    storageRateUnit: {
      type: String,
      enum: ['per_bag_month', 'per_quintal_month', 'per_ton_month', 'per_day_quintal'],
      default: 'per_bag_month'
    },
    handlingCharge: {
      type: Number,
      default: 15, // ₹ per quintal standard handling/loading/unloading
      min: [0, 'Handling charge cannot be negative']
    },
    supportedCrops: {
      type: [String],
      default: ['rice', 'wheat', 'onion', 'soybean', 'potato', 'pulses', 'maize', 'chilli', 'groundnut', 'cotton']
    },
    operatingStatus: {
      type: String,
      enum: ['operational', 'full', 'under_maintenance', 'closed'],
      default: 'operational'
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending_verification', 'unverified'],
      default: 'verified'
    },
    accreditationType: {
      type: String,
      trim: true,
      default: 'State Warehousing Corp (MSWC)'
    },
    facilities: {
      type: [String],
      default: [
        'Temperature Controlled',
        '24/7 CCTV & Security',
        'Pest Management',
        'Weighbridge Onsite',
        'Assaying Lab',
        'e-NWR Ready'
      ]
    },
    contactDetails: {
      managerName: { type: String, trim: true, default: 'Facility Manager' },
      phone: { type: String, trim: true, default: '+91 98765 00000' },
      email: { type: String, trim: true, default: 'storage@krishishetra.in' }
    },
    bookingEnabled: {
      type: Boolean,
      default: true
    },
    pledgeFinancingEligible: {
      type: Boolean,
      default: true
    },
    partnerLenders: {
      type: [String],
      default: [
        'NABARD Linked Agri-Credit',
        'SBI Agri Warehouse Loan',
        'HDFC Kisan Credit',
        'FPO Liquidity Pool'
      ]
    }
  },
  {
    timestamps: true
  }
);

// Geospatial & search indexes
storageFacilitySchema.index({ latitude: 1, longitude: 1 });
storageFacilitySchema.index({ type: 1, 'address.state': 1, 'address.district': 1 });
storageFacilitySchema.index({ operatingStatus: 1, verificationStatus: 1 });

storageFacilitySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const StorageFacility = mongoose.model('StorageFacility', storageFacilitySchema);

module.exports = StorageFacility;
