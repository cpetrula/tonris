/**
 * Admin Authentication Middleware
 * Password-based authentication for admin routes
 */
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const env = require('../../config/env');

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

    // Verify password
    if (providedPassword !== env.ADMIN_PASSWORD) {
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
