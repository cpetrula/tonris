/**
 * User Management Routes
 * Routes for managing users (not authentication)
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const userController = require('./user.controller');
const { authMiddleware } = require('../auth/auth.middleware');
const { requireAdmin } = require('../../middleware/authorization');

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

// All routes require authentication and admin role (Owner/Admin)

// GET /api/users - Get all users for tenant
router.get('/', standardLimiter, authMiddleware, requireAdmin(), userController.getUsers);

// GET /api/users/:id - Get specific user
router.get('/:id', standardLimiter, authMiddleware, requireAdmin(), userController.getUser);

// POST /api/users - Create new user
router.post('/', standardLimiter, authMiddleware, requireAdmin(), userController.createUser);

// PATCH /api/users/:id - Update user
router.patch('/:id', standardLimiter, authMiddleware, requireAdmin(), userController.updateUser);

// POST /api/users/:id/enable-login - Enable login for user
router.post('/:id/enable-login', standardLimiter, authMiddleware, requireAdmin(), userController.enableLogin);

// POST /api/users/:id/resend-temp-password - Resend temporary password
router.post('/:id/resend-temp-password', standardLimiter, authMiddleware, requireAdmin(), userController.resendTempPassword);

module.exports = router;
