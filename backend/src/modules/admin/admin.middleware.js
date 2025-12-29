/**
 * Admin Authentication Middleware
 * Password-based authentication for admin routes
 */
const crypto = require('crypto');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const env = require('../../config/env');

/**
 * Compare two strings in constant time to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - True if strings match
 */
const timingSafeCompare = (a, b) => {
  if (!a || !b) return false;
  
  // Convert strings to buffers for constant-time comparison
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  
  // If lengths differ, still perform comparison to avoid timing leak
  if (bufferA.length !== bufferB.length) {
    // Compare against a dummy buffer of the same length as bufferB
    crypto.timingSafeEqual(bufferB, bufferB);
    return false;
  }
  
  return crypto.timingSafeEqual(bufferA, bufferB);
};

/**
 * Middleware to verify admin password
 * Checks for password in X-Admin-Password header
 */
const adminAuthMiddleware = (req, res, next) => {
  try {
    // Get password from header
    const providedPassword = req.headers['x-admin-password'];
    
    if (!providedPassword) {
      throw new AppError('Admin password required', 401, 'UNAUTHORIZED');
    }

    // Check if admin password is configured
    if (!env.ADMIN_PASSWORD) {
      logger.error('ADMIN_PASSWORD environment variable is not set');
      throw new AppError('Admin access not configured', 500, 'ADMIN_NOT_CONFIGURED');
    }

    // Verify password using constant-time comparison to prevent timing attacks
    if (!timingSafeCompare(providedPassword, env.ADMIN_PASSWORD)) {
      logger.warn('Failed admin authentication attempt');
      throw new AppError('Invalid admin password', 401, 'INVALID_PASSWORD');
    }

    // Password is valid
    logger.info('Admin authenticated successfully');
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Admin authentication failed', 401, 'AUTH_FAILED'));
  }
};

module.exports = {
  adminAuthMiddleware,
};
