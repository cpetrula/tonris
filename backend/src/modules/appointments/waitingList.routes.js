/**
 * Waiting List Routes
 * Endpoints for managing salon waiting lists and school enrollment waitlists
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
const waitingListController = require('./waitingList.controller');
const { authMiddleware } = require('../auth/auth.middleware');

const router = express.Router();

const isTestEnv = process.env.NODE_ENV === 'test';

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

// GET /api/waiting-list - Get waiting list entries
router.get('/', standardLimiter, authMiddleware, waitingListController.getWaitingList);

// POST /api/waiting-list - Add to waiting list
router.post('/', standardLimiter, authMiddleware, waitingListController.addToWaitingList);

// GET /api/waiting-list/position - Get customer's position
router.get('/position', standardLimiter, authMiddleware, waitingListController.getPosition);

// DELETE /api/waiting-list - Remove from waiting list
router.delete('/', standardLimiter, authMiddleware, waitingListController.removeFromWaitingList);

// POST /api/waiting-list/notify-opening - Notify next person about opening
router.post('/notify-opening', standardLimiter, authMiddleware, waitingListController.notifyOpening);

// POST /api/waiting-list/respond - Handle YES/NO response
router.post('/respond', standardLimiter, authMiddleware, waitingListController.handleResponse);

module.exports = router;
