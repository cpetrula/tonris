/**
 * Authentication Module
 * Central export for all authentication functionality
 */
const authRoutes = require('./auth.routes');
const authService = require('./auth.service');
const authController = require('./auth.controller');
const { authMiddleware, optionalAuthMiddleware } = require('./auth.middleware');
const jwtUtils = require('./jwt.utils');
const twoFactorUtils = require('./2fa.utils');

module.exports = {
  // Routes
  authRoutes,
  
  // Service
  authService,
  
  // Controller
  authController,
  
  // Middleware
  authMiddleware,
  optionalAuthMiddleware,
  
  // Utilities
  jwtUtils,
  twoFactorUtils,
};
