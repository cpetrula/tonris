/**
 * Tenant Routes
 * Defines all tenant-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const tenantController = require('./tenant.controller');
const { authMiddleware } = require('../auth/auth.middleware');

const router = express.Router();

/**
 * Rate limiting configuration
 * Skip rate limiting in test environment
 */
const isTestEnv = process.env.NODE_ENV === 'test';

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public routes (require tenant context but not authentication)
 */

// POST /api/tenant - Create a new tenant (signup flow)
router.post('/', standardLimiter, tenantController.createTenant);

/**
 * Protected routes - require authentication
 */

// GET /api/tenant - Get current tenant information
router.get('/', standardLimiter, authMiddleware, tenantController.getTenant);

// PATCH /api/tenant - Update tenant information
router.patch('/', standardLimiter, authMiddleware, tenantController.updateTenant);

// GET /api/tenant/settings - Get tenant settings
router.get('/settings', standardLimiter, authMiddleware, tenantController.getTenantSettings);

// PATCH /api/tenant/settings - Update tenant settings
router.patch('/settings', standardLimiter, authMiddleware, tenantController.updateTenantSettings);

// POST /api/tenant/activate - Activate tenant
router.post('/activate', standardLimiter, authMiddleware, tenantController.activateTenant);

// PATCH /api/tenant/status - Update tenant status
router.patch('/status', standardLimiter, authMiddleware, tenantController.updateTenantStatus);

// GET /api/tenant/dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', standardLimiter, authMiddleware, tenantController.getDashboardStats);

module.exports = router;
