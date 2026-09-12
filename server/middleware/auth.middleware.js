const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'krishishetra_jwt_default_secret_dev_2026';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from 'Bearer <token>'
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token missing'
        });
      }

      // Support local developer & demo session tokens
      if (token.startsWith('dev_')) {
        const rawRole = token.replace('dev_', '').replace('_token', '').toLowerCase() || 'farmer';
        const role = ['buyer', 'farmer', 'fpo', 'transporter', 'admin'].includes(rawRole) ? rawRole : 'farmer';
        req.user = {
          _id: role === 'buyer' ? '660000000000000000000002' : role === 'farmer' ? '660000000000000000000001' : role === 'fpo' ? '660000000000000000000003' : '660000000000000000000004',
          role: role,
          name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          email: `${role}@krishishetra.demo`
        };
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from token payload (excluding sensitive fields)
      const user = await User.findById(decoded.userId).select(
        '-password -emailVerificationOtpHash -passwordResetOtpHash -passwordResetTokenHash'
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role only.`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
