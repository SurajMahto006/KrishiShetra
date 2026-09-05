const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Aadhaar Details
  aadhaarNumber: {
    type: String,
    required: true,
    match: /^\d{12}$/,
    select: false // Never return in queries for security
  },
  aadhaarMasked: {
    type: String // e.g. XXXX-XXXX-3456
  },
  aadhaarDocUrl: {
    type: String // Cloudinary / S3 URL of uploaded Aadhaar image
  },

  // PAN Details
  panNumber: {
    type: String,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    uppercase: true
  },
  panDocUrl: { type: String },

  // Bank Account Details
  bankAccountNumber: {
    type: String,
    select: false
  },
  bankAccountMasked: { type: String }, // e.g. XXXX-XXXX-1234
  ifscCode: {
    type: String,
    match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    uppercase: true
  },
  bankName: { type: String },
  accountHolderName: { type: String },

  // Land Records
  landRecordDocUrl: { type: String },
  landSizeAcres: { type: Number },
  surveyNumber: { type: String },
  district: { type: String },
  state: { type: String },

  // KYC Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin user
  },
  rejectionReason: { type: String },
  adminNotes: { type: String },

  // Verification Flags
  aadhaarVerified: { type: Boolean, default: false },
  bankVerified: { type: Boolean, default: false },
  landVerified: { type: Boolean, default: false }

}, { timestamps: true });

// Mask sensitive fields before saving
kycSchema.pre('save', function (next) {
  if (this.aadhaarNumber && this.isModified('aadhaarNumber')) {
    this.aadhaarMasked = 'XXXX-XXXX-' + this.aadhaarNumber.slice(-4);
  }
  if (this.bankAccountNumber && this.isModified('bankAccountNumber')) {
    this.bankAccountMasked = 'XXXX-XXXX-' + this.bankAccountNumber.slice(-4);
  }
  next();
});

module.exports = mongoose.model('KYC', kycSchema);
