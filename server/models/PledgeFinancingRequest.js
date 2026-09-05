const mongoose = require('mongoose');

const pledgeFinancingRequestSchema = new mongoose.Schema(
  {
    financingId: {
      type: String,
      required: [true, 'Financing ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    storageRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StorageRequest',
      required: [true, 'Storage request reference is required']
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StorageFacility',
      required: [true, 'Storage facility reference is required']
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer reference is required'],
      index: true
    },
    cropName: {
      type: String,
      required: true,
      trim: true
    },
    storedQuantity: {
      type: Number,
      required: true
    },
    quantityUnit: {
      type: String,
      default: 'quintal'
    },
    estimatedProduceValue: {
      type: Number,
      required: true
    },
    requestedLoanAmount: {
      type: Number,
      required: true
    },
    loanTenureDays: {
      type: Number,
      default: 60
    },
    partnerInstitution: {
      type: String,
      default: 'NABARD Linked Agri-Credit'
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'verified_by_warehouse', 'approved', 'disbursed', 'rejected'],
      default: 'applied',
      index: true
    },
    disclaimer: {
      type: String,
      default: 'Financing availability subject to partner lender evaluation and warehouse receipt verification.'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

pledgeFinancingRequestSchema.index({ farmer: 1, createdAt: -1 });

pledgeFinancingRequestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const PledgeFinancingRequest = mongoose.model('PledgeFinancingRequest', pledgeFinancingRequestSchema);

module.exports = PledgeFinancingRequest;
