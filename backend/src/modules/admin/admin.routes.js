/**
 * Admin Routes
 * Defines admin-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const adminController = require('./admin.controller');
const { adminAuthMiddleware } = require('./admin.middleware');

const router = express.Router();

/**
 * Rate limiting for admin endpoints
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin routes - all require admin password authentication
 */

// GET /api/admin/clients - Get all clients (tenants)
router.get('/clients', adminLimiter, adminAuthMiddleware, adminController.getClients);

module.exports = router;
