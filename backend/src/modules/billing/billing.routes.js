/**
 * Billing Routes
 * Defines all billing-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const billingController = require('./billing.controller');
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

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'Too many billing requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public routes (no authentication required)
 */

// GET /api/billing/plans - Get available subscription plans
router.get('/plans', standardLimiter, billingController.getPlans);

/**
 * Protected routes - require authentication
 */

// GET /api/billing/subscription - Get current subscription
router.get('/subscription', standardLimiter, authMiddleware, billingController.getSubscription);

// POST /api/billing/create-checkout-session - Create checkout session
router.post('/create-checkout-session', strictLimiter, authMiddleware, billingController.createCheckoutSession);

// POST /api/billing/portal-session - Create customer portal session
router.post('/portal-session', strictLimiter, authMiddleware, billingController.createPortalSession);

// POST /api/billing/cancel - Cancel subscription
router.post('/cancel', strictLimiter, authMiddleware, billingController.cancelSubscription);

module.exports = router;
