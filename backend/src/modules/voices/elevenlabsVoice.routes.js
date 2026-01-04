/**
 * Voice Routes
 * Defines all voice-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const voiceController = require('./elevenlabsVoice.controller');
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
 * Protected routes - require authentication
 */

// GET /api/voices - Get all voices
router.get('/', standardLimiter, authMiddleware, voiceController.getAllVoices);

// GET /api/voices/:id - Get voice by ID
router.get('/:id', standardLimiter, authMiddleware, voiceController.getVoiceById);

module.exports = router;
