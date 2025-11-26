/**
 * Employee Routes
 * Defines all employee-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const employeeController = require('./employee.controller');
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

// GET /api/employees - Get all employees
router.get('/', standardLimiter, authMiddleware, employeeController.getEmployees);

// GET /api/employees/:id - Get employee by ID
router.get('/:id', standardLimiter, authMiddleware, employeeController.getEmployee);

// POST /api/employees - Create a new employee
router.post('/', standardLimiter, authMiddleware, employeeController.createEmployee);

// PATCH /api/employees/:id - Update employee
router.patch('/:id', standardLimiter, authMiddleware, employeeController.updateEmployee);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', standardLimiter, authMiddleware, employeeController.deleteEmployee);

// GET /api/employees/:id/schedule - Get employee schedule
router.get('/:id/schedule', standardLimiter, authMiddleware, employeeController.getEmployeeSchedule);

// PUT /api/employees/:id/schedule - Update employee schedule
router.put('/:id/schedule', standardLimiter, authMiddleware, employeeController.updateEmployeeSchedule);

module.exports = router;
