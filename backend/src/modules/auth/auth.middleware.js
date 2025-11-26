/**
 * Authentication Middleware
 * Protects routes that require authentication
 */
const { verifyToken } = require('./jwt.utils');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }

    // Verify tenant matches
    if (decoded.tenantId && req.tenantId && decoded.tenantId !== req.tenantId) {
      logger.warn(`Tenant mismatch: token tenant ${decoded.tenantId} vs request tenant ${req.tenantId}`);
      throw new AppError('Token tenant mismatch', 401, 'TENANT_MISMATCH');
    }

    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Authentication failed', 401, 'AUTH_FAILED'));
  }
};

/**
 * Optional auth middleware - attaches user if token present, but doesn't require it
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      req.user = decoded;
    }
    
    next();
  } catch (err) {
    // Ignore errors for optional auth
    void err;
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
