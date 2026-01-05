/**
 * Cron Routes
 * Defines all cron job endpoints (secured with CRON_SECRET)
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const cronController = require('./cron.controller');
const { AppError } = require('../../middleware/errorHandler');

const router = express.Router();

/**
 * Rate limiting for cron endpoints
 * Very restrictive since these should only be called by external cron service
 */
const cronLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    error: 'Too many requests to cron endpoint',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Middleware to verify CRON_SECRET
 */
const verifyCronSecret = (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;

  // If no CRON_SECRET is set, allow requests (for development)
  if (!cronSecret) {
    return next();
  }

  // Check for secret in header or query parameter
  const providedSecret =
    req.headers['x-cron-secret'] ||
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.query.secret;

  if (!providedSecret || providedSecret !== cronSecret) {
    throw new AppError('Unauthorized - Invalid cron secret', 401, 'UNAUTHORIZED');
  }

  next();
};

/**
 * POST /api/cron/daily-digest
 * Trigger daily digest email job
 */
router.post('/daily-digest', cronLimiter, verifyCronSecret, cronController.triggerDailyDigest);

/**
 * POST /api/cron/appointment-reminders
 * Trigger appointment reminder SMS job
 */
router.post('/appointment-reminders', cronLimiter, verifyCronSecret, cronController.triggerAppointmentReminders);

module.exports = router;
