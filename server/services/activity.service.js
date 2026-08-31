const ActivityLog = require('../models/ActivityLog');

const SENSITIVE_KEYS = [
  'password',
  'otp',
  'otpHash',
  'token',
  'jwt',
  'secret',
  'emailVerificationOtpHash',
  'passwordResetOtpHash',
  'passwordResetTokenHash'
];

/**
 * Sanitize metadata to strip out passwords, tokens, OTPs, or hashes
 */
const sanitizeMetadata = (obj) => {
  if (!obj || typeof obj !== 'object') return {};

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()));
    if (!isSensitive) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = sanitizeMetadata(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
};

/**
 * Reusable helper to record an activity log
 */
const logActivity = async ({
  user,
  action,
  entityType = '',
  entityId = null,
  description = '',
  metadata = {},
  ipAddress = ''
}) => {
  try {
    if (!user || !action) {
      return null;
    }

    const log = await ActivityLog.create({
      user,
      action: String(action).trim(),
      entityType: String(entityType).trim(),
      entityId,
      description: String(description).trim(),
      metadata: sanitizeMetadata(metadata),
      ipAddress: String(ipAddress).trim()
    });

    return log;
  } catch (error) {
    console.error('Activity logging failed:', error.message);
    return null;
  }
};

module.exports = {
  logActivity
};
