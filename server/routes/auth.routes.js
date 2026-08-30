const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendResetOtp
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public authentication routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-reset-otp', resendResetOtp);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;


