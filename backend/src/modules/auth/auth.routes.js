/**
 * Authentication Routes
 * Defines all authentication-related endpoints
 */
const express = require('express');
const authController = require('./auth.controller');
const { authMiddleware } = require('./auth.middleware');

const router = express.Router();

/**
 * Public routes - no authentication required
 */

// POST /api/auth/signup - Register a new user
router.post('/signup', authController.signup);

// POST /api/auth/login - Authenticate user
router.post('/login', authController.login);

// POST /api/auth/forgot-password - Initiate password reset
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', authController.resetPassword);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

/**
 * Protected routes - require authentication
 */

// GET /api/auth/me - Get current user profile
router.get('/me', authMiddleware, authController.getProfile);

// POST /api/auth/2fa/setup - Setup 2FA
router.post('/2fa/setup', authMiddleware, authController.setup2FA);

// POST /api/auth/2fa/verify - Verify and enable 2FA
router.post('/2fa/verify', authMiddleware, authController.verify2FA);

// POST /api/auth/2fa/disable - Disable 2FA
router.post('/2fa/disable', authMiddleware, authController.disable2FA);

module.exports = router;
