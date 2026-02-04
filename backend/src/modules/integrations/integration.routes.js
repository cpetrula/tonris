/**
 * Integration Routes
 * Defines all integration-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const integrationController = require('./integration.controller');
const { authMiddleware } = require('../auth/auth.middleware');

const router = express.Router();

/**
 * Rate limiting configuration
 */
const isTestEnv = process.env.NODE_ENV === 'test';

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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

// Slower rate limit for import operations (expensive API calls)
const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 imports per 15 minutes
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'Too many import requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Protected routes - require authentication
 */

// GET /api/integrations - List all integrations
router.get('/', standardLimiter, authMiddleware, integrationController.getIntegrations);

// GET /api/integrations/:provider - Get specific integration
router.get('/:provider', standardLimiter, authMiddleware, integrationController.getIntegration);

// POST /api/integrations/vagaro - Setup Vagaro integration
router.post('/vagaro', standardLimiter, authMiddleware, integrationController.setupVagaroIntegration);

// POST /api/integrations/vagaro/test-connection - Test Vagaro API connection
router.post('/vagaro/test-connection', standardLimiter, authMiddleware, integrationController.testVagaroConnection);

// POST /api/integrations/vagaro/locations - Get Vagaro business locations
router.post('/vagaro/locations', standardLimiter, authMiddleware, integrationController.getVagaroLocations);

// POST /api/integrations/vagaro/import-services - Import services from Vagaro
router.post('/vagaro/import-services', importLimiter, authMiddleware, integrationController.importVagaroServices);

// POST /api/integrations/vagaro/import-staff - Import staff from Vagaro
router.post('/vagaro/import-staff', importLimiter, authMiddleware, integrationController.importVagaroStaff);

// PATCH /api/integrations/:provider - Update integration settings
router.patch('/:provider', standardLimiter, authMiddleware, integrationController.updateIntegration);

// POST /api/integrations/:provider/regenerate-token - Regenerate webhook token
router.post('/:provider/regenerate-token', standardLimiter, authMiddleware, integrationController.regenerateToken);

// DELETE /api/integrations/:provider - Delete integration
router.delete('/:provider', standardLimiter, authMiddleware, integrationController.deleteIntegration);

module.exports = router;
