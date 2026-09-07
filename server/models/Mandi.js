const mongoose = require('mongoose');

const expenseConfigSchema = new mongoose.Schema(
  {
    commissionRate: {
      type: Number,
      default: 0.02,
      min: [0, 'Commission rate cannot be negative'],
      max: [1, 'Commission rate cannot exceed 100%']
    },
    commissionType: {
      type: String,
      enum: {
        values: ['percentage', 'fixed', 'per_quintal'],
        message: '{VALUE} is not a valid commission type'
      },
      default: 'percentage'
    },
    fixedMandiCharge: {
      type: Number,
      default: 0,
      min: [0, 'Mandi charge cannot be negative']
    },
    transportRate: {
      type: Number,
      default: 60,
      min: [0, 'Transport rate cannot be negative']
    },
    transportRateType: {
      type: String,
      enum: {
        values: ['per_km_per_trip', 'per_km', 'fixed', 'per_trip'],
        message: '{VALUE} is not a valid transport rate type'
      },
      default: 'per_km_per_trip'
    },
    labourRate: {
      type: Number,
      default: 500,
      min: [0, 'Labour rate cannot be negative']
    },
    labourRateType: {
      type: String,
      enum: {
        values: ['per_worker_day', 'fixed', 'per_quintal'],
        message: '{VALUE} is not a valid labour rate type'
      },
      default: 'fixed'
    },
    defaultLabourWorkers: {
      type: Number,
      default: 4,
      min: [1, 'At least 1 worker required']
    },
    defaultLabourDays: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 day required']
    },
    loadingRate: {
      type: Number,
      default: 20,
      min: [0, 'Loading rate cannot be negative']
    },
    loadingRateType: {
      type: String,
      enum: {
        values: ['fixed', 'per_quintal', 'per_trip'],
        message: '{VALUE} is not a valid loading rate type'
      },
      default: 'per_quintal'
    },
    unloadingRate: {
      type: Number,
      default: 15,
      min: [0, 'Unloading rate cannot be negative']
    },
    unloadingRateType: {
      type: String,
      enum: {
        values: ['fixed', 'per_quintal', 'per_trip'],
        message: '{VALUE} is not a valid unloading rate type'
      },
      default: 'per_quintal'
    }
  },
  { _id: false }
);

const mandiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mandi name is required'],
      trim: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    expenseConfig: {
      type: expenseConfigSchema,
      default: () => ({})
    },
    isDemo: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

mandiSchema.index({ state: 1, district: 1 });
mandiSchema.index({ name: 1 }, { unique: true });

mandiSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Mandi = mongoose.model('Mandi', mandiSchema);

module.exports = Mandi;
