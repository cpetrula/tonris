/**
 * Me Routes
 * Defines the /api/me endpoint for current user context
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const tenantController = require('../modules/tenants/tenant.controller');
const { authMiddleware } = require('../modules/auth/auth.middleware');

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

// GET /api/me - Get current user and tenant context
router.get('/', standardLimiter, authMiddleware, tenantController.getCurrentUserAndTenant);

module.exports = router;
