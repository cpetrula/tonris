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

const { healthRoutes, meRoutes, authRoutes, tenantRoutes, employeeRoutes, serviceRoutes, appointmentRoutes, availabilityRoutes, billingRoutes, telephonyRoutes, aiRoutes, businessTypesRoutes, adminRoutes, voiceRoutes, cronRoutes, locationRoutes, userRoutes } = require('./routes');
const { billingController } = require('./modules/billing');
const { telephonyController } = require('./modules/telephony');
const { aiController, handleMediaStreamConnection } = require('./modules/ai-assistant');
const {
  tenantMiddleware,
  notFoundHandler,
  errorHandler,
} = require('./middleware');
const { initScheduler } = require('./modules/cron/scheduler');

// Create Express application
const app = express();

// Security middleware
// Configure helmet with custom CSP to allow blob URLs for media playback
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'media-src': ["'self'", 'blob:'],
      'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.mxpnl.com'],
      'connect-src': ["'self'", 'https://api.mixpanel.com', 'https://api-js.mixpanel.com'],
    },
  },
}));
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

app.post('/api/webhooks/twilio/outbound-voice',
  express.urlencoded({ extended: false }),
  telephonyController.handleOutboundVoiceWebhook
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

// ElevenLabs check-caller webhook
// Called by AI after greeting to identify caller (client or employee)
// Combines appointment lookup and employee identification in one call
app.get('/api/webhooks/elevenlabs/check-caller',
  webhookRateLimiter,
  aiController.handleCheckCallerWebhook
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

// ElevenLabs Conversation End webhook
// Called by ElevenLabs when a conversation ends
// Provides comprehensive data about the call including status, duration, transcript, and summary
// Must receive raw body for signature verification
app.post('/api/webhooks/elevenlabs/conversation-end',
  webhookRateLimiter,
  express.json({
    verify: (req, _res, buf) => {
      // Store raw body for signature verification
      req.rawBody = buf.toString();
    },
  }),
  aiController.handleConversationEndWebhook
);

// ElevenLabs Agent Management webhooks
// These endpoints allow managing ElevenLabs agents without requiring user authentication
// Used for CLI tools and automation scripts

// GET /api/webhooks/elevenlabs/agents - List all ElevenLabs agents
app.get('/api/webhooks/elevenlabs/agents',
  webhookRateLimiter,
  aiController.handleListAgentsWebhook
);

// GET /api/webhooks/elevenlabs/agents/:agentId - Get specific agent details
app.get('/api/webhooks/elevenlabs/agents/:agentId',
  webhookRateLimiter,
  aiController.handleGetAgentWebhook
);

// PATCH /api/webhooks/elevenlabs/agents/:agentId - Update agent configuration
app.patch('/api/webhooks/elevenlabs/agents/:agentId',
  webhookRateLimiter,
  express.json(),
  aiController.handleUpdateAgentWebhook
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
app.use('/api/voices', voiceRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);

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
  
  // Start the server
  server.listen(env.PORT, () => {
    logger.info(`CRITON.AI Backend server running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
    logger.info(`WebSocket media stream: ws://localhost:${env.PORT}/media-stream`);

    // Check critical configuration
    if (!env.RESEND_API_KEY) {
      logger.warn('⚠️  RESEND_API_KEY not configured - email notifications (including password reset) will not be sent');
    }

    // Initialize cron scheduler
    initScheduler();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    wss.close(() => {
      logger.info('WebSocket server closed');
    });
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    wss.close(() => {
      logger.info('WebSocket server closed');
    });
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  return server;
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
