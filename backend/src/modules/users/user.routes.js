/**
 * User Management Routes
 * Routes for managing users (not authentication)
 */
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authMiddleware } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/authorization');
const { standardLimiter } = require('../../middleware/rateLimiter');

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

module.exports = router;
