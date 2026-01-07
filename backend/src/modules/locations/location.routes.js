/**
 * Location Routes
 * API endpoints for location management
 */
const express = require('express');
const router = express.Router();
const locationController = require('./location.controller');
const { authMiddleware } = require('../auth/auth.middleware');
const { requireRole } = require('../../middleware/authorization');
const rateLimit = require('express-rate-limit');

// Rate limiting for location routes
const locationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
});

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(locationLimiter);

// Public routes (any authenticated user can view)
router.get('/', locationController.getLocations);
router.get('/default', locationController.getDefaultLocation);
router.get('/:id', locationController.getLocationById);

// Admin+ routes (require admin or higher role)
router.post('/', requireRole('admin'), locationController.createLocation);
router.patch('/:id', requireRole('admin'), locationController.updateLocation);
router.delete('/:id', requireRole('admin'), locationController.deleteLocation);
router.patch('/:id/default', requireRole('admin'), locationController.setDefaultLocation);

module.exports = router;
