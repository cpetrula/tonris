/**
 * Authentication Middleware
 * Protects routes that require authentication
 */
const { verifyToken } = require('./jwt.utils');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const env = require('../../config/env');

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

    // Set tenant ID from JWT token if not already set by tenant middleware
    // or if the current tenant ID is the default (meaning no explicit tenant was provided)
    if (decoded.tenantId && (!req.tenantId || req.tenantId === env.DEFAULT_TENANT_ID)) {
      req.tenantId = decoded.tenantId;
    } else if (decoded.tenantId && req.tenantId && decoded.tenantId !== req.tenantId) {
      // Verify tenant matches if an explicit tenant ID was provided (not default)
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
      
      // Set tenant ID from JWT token if not already set by tenant middleware
      // or if the current tenant ID is the default (meaning no explicit tenant was provided)
      if (decoded.tenantId && (!req.tenantId || req.tenantId === env.DEFAULT_TENANT_ID)) {
        req.tenantId = decoded.tenantId;
      }
    }
    
    next();
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
