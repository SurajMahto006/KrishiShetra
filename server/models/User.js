const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: {
        values: ['farmer', 'fpo', 'buyer', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'farmer'
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationOtpHash: {
      type: String,
      default: undefined
    },
    emailVerificationExpiresAt: {
      type: Date,
      default: undefined
    },
    emailVerificationAttempts: {
      type: Number,
      default: 0
    },
    emailVerificationLastSentAt: {
      type: Date,
      default: undefined
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

