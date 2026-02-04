/**
 * Integration Service
 * Business logic for managing third-party integrations
 */
const { Integration, INTEGRATION_PROVIDERS, INTEGRATION_STATUS } = require('./integration.model');
const logger = require('../../utils/logger');

/**
 * Get all integrations for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Integration[]>} - Array of integrations
 */
async function getIntegrations(tenantId) {
  return Integration.findAll({
    where: { tenantId },
    order: [['createdAt', 'DESC']],
  });
}

/**
 * Get a specific integration by provider
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Integration provider (e.g., 'vagaro')
 * @returns {Promise<Integration|null>} - Integration or null
 */
async function getIntegrationByProvider(tenantId, provider) {
  return Integration.findOne({
    where: { tenantId, provider },
  });
}

/**
 * Get integration by webhook token (for webhook authentication)
 * @param {string} webhookToken - The webhook verification token
 * @returns {Promise<Integration|null>} - Integration or null
 */
async function getIntegrationByWebhookToken(webhookToken) {
  return Integration.findOne({
    where: { webhookToken },
  });
}

/**
 * Create or update a Vagaro integration
 * @param {string} tenantId - Tenant ID
 * @param {Object} data - Integration data
 * @returns {Promise<Integration>} - Created or updated integration
 */
async function upsertVagaroIntegration(tenantId, data = {}) {
  const existing = await getIntegrationByProvider(tenantId, INTEGRATION_PROVIDERS.VAGARO);
  
  if (existing) {
    // Update existing integration
    if (data.config) existing.config = { ...existing.config, ...data.config };
    if (data.syncSettings) existing.syncSettings = { ...existing.syncSettings, ...data.syncSettings };
    if (data.status) existing.status = data.status;
    await existing.save();
    return existing;
  }
  
  // Create new integration
  const webhookToken = Integration.generateWebhookToken();
  
  return Integration.create({
    tenantId,
    provider: INTEGRATION_PROVIDERS.VAGARO,
    webhookToken,
    status: INTEGRATION_STATUS.PENDING,
    config: data.config || {},
    syncSettings: data.syncSettings || {
      syncAppointments: true,
      syncCustomers: true,
      syncEmployees: false,
    },
  });
}

/**
 * Regenerate webhook token for an integration
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Integration provider
 * @returns {Promise<Integration>} - Updated integration
 */
async function regenerateWebhookToken(tenantId, provider) {
  const integration = await getIntegrationByProvider(tenantId, provider);
  
  if (!integration) {
    throw new Error('Integration not found');
  }
  
  integration.webhookToken = Integration.generateWebhookToken();
  integration.status = INTEGRATION_STATUS.PENDING; // Reset status since token changed
  await integration.save();
  
  return integration;
}

/**
 * Delete an integration
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Integration provider
 * @returns {Promise<boolean>} - True if deleted
 */
async function deleteIntegration(tenantId, provider) {
  const integration = await getIntegrationByProvider(tenantId, provider);
  
  if (!integration) {
    return false;
  }
  
  await integration.destroy();
  return true;
}

/**
 * Enable or disable an integration
 * @param {string} tenantId - Tenant ID
 * @param {string} provider - Integration provider
 * @param {boolean} enabled - Whether to enable or disable
 * @returns {Promise<Integration>} - Updated integration
 */
async function setIntegrationEnabled(tenantId, provider, enabled) {
  const integration = await getIntegrationByProvider(tenantId, provider);
  
  if (!integration) {
    throw new Error('Integration not found');
  }
  
  integration.status = enabled ? INTEGRATION_STATUS.ACTIVE : INTEGRATION_STATUS.DISABLED;
  await integration.save();
  
  return integration;
}

/**
 * Build the webhook URL for a tenant's integration
 * @param {string} webhookToken - The webhook token
 * @param {string} provider - Integration provider
 * @returns {string} - Full webhook URL
 */
function buildWebhookUrl(webhookToken, provider) {
  const baseUrl = process.env.BASE_URL || 'https://app.criton.ai';
  return `${baseUrl}/api/webhooks/${provider}/${webhookToken}`;
}

module.exports = {
  getIntegrations,
  getIntegrationByProvider,
  getIntegrationByWebhookToken,
  upsertVagaroIntegration,
  regenerateWebhookToken,
  deleteIntegration,
  setIntegrationEnabled,
  buildWebhookUrl,
};
