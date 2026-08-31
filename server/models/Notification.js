const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: [
          'inquiry_received',
          'inquiry_accepted',
          'inquiry_rejected',
          'counter_offer',
          'order_created',
          'order_confirmed',
          'order_processing',
          'order_ready',
          'order_cancelled',
          'delivery_requested',
          'delivery_accepted',
          'delivery_picked_up',
          'delivery_in_transit',
          'delivery_delivered',
          'payment_updated',
          'profile_updated',
          'system'
        ],
        message: '{VALUE} is not a valid notification type'
      },
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Inquiry', 'Order', 'Delivery', 'TransportRequest', 'ProduceLot', 'User']
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId
      }
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast querying and unread counts
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Clean JSON response
notificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
