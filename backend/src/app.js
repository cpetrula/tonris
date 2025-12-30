/**
 * CRITON.AI Backend Application
 * Main Express application entry point
 */
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { WebSocketServer } = require('ws');
const http = require('http');

const env = require('./config/env');
const logger = require('./utils/logger');

// Initialize models and associations early
require('./models');

const { healthRoutes, meRoutes, authRoutes, tenantRoutes, employeeRoutes, serviceRoutes, appointmentRoutes, availabilityRoutes, billingRoutes, telephonyRoutes, aiRoutes, businessTypesRoutes, adminRoutes } = require('./routes');
const { billingController } = require('./modules/billing');
const { telephonyController } = require('./modules/telephony');
const { aiController, handleMediaStreamConnection, getActiveStreamCount, forceCloseAllStreams } = require('./modules/ai-assistant');
const { liveCallStream } = require('./services/liveCallStream.service');
const {
  tenantMiddleware,
  notFoundHandler,
  errorHandler,
} = require('./middleware');

// Create Express application
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiter for webhooks (more lenient than user-facing endpoints)
const webhookRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  skip: () => env.isTest(), // Skip in test environment
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stripe webhook route needs raw body - must be before express.json()
app.post('/api/webhooks/stripe', 
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body;
    next();
  },
  billingController.handleStripeWebhook
);

// Twilio webhook routes - use urlencoded body parsing
// These are placed before the general body parser
app.post('/api/webhooks/twilio/voice',
  express.urlencoded({ extended: false }),
  telephonyController.handleVoiceWebhook
);

app.post('/api/webhooks/twilio/sms',
  express.urlencoded({ extended: false }),
  telephonyController.handleSmsWebhook
);

app.post('/api/webhooks/twilio/status',
  express.urlencoded({ extended: false }),
  telephonyController.handleStatusWebhook
);

// Twilio to ElevenLabs webhook - connects incoming calls to ElevenLabs Conversational AI
app.post('/api/webhooks/twilio/elevenlabs',
  webhookRateLimiter,
  express.urlencoded({ extended: false }),
  aiController.handleTwilioElevenLabsWebhook
);

// ElevenLabs Conversation Initiation Client Data webhook
// Called by ElevenLabs when a new Twilio phone call or SIP trunk call conversation begins
// This webhook must receive raw body for signature verification
app.post('/api/webhooks/elevenlabs/conversation-initiation',
  webhookRateLimiter,
  express.json({
    verify: (req, _res, buf) => {
      // Store raw body for signature verification
      req.rawBody = buf.toString();
    },
  }),
  aiController.handleConversationInitiationWebhook
);

// ElevenLabs Client Data webhook for services
// Called by ElevenLabs to fetch services for a tenant
// This endpoint does not require Bearer token authentication
app.get('/api/webhooks/elevenlabs/services',
  webhookRateLimiter,
  aiController.handleElevenLabsServicesWebhook
);

// ElevenLabs Client Data webhook for employees
// Called by ElevenLabs to fetch employees for a tenant
// This endpoint does not require Bearer token authentication
app.get('/api/webhooks/elevenlabs/employees',
  webhookRateLimiter,
  aiController.handleElevenLabsEmployeesWebhook
);

// ElevenLabs Client Data webhook for appointments
// Called by ElevenLabs to fetch appointments for a tenant
// This endpoint does not require Bearer token authentication
app.get('/api/webhooks/elevenlabs/appointments',
  webhookRateLimiter,
  aiController.handleElevenLabsAppointmentsWebhook
);

// ElevenLabs Client Data webhook for creating appointments
// Called by ElevenLabs Custom Actions to create an appointment
// This endpoint does not require Bearer token authentication
// Must receive raw body for signature verification
app.post('/api/webhooks/elevenlabs/appointments',
  webhookRateLimiter,
  express.json({
    verify: (req, _res, buf) => {
      // Store raw body for signature verification
      req.rawBody = buf.toString();
    },
  }),
  aiController.handleElevenLabsCreateAppointmentWebhook
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Multi-tenant middleware - apply to all routes except health check base
app.use('/api', tenantMiddleware);

// Routes
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/telephony', telephonyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/business-types', businessTypesRoutes);
app.use('/api/admin', adminRoutes);

