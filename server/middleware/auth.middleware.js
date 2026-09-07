const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'krishishetra_super_secret_jwt_key_2026_dev_prod';

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    try {
      // Extract token from 'Bearer <token>' case-insensitively
      token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (!token || token === 'null' || token === 'undefined') {
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

      // Cryptographically verify token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, invalid or expired token'
        });
      }

      const targetId = decoded.userId || decoded.id || decoded._id;
      if (!targetId) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, invalid token payload'
        });
      }

      // Get user from token payload (with DB error isolation)
      try {
        const user = await User.findById(targetId).select(
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
      } catch (dbError) {
        console.error('[Auth Middleware DB Error]:', dbError.message);
        return res.status(500).json({
          success: false,
          message: 'Database error verifying authentication. Please try again.'
        });
      }
    } catch (unexpectedError) {
      return res.status(500).json({
        success: false,
        message: 'Internal server authentication error'
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

    const userRole = (req.user.role || '').toLowerCase().trim();
    const allowedRoles = roles.map(r => String(r).toLowerCase().trim());

    if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role only.`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
