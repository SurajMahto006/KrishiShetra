const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

module.exports = { protect };
