const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;

