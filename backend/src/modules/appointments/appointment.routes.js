/**
 * Appointment Routes
 * Defines all appointment-related endpoints
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
 * GET routes require authentication, POST/PATCH/DELETE do not
 */

// GET /api/appointments - Get all appointments
router.get('/', standardLimiter, authMiddleware, appointmentController.getAppointments);

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', standardLimiter, authMiddleware, appointmentController.getAppointment);

// POST /api/appointments - Create a new appointment
router.post('/', standardLimiter, appointmentController.createAppointment);

// PATCH /api/appointments/:id - Update appointment (reschedule)
router.patch('/:id', standardLimiter, appointmentController.updateAppointment);

// DELETE /api/appointments/:id - Cancel or delete appointment
router.delete('/:id', standardLimiter, appointmentController.deleteAppointment);

module.exports = router;