// Static file serving - serve frontend build from frontend/dist directory
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// SPA fallback - serve index.html for non-API routes (client-side routing support)
app.get('/{*path}', (req, res, next) => {
  // Skip API routes and health check routes
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If index.html doesn't exist, fall through to 404 handler
      next();
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Enable trust proxy
app.set('trust proxy', 1); // Trust the first proxy (e.g., Nginx, AWS ELB)


// Start server (only if not in test mode)
const startServer = () => {
  // Create HTTP server from Express app
  const server = http.createServer(app);
  
  // Create WebSocket server for media streams
  const wss = new WebSocketServer({ 
    server,
    path: '/media-stream',
  });
  
  // Handle WebSocket connections for Twilio media streams
  wss.on('connection', (ws, req) => {
    logger.info('[WebSocket] New media stream connection');
    handleMediaStreamConnection(ws, req);
  });

  wss.on('error', (error) => {
    logger.error(`[WebSocket] Server error: ${error.message}`);
  });

  // Create WebSocket server for live call monitoring
  const liveCallsWss = new WebSocketServer({
    server,
    path: '/live-calls',
  });

  // Handle WebSocket connections for live call monitoring dashboard
  liveCallsWss.on('connection', (ws, req) => {
    // Extract tenant_id from query params for filtering
    const url = new URL(req.url, `http://${req.headers.host}`);
    const tenantId = url.searchParams.get('tenant_id');
    logger.info(`[WebSocket] New live calls client${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    liveCallStream.addClient(ws, tenantId);
  });

  liveCallsWss.on('error', (error) => {
    logger.error(`[WebSocket] Live calls server error: ${error.message}`);
  });
  
  // Start the server
  server.listen(env.PORT, () => {
    logger.info(`CRITON.AI Backend server running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
    logger.info(`WebSocket media stream: ws://localhost:${env.PORT}/media-stream`);
    logger.info(`WebSocket live calls: ws://localhost:${env.PORT}/live-calls`);
  });

  // Graceful shutdown configuration
  const SHUTDOWN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max wait for calls
  const SHUTDOWN_POLL_INTERVAL_MS = 5000; // Check every 5 seconds
  let isShuttingDown = false;

  /**
   * Graceful shutdown handler
   * Waits for active calls to complete before closing
   * @param {string} signal - The signal that triggered shutdown
   */
  const gracefulShutdown = async (signal) => {
    if (isShuttingDown) {
      logger.info(`[Shutdown] Already shutting down, ignoring ${signal}`);
      return;
    }
    isShuttingDown = true;

    logger.info(`[Shutdown] ${signal} received: initiating graceful shutdown`);

    // Stop accepting new connections
    wss.close(() => {
      logger.info('[Shutdown] Media stream WebSocket server closed to new connections');
    });

    liveCallsWss.close(() => {
      logger.info('[Shutdown] Live calls WebSocket server closed');
    });

    // Close all live call stream clients
    liveCallStream.closeAllClients();

    // Check for active calls
    const initialCount = getActiveStreamCount();
    if (initialCount > 0) {
      logger.info(`[Shutdown] Waiting for ${initialCount} active call(s) to complete...`);

      const startTime = Date.now();

      // Wait for active calls to complete (max 5 minutes)
      while (getActiveStreamCount() > 0) {
        const elapsed = Date.now() - startTime;

        if (elapsed >= SHUTDOWN_TIMEOUT_MS) {
          const remaining = getActiveStreamCount();
          logger.warn(`[Shutdown] Timeout reached. Force-closing ${remaining} active call(s)`);
          forceCloseAllStreams();
          break;
        }

        const remaining = getActiveStreamCount();
        const timeLeft = Math.round((SHUTDOWN_TIMEOUT_MS - elapsed) / 1000);
        logger.info(`[Shutdown] ${remaining} active call(s) remaining. Timeout in ${timeLeft}s`);

        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, SHUTDOWN_POLL_INTERVAL_MS));
      }
    }

    logger.info('[Shutdown] All calls completed. Closing HTTP server...');

    server.close(() => {
      logger.info('[Shutdown] HTTP server closed. Goodbye!');
      process.exit(0);
    });

    // Force exit if server.close hangs
    setTimeout(() => {
      logger.error('[Shutdown] Forced exit after server.close timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
