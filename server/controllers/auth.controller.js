const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

// Helper to generate JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// Helper to hash OTP using SHA-256
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

// Helper to generate a cryptographically secure 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// @desc    Register a new user & send OTP verification email
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }

      // If user exists but is not verified, update their info and resend verification OTP
      const otp = generateOtp();
      const otpHash = hashOtp(otp);
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      existingUser.name = name.trim();
      existingUser.password = password; // Will be hashed via pre-save hook
      existingUser.phone = phone ? String(phone).trim() : '';
      if (role) existingUser.role = role;
      existingUser.emailVerificationOtpHash = otpHash;
      existingUser.emailVerificationExpiresAt = otpExpiresAt;
      existingUser.emailVerificationAttempts = 0;
      existingUser.emailVerificationLastSentAt = new Date();

      await existingUser.save();

      // Send real email via Resend
      await sendVerificationEmail(normalizedEmail, otp);

      return res.status(200).json({
        success: true,
        message: 'Registration successful. Please check your email for the verification OTP.'
      });
    }

    // Generate secure 6-digit OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Validate role
    const validRoles = ['farmer', 'fpo', 'buyer', 'transporter', 'admin'];
    const assignedRole = role && validRoles.includes(role.toLowerCase().trim())
      ? role.toLowerCase().trim()
      : 'farmer';

    // Create user in database (password is hashed via User schema pre-save hook)
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : '',
      password,
      role: assignedRole,
      emailVerified: false,
      emailVerificationOtpHash: otpHash,
      emailVerificationExpiresAt: otpExpiresAt,
      emailVerificationAttempts: 0,
      emailVerificationLastSentAt: new Date()
    });

    // Send real email via Resend
    await sendVerificationEmail(normalizedEmail, otp);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for the verification OTP.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Verify email using OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification OTP'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email does not exist'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can log in.'
      });
    }

    // Check if OTP was set and not expired
    if (!user.emailVerificationOtpHash || !user.emailVerificationExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP verification found. Please request a new OTP.'
      });
    }

    // Check expiration (5 minutes)
    if (Date.now() > user.emailVerificationExpiresAt.getTime()) {
      user.emailVerificationOtpHash = undefined;
      user.emailVerificationExpiresAt = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempt limit (max 5)
    if (user.emailVerificationAttempts >= 5) {
      user.emailVerificationOtpHash = undefined;
      user.emailVerificationExpiresAt = undefined;
      user.emailVerificationAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // Verify OTP hash
    const candidateHash = hashOtp(otp);
    if (candidateHash !== user.emailVerificationOtpHash) {
      user.emailVerificationAttempts += 1;

      // Invalidate if reached 5 attempts
      if (user.emailVerificationAttempts >= 5) {
        user.emailVerificationOtpHash = undefined;
        user.emailVerificationExpiresAt = undefined;
        user.emailVerificationAttempts = 0;
        await user.save();

        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        });
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: `Invalid verification OTP. ${5 - user.emailVerificationAttempts} attempts remaining.`
      });
    }

    // Valid OTP: mark as verified and clear OTP data
    user.emailVerified = true;
    user.emailVerificationOtpHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    user.emailVerificationAttempts = 0;
    user.emailVerificationLastSentAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// @desc    Resend OTP verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email does not exist'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can log in.'
      });
    }

    // 60-second cooldown check
    if (user.emailVerificationLastSentAt) {
      const timeSinceLastSent = Date.now() - user.emailVerificationLastSentAt.getTime();
      const cooldownMs = 60 * 1000;

      if (timeSinceLastSent < cooldownMs) {
        const secondsRemaining = Math.ceil((cooldownMs - timeSinceLastSent) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsRemaining} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate new OTP & hash
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.emailVerificationOtpHash = otpHash;
    user.emailVerificationExpiresAt = otpExpiresAt;
    user.emailVerificationAttempts = 0;
    user.emailVerificationLastSentAt = new Date();
    await user.save();

    // Send real email via Resend
    await sendVerificationEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: 'A new verification OTP has been sent to your email.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while resending verification OTP'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by normalized email
    const user = await User.findOne({ email: normalizedEmail });

    // Generic error if user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Return safe user information and token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private (Protected by JWT)
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        role: req.user.role,
        emailVerified: req.user.emailVerified,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile'
    });
  }
};

