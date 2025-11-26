/**
 * Health Check Routes
 * Provides endpoints for monitoring application health
 */
const express = require('express');
const { testConnection } = require('../config/db');
const env = require('../config/env');

const router = express.Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

/**
 * GET /health/detailed
 * Detailed health check including database status
 */
router.get('/detailed', async (req, res, next) => {
  try {
    const dbStatus = await testConnection();
    
    const healthStatus = {
      success: true,
      status: dbStatus ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      checks: {
        server: {
          status: 'up',
          uptime: process.uptime(),
        },
        database: {
          status: dbStatus ? 'up' : 'down',
        },
        memory: {
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
        },
      },
    };
    
    const statusCode = dbStatus ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /health/ready
 * Readiness probe for orchestration systems
 */
router.get('/ready', async (req, res) => {
  const dbStatus = await testConnection();
  
  if (dbStatus) {
    res.json({
      success: true,
      status: 'ready',
    });
  } else {
    res.status(503).json({
      success: false,
      status: 'not ready',
      message: 'Database connection not available',
    });
  }
});

/**
 * GET /health/live
 * Liveness probe for orchestration systems
 */
router.get('/live', (req, res) => {
  res.json({
    success: true,
    status: 'alive',
  });
});

module.exports = router;
