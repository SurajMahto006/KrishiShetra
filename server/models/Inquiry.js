const mongoose = require('mongoose');

const offerItemSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    offeredPrice: {
      type: Number,
      required: true,
      min: [0.01, 'Offered price must be greater than zero']
    },
    quantityRequired: {
      type: Number,
      required: true,
      min: [0.01, 'Quantity required must be greater than zero']
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const inquirySchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      required: [true, 'ProduceLot reference is required'],
      index: true
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
    offeredPrice: {
      type: Number,
      required: [true, 'Offered price is required'],
      min: [0.01, 'Offered price must be greater than zero']
    },
    quantityRequired: {
      type: Number,
      required: [true, 'Quantity required is required'],
      min: [0.01, 'Quantity required must be greater than zero']
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'negotiating', 'accepted', 'rejected', 'completed'],
        message: '{VALUE} is not a valid inquiry status'
      },
      default: 'pending',
      index: true
    },
    offers: {
      type: [offerItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast querying and duplicate prevention
inquirySchema.index({ buyer: 1, lot: 1, status: 1 });
inquirySchema.index({ farmer: 1, status: 1, createdAt: -1 });

// Format clean JSON output
inquirySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;
