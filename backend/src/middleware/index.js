/**
 * Middleware Index
 * Central export for all middleware
 */
const { tenantMiddleware, extractTenantId, isValidTenantId } = require('./tenant');
const {
  AppError,
  notFoundHandler,
  errorHandler,
  validationErrorHandler,
  databaseErrorHandler,
} = require('./errorHandler');
const { authMiddleware, optionalAuthMiddleware } = require('../modules/auth/auth.middleware');

module.exports = {
  // Tenant middleware
  tenantMiddleware,
  extractTenantId,
  isValidTenantId,
  
  // Error handling
  AppError,
  notFoundHandler,
  errorHandler,
  validationErrorHandler,
  databaseErrorHandler,
  
  // Authentication middleware
  authMiddleware,
  optionalAuthMiddleware,
};
