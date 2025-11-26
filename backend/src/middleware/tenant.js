/**
 * Multi-Tenant Middleware
 * Identifies and sets tenant context from request headers or other sources
 */
const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Extract tenant ID from various sources
 * Priority: Header > Query Parameter > Default
 */
const extractTenantId = (req) => {
  // Check X-Tenant-ID header first
  if (req.headers['x-tenant-id']) {
    return req.headers['x-tenant-id'];
  }
  
  // Check query parameter
  if (req.query.tenantId) {
    return req.query.tenantId;
  }
  
  // Return default tenant ID
  return env.DEFAULT_TENANT_ID;
};

/**
 * Validate tenant ID format
 */
const isValidTenantId = (tenantId) => {
  // Basic validation - alphanumeric with hyphens and underscores, max 64 chars
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(tenantId) && tenantId.length <= 64;
};

/**
 * Multi-tenant middleware
 * Sets tenant context on each request
 */
const tenantMiddleware = (req, res, next) => {
  const tenantId = extractTenantId(req);
  
  if (!isValidTenantId(tenantId)) {
    logger.warn(`Invalid tenant ID received: ${tenantId}`);
    return res.status(400).json({
      success: false,
      error: 'Invalid tenant identifier',
      code: 'INVALID_TENANT_ID',
    });
  }
  
  // Set tenant context on request object
  req.tenantId = tenantId;
  req.tenantContext = {
    id: tenantId,
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  
  // Add tenant info to response headers
  res.setHeader('X-Tenant-ID', tenantId);
  res.setHeader('X-Request-ID', req.tenantContext.requestId);
  
  logger.debug(`Tenant context set: ${tenantId}`, {
    requestId: req.tenantContext.requestId,
    path: req.path,
  });
  
  next();
};

module.exports = {
  tenantMiddleware,
  extractTenantId,
  isValidTenantId,
};
