/**
 * Integrations Module
 * Export all integration-related components
 */
const { Integration, INTEGRATION_PROVIDERS, INTEGRATION_STATUS } = require('./integration.model');
const integrationService = require('./integration.service');
const integrationController = require('./integration.controller');
const integrationRoutes = require('./integration.routes');
const { handleVagaroWebhook } = require('./vagaro.webhook');
const vagaroApi = require('./vagaro.api');

module.exports = {
  // Model
  Integration,
  INTEGRATION_PROVIDERS,
  INTEGRATION_STATUS,
  
  // Service
  integrationService,
  
  // Controller
  integrationController,
  
  // Routes
  integrationRoutes,
  
  // Webhook handlers
  handleVagaroWebhook,
  
  // Vagaro API client
  vagaroApi,
};
