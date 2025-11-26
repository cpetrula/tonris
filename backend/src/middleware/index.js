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
};
