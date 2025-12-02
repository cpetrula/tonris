/**
 * BusinessType Routes
 * Defines all business type endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const businessTypeController = require('./businessType.controller');
const { authMiddleware } = require('../auth/auth.middleware');

const router = express.Router();

/**
 * Rate limiting configuration
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
 * Public routes - no authentication required
 */

// GET /api/business-types/active - Get active business types for registration dropdown
router.get('/active', standardLimiter, businessTypeController.getActiveBusinessTypes);

/**
 * Protected routes - require authentication
 */

// GET /api/business-types - Get all business types
router.get('/', standardLimiter, authMiddleware, businessTypeController.getAllBusinessTypes);

// GET /api/business-types/:id - Get business type by ID
router.get('/:id', standardLimiter, authMiddleware, businessTypeController.getBusinessTypeById);

// POST /api/business-types - Create new business type
router.post('/', standardLimiter, authMiddleware, businessTypeController.createBusinessType);

// PUT /api/business-types/:id - Update business type
router.put('/:id', standardLimiter, authMiddleware, businessTypeController.updateBusinessType);

// DELETE /api/business-types/:id - Delete business type
router.delete('/:id', standardLimiter, authMiddleware, businessTypeController.deleteBusinessType);

module.exports = router;
