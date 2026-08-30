const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProduceLot',
      required: [true, 'Produce lot reference is required'],
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuyerProfile',
      required: [true, 'Buyer profile reference is required'],
      index: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: [true, 'Farmer profile reference is required'],
      index: true
    },
    offeredPrice: {
      type: Number,
      required: [true, 'Offered price is required'],
      min: [0.01, 'Offered price must be greater than zero']
    },
    priceUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid price unit'
      },
      required: [true, 'Price unit is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than zero']
    },
    quantityUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid quantity unit'
      },
      required: [true, 'Quantity unit is required']
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'cancelled'],
        message: '{VALUE} is not a valid offer status'
      },
      default: 'pending',
      index: true
    },
    respondedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for rapid lookups and duplicate pending offer prevention
offerSchema.index({ lot: 1, buyer: 1, status: 1 });
offerSchema.index({ farmer: 1, status: 1, createdAt: -1 });
offerSchema.index({ buyer: 1, status: 1, createdAt: -1 });

// Format JSON response cleanly
offerSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
