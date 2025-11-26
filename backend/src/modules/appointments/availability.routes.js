/**
 * Availability Routes
 * Defines availability-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const appointmentController = require('./appointment.controller');
const { authMiddleware } = require('../auth/auth.middleware');

const router = express.Router();

/**
 * Rate limiting configuration
 * Skip rate limiting in test environment
 */
const isTestEnv = process.env.NODE_ENV === 'test';

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for availability checks
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/availability - Get availability for scheduling (for AI and frontend)
router.get('/', standardLimiter, authMiddleware, appointmentController.getAvailability);

module.exports = router;
