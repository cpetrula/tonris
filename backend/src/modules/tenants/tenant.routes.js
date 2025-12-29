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

/**
 * Granular settings endpoints
 */

// GET /api/tenant/profile - Get business profile
router.get('/profile', standardLimiter, authMiddleware, tenantController.getTenantProfile);

// PATCH /api/tenant/profile - Update business profile
router.patch('/profile', standardLimiter, authMiddleware, tenantController.updateTenantProfile);

// GET /api/tenant/hours - Get business hours
router.get('/hours', standardLimiter, authMiddleware, tenantController.getTenantHours);

// PATCH /api/tenant/hours - Update business hours
router.patch('/hours', standardLimiter, authMiddleware, tenantController.updateTenantHours);

// GET /api/tenant/ai-settings - Get AI voice settings
router.get('/ai-settings', standardLimiter, authMiddleware, tenantController.getTenantAiSettings);

// PATCH /api/tenant/ai-settings - Update AI voice settings
router.patch('/ai-settings', standardLimiter, authMiddleware, tenantController.updateTenantAiSettings);

// GET /api/tenant/notifications - Get notification settings
router.get('/notifications', standardLimiter, authMiddleware, tenantController.getTenantNotifications);

// PATCH /api/tenant/notifications - Update notification settings
router.patch('/notifications', standardLimiter, authMiddleware, tenantController.updateTenantNotifications);

module.exports = router;
