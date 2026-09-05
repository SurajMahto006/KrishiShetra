const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Amount breakdown
  amount: { type: Number, required: true },          // Total order amount
  platformFee: { type: Number, default: 0 },          // KrishiShetra platform fee (2%)
  gst: { type: Number, default: 0 },                  // GST on platform fee (18%)
  netPayable: { type: Number, required: true },        // Amount buyer pays
  farmerReceivable: { type: Number, required: true },  // Amount farmer receives after deductions

  // Razorpay / PayU gateway details
  gateway: {
    type: String,
    enum: ['razorpay', 'payu', 'upi', 'neft', 'cash'],
    default: 'razorpay'
  },
  gatewayOrderId: { type: String },    // Razorpay order_id
  gatewayPaymentId: { type: String },  // Razorpay payment_id (after success)
  gatewaySignature: { type: String },  // For webhook verification
  upiTransactionId: { type: String },  // If paid via UPI

  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  failureReason: { type: String },

  // Timestamps
  initiatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  refundedAt: { type: Date },

  // Farmer payout status (separate from buyer payment)
  payoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  payoutTransactionId: { type: String },
  payoutDate: { type: Date },

  // Receipt
  receiptNumber: { type: String, unique: true, sparse: true }, // e.g. KS-RCPT-2026-001234
  notes: { type: String }

}, { timestamps: true });

// Auto-generate receipt number on payment completion
paymentSchema.pre('save', async function (next) {
  if (this.status === 'completed' && !this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({ status: 'completed' });
    this.receiptNumber = `KS-RCPT-${year}-${String(count + 1).padStart(6, '0')}`;
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
