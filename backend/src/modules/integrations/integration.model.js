/**
 * Integration Model
 * Defines the Integration schema for third-party service connections
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const crypto = require('crypto');

/**
 * Valid integration providers
 */
const INTEGRATION_PROVIDERS = {
  VAGARO: 'vagaro',
};

/**
 * Valid integration statuses
 */
const INTEGRATION_STATUS = {
  PENDING: 'pending',      // User started setup but not connected
  ACTIVE: 'active',        // Integration is working
  ERROR: 'error',          // Integration has errors
  DISABLED: 'disabled',    // User disabled the integration
};

const Integration = sequelize.define('Integration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id',
    },
  },
  provider: {
    type: DataTypes.ENUM(...Object.values(INTEGRATION_PROVIDERS)),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(INTEGRATION_STATUS)),
    defaultValue: INTEGRATION_STATUS.PENDING,
    allowNull: false,
  },
  /**
   * Webhook verification token - used to verify incoming webhooks
   * This token should be configured in Vagaro's webhook settings
   */
  webhookToken: {
    type: DataTypes.STRING(64),
    allowNull: false,
    field: 'webhook_token',
  },
  /**
   * Configuration specific to the integration provider
   * For Vagaro: { businessId, businessGroupId }
   */
  config: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  /**
   * Sync settings - what data to sync
   * For Vagaro: { syncAppointments, syncCustomers, syncEmployees }
   */
  syncSettings: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      syncAppointments: true,
      syncCustomers: true,
      syncEmployees: false,
    },
    field: 'sync_settings',
  },
  /**
   * Last successful webhook received
   */
  lastWebhookAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_webhook_at',
  },
  /**
   * Count of webhooks received
   */
  webhookCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'webhook_count',
  },
  /**
   * Last error message if status is 'error'
   */
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'last_error',
  },
  /**
   * Additional metadata
   */
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'integrations',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['tenant_id', 'provider'],
      unique: true,
    },
    {
      fields: ['webhook_token'],
      unique: true,
    },
  ],
});

/**
 * Generate a unique webhook token
 * @returns {string} - Random 64-character hex token
 */
Integration.generateWebhookToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Get integration data safe for API response
 * @returns {Object} - Integration data without sensitive fields
 */
Integration.prototype.toSafeObject = function() {
  const json = this.toJSON();
  // Don't expose the full webhook token in responses
  // Only show a masked version for display purposes
  if (json.webhookToken) {
    json.webhookTokenMasked = json.webhookToken.substring(0, 8) + '...' + json.webhookToken.substring(json.webhookToken.length - 4);
  }
  return json;
};

/**
 * Record a successful webhook
 */
Integration.prototype.recordWebhook = async function() {
  this.lastWebhookAt = new Date();
  this.webhookCount += 1;
  if (this.status === INTEGRATION_STATUS.ERROR) {
    this.status = INTEGRATION_STATUS.ACTIVE;
    this.lastError = null;
  }
  await this.save();
};

/**
 * Record an error
 * @param {string} errorMessage - Error description
 */
Integration.prototype.recordError = async function(errorMessage) {
  this.status = INTEGRATION_STATUS.ERROR;
  this.lastError = errorMessage;
  await this.save();
};

module.exports = {
  Integration,
  INTEGRATION_PROVIDERS,
  INTEGRATION_STATUS,
};
