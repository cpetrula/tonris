/**
 * Authentication Middleware
 * Protects routes that require authentication
 */
const { verifyToken } = require('./jwt.utils');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const env = require('../../config/env');

/**
 * Set tenant ID from JWT token if not already set or if set to default
 * @param {Object} req - Express request object
 * @param {Object} decoded - Decoded JWT token
 */
const setTenantIdFromToken = (req, decoded) => {
  if (decoded.tenantId && (!req.tenantId || req.tenantId === env.DEFAULT_TENANT_ID)) {
    req.tenantId = decoded.tenantId;
  }
};

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
    setTenantIdFromToken(req, decoded);
    
    // Security: Verify tenant matches if an explicit (non-default) tenant ID was provided
    // This prevents users from accessing other tenants' data by sending a different X-Tenant-ID header
    // If req.tenantId was set to default and then overridden by setTenantIdFromToken, 
    // this check won't trigger (expected behavior - we want to use the JWT tenant)
    // If req.tenantId was explicitly set to a non-default value that differs from JWT,
    // this check will trigger and reject the request (security measure)
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
      // Set tenant ID from JWT token if not already set by tenant middleware
      // or if the current tenant ID is the default (meaning no explicit tenant was provided)
      setTenantIdFromToken(req, decoded);
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
