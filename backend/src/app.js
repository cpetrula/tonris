/**
 * TONRIS Backend Application
 * Main Express application entry point
 */
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const env = require('./config/env');
const logger = require('./utils/logger');
const { healthRoutes, meRoutes, authRoutes, tenantRoutes, employeeRoutes, serviceRoutes, appointmentRoutes, availabilityRoutes, billingRoutes, telephonyRoutes, aiRoutes } = require('./routes');
const { billingController } = require('./modules/billing');
const { telephonyController } = require('./modules/telephony');
const { aiController } = require('./modules/ai-assistant');
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
  express.urlencoded({ extended: false }),
  aiController.handleTwilioElevenLabsWebhook
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

// Start server (only if not in test mode)
const startServer = () => {
  const server = app.listen(env.PORT, () => {
    logger.info(`TONRIS Backend server running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
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
