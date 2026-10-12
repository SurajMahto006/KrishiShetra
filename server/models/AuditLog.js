const mongoose = require('mongoose');

/**
 * AuditFactor sub-schema for Explainable AI/Heuristic factors
 */
const auditFactorSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      required: true
    },
    impact: {
      type: String,
      enum: ['INCREASES_RISK', 'DECREASES_RISK', 'NEUTRAL'],
      default: 'NEUTRAL'
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

/**
 * ReviewDecision sub-schema for appending human/auditor decisions
 * without modifying original algorithmic assessment
 */
const reviewDecisionSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewerRole: {
      type: String,
      trim: true,
      default: 'admin'
    },
    decision: {
      type: String,
      enum: ['VERIFIED_SAFE', 'REQUIRES_MONITORING', 'SUSPECT_FLAGGED', 'NOTE_ADDED'],
      required: true
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

/**
 * AuditLog Schema — Durable Outbox & Tamper-Evident Local Audit Trail
 */
const auditLogSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      index: true,
      trim: true
    },
    orderObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ObjectId is required'],
      index: true
    },
    eventType: {
      type: String,
      enum: ['ORDER_CREATED', 'STATUS_UPDATED', 'CANCELLED', 'PAYMENT_UPDATED', 'AUDIT_REVIEW'],
      required: [true, 'Event type is required'],
      index: true
    },
    idempotencyKey: {
      type: String,
      required: [true, 'Idempotency key is required'],
      unique: true,
      index: true,
      trim: true
    },
    canonicalPayloadHash: {
      type: String,
      required: [true, 'Canonical payload hash is required'],
      match: [/^0x[a-fA-F0-9]{64}$/, 'Must be a 32-byte hex hash']
    },
    canonicalPayload: {
      orderId: { type: String, trim: true },
      cropName: { type: String, trim: true },
      variety: { type: String, trim: true },
      quantity: { type: Number },
      quantityUnit: { type: String, trim: true },
      agreedPrice: { type: Number },
      priceUnit: { type: String, trim: true },
      totalAmount: { type: Number },
      status: { type: String, trim: true },
      paymentStatus: { type: String, trim: true },
      paymentMethod: { type: String, trim: true },
      eventTimestamp: { type: Date }
    },
    riskAssessment: {
      engine: {
        type: String,
        default: 'EXPLAINABLE_HEURISTIC_BASELINE_V1'
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      level: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        required: true
      },
      factors: [auditFactorSchema],
      riskHash: {
        type: String,
        required: true,
        match: [/^0x[a-fA-F0-9]{64}$/, 'Must be a 32-byte hex hash']
      },
      assessedAt: {
        type: Date,
        default: Date.now
      }
    },
    outboxStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'CONFIRMED_ON_CHAIN', 'FAILED', 'SKIPPED_UNCONFIGURED'],
      default: 'PENDING',
      index: true
    },
    onChainDetails: {
      network: {
        type: String,
        default: 'Ethereum Sepolia'
      },
      chainId: {
        type: Number,
        default: 11155111
      },
      contractAddress: {
        type: String,
        trim: true,
        default: ''
      },
      recordKey: {
        type: String,
        trim: true,
        default: ''
      },
      txHash: {
        type: String,
        trim: true,
        default: ''
      },
      blockNumber: {
        type: Number,
        default: null
      },
      confirmedAt: {
        type: Date,
        default: null
      },
      lastError: {
        type: String,
        default: ''
      },
      retryCount: {
        type: Number,
        default: 0
      },
      nextRetryAt: {
        type: Date,
        default: Date.now
      }
    },
    reviewDecisions: [reviewDecisionSchema]
  },
  {
    timestamps: true
  }
);

// Composite indexes for fast outbox polling and order audit history
auditLogSchema.index({ outboxStatus: 1, 'onChainDetails.nextRetryAt': 1 });
auditLogSchema.index({ orderId: 1, createdAt: -1 });

auditLogSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