// @desc    Initiate forgot password & send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Generate secure 6-digit OTP
      const otp = generateOtp();
      const otpHash = hashOtp(otp);
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      user.passwordResetOtpHash = otpHash;
      user.passwordResetOtpExpiresAt = otpExpiresAt;
      user.passwordResetOtpAttempts = 0;
      user.passwordResetLastSentAt = new Date();
      user.passwordResetTokenHash = undefined;
      await user.save();

      // Send real email via Resend
      await sendPasswordResetEmail(normalizedEmail, otp);
    }

    // Generic response to avoid revealing email registration
    return res.status(200).json({
      success: true,
      message: 'If an account exists for this email, a password reset OTP has been sent.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error processing password reset request'
    });
  }
};

// @desc    Verify reset OTP & generate short-lived reset token
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification OTP'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'No active password reset request found. Please request a new OTP.'
      });
    }

    // Check expiration (5 minutes)
    if (Date.now() > user.passwordResetOtpExpiresAt.getTime()) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetOtpAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempt limit (max 5)
    if (user.passwordResetOtpAttempts >= 5) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetOtpAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      });
    }

    // Compare OTP hash
    const candidateHash = hashOtp(otp);
    if (candidateHash !== user.passwordResetOtpHash) {
      user.passwordResetOtpAttempts += 1;

      if (user.passwordResetOtpAttempts >= 5) {
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpiresAt = undefined;
        user.passwordResetOtpAttempts = 0;
        await user.save();

        return res.status(400).json({
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        });
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: `Invalid verification OTP. ${5 - user.passwordResetOtpAttempts} attempts remaining.`
      });
    }

    // Valid OTP: Generate short-lived reset token (15 mins)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Invalidate OTP and store reset token hash for one-time use verification
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;
    user.passwordResetTokenHash = hashOtp(resetToken);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
};

// @desc    Reset password using resetToken
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify JWT reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please restart the password reset process.'
      });
    }

    if (!decoded || decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token format'
      });
    }

    // Find user and verify token hash for one-time use
    const user = await User.findById(decoded.userId);

    if (!user || !user.passwordResetTokenHash) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has already been used or is invalid.'
      });
    }

    const tokenHash = hashOtp(resetToken);
    if (user.passwordResetTokenHash !== tokenHash) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has already been used or is invalid.'
      });
    }

    // Update password (hashed automatically by pre-save hook)
    user.password = newPassword;
    user.passwordResetTokenHash = undefined;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;
    user.passwordResetLastSentAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting password'
    });
  }
};

// @desc    Resend password reset OTP
// @route   POST /api/auth/resend-reset-otp
// @access  Public
const resendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // 60-second cooldown check
      if (user.passwordResetLastSentAt) {
        const timeSinceLastSent = Date.now() - user.passwordResetLastSentAt.getTime();
        const cooldownMs = 60 * 1000;

        if (timeSinceLastSent < cooldownMs) {
          const secondsRemaining = Math.ceil((cooldownMs - timeSinceLastSent) / 1000);
          return res.status(429).json({
            success: false,
            message: `Please wait ${secondsRemaining} seconds before requesting a new OTP.`
          });
        }
      }

      // Generate new OTP & hash
      const otp = generateOtp();
      const otpHash = hashOtp(otp);
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      user.passwordResetOtpHash = otpHash;
      user.passwordResetOtpExpiresAt = otpExpiresAt;
      user.passwordResetOtpAttempts = 0;
      user.passwordResetLastSentAt = new Date();
      user.passwordResetTokenHash = undefined;
      await user.save();

      // Send real email via Resend
      await sendPasswordResetEmail(normalizedEmail, otp);
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists for this email, a new password reset OTP has been sent.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while resending reset OTP'
    });
  }
};

// @desc    Update user profile (name and phone only)
// @route   PUT /api/auth/profile
// @access  Private (Protected by JWT)
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 50 characters'
      });
    }

    let normalizedPhone = '';
    if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
      const cleanPhone = String(phone).trim().replace(/\D/g, '');
      // Validate 10-digit Indian phone number starting with 6-9
      if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit Indian mobile number starting with 6-9'
        });
      }
      normalizedPhone = cleanPhone;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.name = trimmedName;
    if (phone !== undefined) {
      user.phone = normalizedPhone;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        emailVerified: user.emailVerified,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating profile'
    });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private (Protected by JWT)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    // Update password (hashed automatically via pre-save hook)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while changing password'
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendResetOtp,
  updateProfile,
  changePassword
};


