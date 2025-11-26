/**
 * Service Routes
 * Defines all service-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const serviceController = require('./service.controller');
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
 * All routes require authentication
 */

// GET /api/services - Get all services
router.get('/', standardLimiter, authMiddleware, serviceController.getServices);

// GET /api/services/:id - Get service by ID
router.get('/:id', standardLimiter, authMiddleware, serviceController.getService);

// POST /api/services - Create a new service
router.post('/', standardLimiter, authMiddleware, serviceController.createService);

// PATCH /api/services/:id - Update service
router.patch('/:id', standardLimiter, authMiddleware, serviceController.updateService);

// DELETE /api/services/:id - Delete service
router.delete('/:id', standardLimiter, authMiddleware, serviceController.deleteService);

module.exports = router;
