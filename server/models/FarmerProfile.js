const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Crop name is required']
    },
    season: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    // Basic Information
    farmName: {
      type: String,
      trim: true,
      default: ''
    },
    farmerType: {
      type: String,
      enum: {
        values: ['individual', 'farmer_group', 'fpo_member'],
        message: '{VALUE} is not a valid farmer type'
      },
      default: 'individual'
    },
    // Farm Information
    farmSize: {
      type: Number,
      min: [0, 'Farm size must be a positive number'],
      default: 0
    },
    farmSizeUnit: {
      type: String,
      enum: {
        values: ['acre', 'hectare', 'guntha'],
        message: '{VALUE} is not a valid farm size unit'
      },
      default: 'acre'
    },
    ownershipType: {
      type: String,
      enum: {
        values: ['owned', 'leased', 'shared'],
        message: '{VALUE} is not a valid ownership type'
      },
      default: 'owned'
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
    // Crops Array
    crops: {
      type: [cropSchema],
      default: []
    },
    // Farming Information
    irrigationType: {
      type: String,
      enum: {
        values: ['rainfed', 'borewell', 'canal', 'drip', 'sprinkler', 'mixed'],
        message: '{VALUE} is not a valid irrigation type'
      },
      default: 'rainfed'
    },
    farmingMethod: {
      type: String,
      enum: {
        values: ['conventional', 'organic', 'natural', 'mixed'],
        message: '{VALUE} is not a valid farming method'
      },
      default: 'conventional'
    }
  },
  {
    timestamps: true
  }
);

// Format returned JSON profile object cleanly
farmerProfileSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);

module.exports = FarmerProfile;
