const mongoose = require('mongoose');

const evidenceItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    fileUrl: {
      type: String,
      trim: true,
      default: ''
    },
    previewUrl: {
      type: String,
      trim: true,
      default: ''
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    note: {
      type: String,
      default: ''
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actorRole: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const disputeSchema = new mongoose.Schema(
  {
    disputeId: {
      type: String,
      required: [true, 'Dispute ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      index: true
    },
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      trim: true,
      index: true
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dispute creator reference is required'],
      index: true
    },
    raisedByRole: {
      type: String,
      enum: ['farmer', 'buyer', 'fpo', 'transporter', 'admin'],
      required: [true, 'Creator role is required']
    },
    counterparty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Counterparty reference is required'],
      index: true
    },
    cropName: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      default: 0
    },
    quantityUnit: {
      type: String,
      default: 'kg'
    },
    orderAmount: {
      type: Number,
      default: 0
    },
    reason: {
      type: String,
      enum: {
        values: [
          'Quality Mismatch',
          'Quantity Shortage',
          'Transit Damage',
          'Payment Delay',
          'Other'
        ],
        message: '{VALUE} is not a supported dispute reason'
      },
      required: [true, 'Dispute reason is required']
    },
    description: {
      type: String,
      required: [true, 'Dispute description is required'],
      trim: true
    },
    evidence: [evidenceItemSchema],
    status: {
      type: String,
      enum: [
        'Raised',
        'Under Review',
        'Mediation',
        'Resolution Proposed',
        'Resolved',
        'Rejected'
      ],
      default: 'Raised',
      index: true
    },
    paymentProtection: {
      isProtected: {
        type: Boolean,
        default: true
      },
      protectedAmount: {
        type: Number,
        default: 0
      },
      statusText: {
        type: String,
        default: 'Protected During Dispute'
      }
    },
    resolution: {
      type: {
        type: String,
        enum: [
          'Mutual Settlement',
          'Partial Refund',
          'Return Batch',
          'Re-inspection',
          'Reject Dispute',
          'None'
        ],
        default: 'None'
      },
      refundAmount: {
        type: Number,
        default: 0
      },
      comment: {
        type: String,
        trim: true,
        default: ''
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      resolvedAt: {
        type: Date
      }
    },
    timeline: [timelineEventSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Dispute', disputeSchema);
