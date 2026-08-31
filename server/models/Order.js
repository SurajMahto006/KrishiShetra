const mongoose = require('mongoose');

const deliveryAddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    addressLine: {
      type: String,
      trim: true,
      default: ''
    },
    addressLine1: {
      type: String,
      trim: true,
      default: ''
    },
    addressLine2: {
      type: String,
      trim: true,
      default: ''
    },
    village: {
      type: String,
      trim: true,
      default: ''
    },
    taluka: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    pincode: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    inquiry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inquiry',
      required: [true, 'Inquiry reference is required'],
      unique: true,
      index: true
    },
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
    cropName: {
      type: String,
      trim: true,
      default: ''
    },
    variety: {
      type: String,
      trim: true,
      default: ''
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
    agreedPrice: {
      type: Number,
      required: [true, 'Agreed price is required'],
      min: [0.01, 'Agreed price must be greater than zero']
    },
    priceUnit: {
      type: String,
      enum: {
        values: ['kg', 'quintal', 'ton'],
        message: '{VALUE} is not a valid price unit'
      },
      required: [true, 'Price unit is required']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0.01, 'Total amount must be greater than zero']
    },
    status: {
      type: String,
      enum: {
        values: [
          'confirmed',
          'processing',
          'ready_for_pickup',
          'in_transit',
          'delivered',
          'completed',
          'cancelled'
        ],
        message: '{VALUE} is not a valid order status'
      },
      default: 'confirmed',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'pending'
    },
    deliveryStatus: {
      type: String,
      enum: {
        values: [
          'pending',
          'ready_for_pickup',
          'picked_up',
          'in_transit',
          'delivered'
        ],
        message: '{VALUE} is not a valid delivery status'
      },
      default: 'pending'
    },
    deliveryType: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'delivery'
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      default: () => ({})
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    confirmedAt: {
      type: Date,
      default: Date.now
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal performance
orderSchema.index({ buyer: 1, status: 1, createdAt: -1 });
orderSchema.index({ farmer: 1, status: 1, createdAt: -1 });
orderSchema.index({ lot: 1, status: 1 });

// Clean JSON serialization
orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
