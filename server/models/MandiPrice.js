const mongoose = require('mongoose');

const mandiPriceSchema = new mongoose.Schema(
  {
    mandi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mandi',
      required: [true, 'Mandi reference is required'],
      index: true
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      lowercase: true
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    minPrice: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: [0, 'Price cannot be negative']
    },
    maxPrice: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: [0, 'Price cannot be negative']
    },
    modalPrice: {
      type: Number,
      required: [true, 'Modal price is required'],
      min: [0, 'Price cannot be negative']
    },
    arrivalQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Arrival quantity cannot be negative']
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

// Compound index for efficient querying by mandi + crop + date
mandiPriceSchema.index({ mandi: 1, crop: 1, date: -1 });
mandiPriceSchema.index({ crop: 1, date: -1 });
// Unique constraint: one price entry per mandi per crop per date
mandiPriceSchema.index({ mandi: 1, crop: 1, date: 1 }, { unique: true });

mandiPriceSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const MandiPrice = mongoose.model('MandiPrice', mandiPriceSchema);

module.exports = MandiPrice;
