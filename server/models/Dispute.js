const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  // Raised by
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  raisedByRole: {
    type: String,
    enum: ['farmer', 'buyer', 'transporter'],
    required: true
  },

  // Related entities
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  inquiry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry'
  },

  // Dispute details
  category: {
    type: String,
    enum: [
      'payment_not_received',
      'payment_wrong_amount',
      'order_not_delivered',
      'quality_mismatch',
      'quantity_mismatch',
      'fraud',
      'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  evidenceUrls: [{ type: String }], // Photos / documents uploaded as proof

  // Dispute lifecycle
  status: {
    type: String,
    enum: ['raised', 'under_review', 'resolved', 'escalated', 'closed'],
    default: 'raised'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Resolution
  resolution: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundAmount: { type: Number, default: 0 },
  refundStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'processed'],
    default: 'not_applicable'
  },

  // Timeline comments (admin ↔ user communication)
  timeline: [{
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    byRole: { type: String, enum: ['farmer', 'buyer', 'transporter', 'admin'] },
    message: { type: String, required: true },
    attachmentUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  ticketId: { type: String, unique: true } // e.g. KS-DISP-2026-001234

}, { timestamps: true });

// Auto-generate ticket ID before save
disputeSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.ticketId = `KS-DISP-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Dispute', disputeSchema);
