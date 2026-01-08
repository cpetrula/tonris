/**
 * AI Routes
 * Defines all AI assistant-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const aiController = require('./ai.controller');
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

const conversationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for conversation
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'Too many conversation requests, please slow down',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * All routes require authentication
 */

// POST /api/ai/availability - Query availability for AI
router.post('/availability', standardLimiter, authMiddleware, aiController.queryAvailability);

// POST /api/ai/appointments - Manage appointments via AI
router.post('/appointments', standardLimiter, authMiddleware, aiController.manageAppointment);

// POST /api/ai/services - Get services information
router.post('/services', standardLimiter, authMiddleware, aiController.getServices);

// POST /api/ai/hours - Get business hours
router.post('/hours', standardLimiter, authMiddleware, aiController.getBusinessHours);

// POST /api/ai/conversation - Process conversation input
router.post('/conversation', conversationLimiter, authMiddleware, aiController.processConversation);

// GET /api/ai/config - Get AI configuration for tenant
router.get('/config', standardLimiter, authMiddleware, aiController.getAIConfig);

// ElevenLabs Agent Management routes
// GET /api/ai/agents - List all ElevenLabs agents
router.get('/agents', standardLimiter, authMiddleware, aiController.listAgents);

// GET /api/ai/agents/:agentId - Get a specific agent's details
router.get('/agents/:agentId', standardLimiter, authMiddleware, aiController.getAgent);

// PATCH /api/ai/agents/:agentId - Update an agent's configuration
router.patch('/agents/:agentId', standardLimiter, authMiddleware, aiController.updateAgent);

// POST /api/ai/webhook/elevenlabs - Handle ElevenLabs webhooks (no auth required for webhooks)
router.post('/webhook/elevenlabs', express.json(), aiController.handleElevenLabsWebhook);

// POST /api/ai/webhook/elevenlabs/employee-schedule - Employee self-service schedule updates via voice
// No auth required - authentication is via phone number matching
router.post('/webhook/elevenlabs/employee-schedule', express.json(), aiController.handleEmployeeScheduleWebhook);

module.exports = router;
