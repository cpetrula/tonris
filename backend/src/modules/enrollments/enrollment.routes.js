/**
 * Enrollment Routes
 * Defines public and authenticated enrollment endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const enrollmentController = require('./enrollment.controller');
const { authMiddleware } = require('../auth/auth.middleware');

const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * Public routes - no auth required
 * Mounted at /api/public/enrollments (before tenantMiddleware in app.js)
 */
const publicRouter = express.Router();

const publicEnrollmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 submissions per IP per 15 min
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'Too many enrollment submissions. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/public/enrollments - Submit enrollment form
publicRouter.post('/', publicEnrollmentLimiter, enrollmentController.submitPublicEnrollment);

// GET /api/public/enrollments/programs - Get available programs
publicRouter.get('/programs', standardLimiter, enrollmentController.getPublicPrograms);

/**
 * Authenticated routes
 * Mounted at /api/enrollments (after tenantMiddleware in app.js)
 */
const enrollmentRouter = express.Router();

// GET /api/enrollments - List enrollments
enrollmentRouter.get('/', standardLimiter, authMiddleware, enrollmentController.getEnrollments);

// GET /api/enrollments/:id - Get enrollment detail
enrollmentRouter.get('/:id', standardLimiter, authMiddleware, enrollmentController.getEnrollment);

// PATCH /api/enrollments/:id - Update enrollment
enrollmentRouter.patch('/:id', standardLimiter, authMiddleware, enrollmentController.updateEnrollment);

// DELETE /api/enrollments/:id - Delete enrollment
enrollmentRouter.delete('/:id', standardLimiter, authMiddleware, enrollmentController.deleteEnrollment);

// POST /api/enrollments/:id/approve - Approve enrollment
enrollmentRouter.post('/:id/approve', standardLimiter, authMiddleware, enrollmentController.approveEnrollment);

// POST /api/enrollments/:id/reject - Reject enrollment
enrollmentRouter.post('/:id/reject', standardLimiter, authMiddleware, enrollmentController.rejectEnrollment);

module.exports = {
  publicEnrollmentRoutes: publicRouter,
  enrollmentRoutes: enrollmentRouter,
};
