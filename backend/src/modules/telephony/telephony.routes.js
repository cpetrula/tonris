/**
 * Telephony Routes
 * Defines all telephony-related endpoints
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const telephonyController = require('./telephony.controller');
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

const smsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 SMS per minute
  skip: () => isTestEnv,
  message: {
    success: false,
    error: 'SMS rate limit exceeded, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Protected routes - require authentication
 */

// POST /api/telephony/provision-number - Provision a new phone number
router.post('/provision-number', standardLimiter, authMiddleware, telephonyController.provisionNumber);

// DELETE /api/telephony/release-number/:sid - Release a phone number
router.delete('/release-number/:sid', standardLimiter, authMiddleware, telephonyController.releaseNumber);

// POST /api/telephony/send-sms - Send SMS to customer
router.post('/send-sms', smsLimiter, authMiddleware, telephonyController.sendSms);

// POST /api/telephony/send-employee-sms - Send SMS to employee
router.post('/send-employee-sms', smsLimiter, authMiddleware, telephonyController.sendEmployeeSms);

// POST /api/telephony/send-appointment-reminder - Send appointment reminder
router.post('/send-appointment-reminder', smsLimiter, authMiddleware, telephonyController.sendAppointmentReminder);

// GET /api/telephony/call-logs - Get call logs
router.get('/call-logs', standardLimiter, authMiddleware, telephonyController.getCallLogs);

// POST /api/telephony/make-call - Make outbound call
router.post('/make-call', standardLimiter, authMiddleware, telephonyController.makeCall);

// POST /api/telephony/test-sms - Test SMS functionality
// WARNING: No authentication required - for development/testing only
// In production, consider disabling this endpoint or adding IP restrictions
router.post('/test-sms', smsLimiter, telephonyController.testSms);

/**
 * SMS Consent Management Routes
 */

// GET /api/telephony/sms/consent/:phone - Check SMS consent status
router.get('/sms/consent/:phone', standardLimiter, authMiddleware, telephonyController.checkSmsConsent);

// POST /api/telephony/sms/consent - Record SMS consent
router.post('/sms/consent', standardLimiter, authMiddleware, telephonyController.recordSmsConsent);

// GET /api/telephony/sms/messages/:phone - Get SMS conversation history
router.get('/sms/messages/:phone', standardLimiter, authMiddleware, telephonyController.getSmsConversation);

module.exports = router;
