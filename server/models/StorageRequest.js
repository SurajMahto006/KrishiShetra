const mongoose = require('mongoose');

const storageRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: [true, 'Request ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required'],
      index: true
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StorageFacility',
      required: [true, 'Storage facility reference is required'],
      index: true
    },
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      default: null
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    variety: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than zero']
    },
    quantityUnit: {
      type: String,
      enum: ['quintal', 'MT', 'bags', 'kg'],
      default: 'quintal'
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day'],
      default: 30
    },
    startDate: {
      type: Date,
      required: [true, 'Storage start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date
    },
    estimatedStorageCost: {
      type: Number,
      required: true,
      min: [0, 'Storage cost cannot be negative']
    },
    handlingCost: {
      type: Number,
      default: 0,
      min: [0, 'Handling cost cannot be negative']
    },
    totalEstimatedCost: {
      type: Number,
      required: true,
      min: [0, 'Total cost cannot be negative']
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
      default: 'requested',
      index: true
    },
    warehouseReceiptNumber: {
      type: String,
      trim: true,
      default: ''
    },
    pledgeFinancingRequested: {
      type: Boolean,
      default: false
    },
    pledgeFinancingStatus: {
      type: String,
      enum: ['none', 'eligible', 'applied', 'approved', 'disbursed', 'rejected'],
      default: 'none'
    },
    farmerNotes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    facilityResponseNotes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

storageRequestSchema.index({ farmer: 1, createdAt: -1 });
storageRequestSchema.index({ facility: 1, status: 1 });

storageRequestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const StorageRequest = mongoose.model('StorageRequest', storageRequestSchema);

module.exports = StorageRequest;
