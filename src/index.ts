/**
 * Tonris - Multi-tenant AI Assistant Platform
 * Main application entry point
 */

import express from 'express';
import tenantRoutes from './routes/tenants.js';
import serviceRoutes from './routes/services.js';
import staffRoutes from './routes/staff.js';
import appointmentRoutes from './routes/appointments.js';
import hoursRoutes from './routes/hours.js';
import faqRoutes from './routes/faqs.js';
import assistantRoutes from './routes/assistant.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', tenantRoutes);
app.use('/api/v1', serviceRoutes);
app.use('/api/v1', staffRoutes);
app.use('/api/v1', appointmentRoutes);
app.use('/api/v1', hoursRoutes);
app.use('/api/v1', faqRoutes);
app.use('/api/v1', assistantRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Tonris server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api/v1`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  POST   /api/v1/tenants              - Create a new tenant`);
    console.log(`  GET    /api/v1/tenants/:id          - Get tenant details`);
    console.log(`  POST   /api/v1/tenants/:id/businesses - Create a business`);
    console.log(`  GET    /api/v1/businesses/:id       - Get business details`);
    console.log(`  POST   /api/v1/businesses/:id/services - Create a service`);
    console.log(`  POST   /api/v1/businesses/:id/staff - Create staff member`);
    console.log(`  POST   /api/v1/appointments         - Book an appointment`);
    console.log(`  GET    /api/v1/businesses/:id/availability - Check availability`);
    console.log(`  POST   /api/v1/assistant/message    - Chat with AI assistant`);
  });
}

export { app };
