/**
 * Authentication Routes
 * Defines all authentication-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const { authMiddleware } = require('./auth.middleware');

const router = express.Router();

/**
 * Rate limiting configurations
 * Skip rate limiting in test environment to allow tests to run properly
 */
const isTestEnv = process.env.NODE_ENV === 'test';

// Strict rate limit for authentication attempts (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Standard rate limit for authenticated routes
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

// POST /api/auth/signup - Register a new user
router.post('/signup', authLimiter, authController.signup);

// POST /api/auth/register - Full registration (create tenant with business type and user)
router.post('/register', authLimiter, authController.register);

// POST /api/auth/login - Authenticate user
router.post('/login', authLimiter, authController.login);

// POST /api/auth/forgot-password - Initiate password reset
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', authLimiter, authController.resetPassword);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authLimiter, authController.refreshToken);

/**
 * Protected routes - require authentication
 */

// GET /api/auth/me - Get current user profile
router.get('/me', standardLimiter, authMiddleware, authController.getProfile);

// POST /api/auth/2fa/setup - Setup 2FA
router.post('/2fa/setup', standardLimiter, authMiddleware, authController.setup2FA);

// POST /api/auth/2fa/verify - Verify and enable 2FA
router.post('/2fa/verify', authLimiter, authMiddleware, authController.verify2FA);

// POST /api/auth/2fa/disable - Disable 2FA
router.post('/2fa/disable', authLimiter, authMiddleware, authController.disable2FA);

module.exports = router;
