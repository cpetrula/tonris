/**
 * Tenant Model
 * Defines the Tenant schema for multi-tenant architecture
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Valid tenant statuses
 */
const TENANT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};

/**
 * Valid plan types
 */
const PLAN_TYPES = {
  FREE: 'free',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
};

/**
 * Valid status transitions
 */
const VALID_TRANSITIONS = {
  [TENANT_STATUS.PENDING]: [TENANT_STATUS.ACTIVE, TENANT_STATUS.CANCELLED],
  [TENANT_STATUS.ACTIVE]: [TENANT_STATUS.SUSPENDED, TENANT_STATUS.CANCELLED],
  [TENANT_STATUS.SUSPENDED]: [TENANT_STATUS.ACTIVE, TENANT_STATUS.CANCELLED],
  [TENANT_STATUS.CANCELLED]: [], // No transitions from cancelled
};

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255],
    },
  },
  slug: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z0-9-]+$/,
      len: [1, 128],
    },
  },
  status: {
    type: DataTypes.ENUM(...Object.values(TENANT_STATUS)),
    defaultValue: TENANT_STATUS.PENDING,
    allowNull: false,
  },
  planType: {
    type: DataTypes.ENUM(...Object.values(PLAN_TYPES)),
    defaultValue: PLAN_TYPES.FREE,
    allowNull: false,
    field: 'plan_type',
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'contact_email',
    validate: {
      isEmail: true,
    },
  },
  contactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'contact_phone',
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  trialEndsAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'trial_ends_at',
  },
  onboardingCompletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'onboarding_completed_at',
  },
  twilioPhoneNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'twilio_phone_number',
    validate: {
      is: /^[+]?[0-9][0-9\s()-]{5,}$/,
    },
  },
  twilioPhoneNumberSid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'twilio_phone_number_sid',
  },
  elevenlabsPhoneNumberId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'elevenlabs_phone_number_id',
  },
  businessTypeId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'business_type_id',
    references: {
      model: 'business_types',
      key: 'id',
    },
  },
}, {
  tableName: 'tenants',
  timestamps: true,
});

/**
 * Check if a status transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {boolean} - True if transition is valid
 */
Tenant.isValidTransition = function(fromStatus, toStatus) {
  const allowedTransitions = VALID_TRANSITIONS[fromStatus];
  return allowedTransitions && allowedTransitions.includes(toStatus);
};

/**
 * Transition tenant to a new status
 * @param {string} newStatus - Target status
 * @returns {Promise<Tenant>} - Updated tenant
 */
Tenant.prototype.transitionTo = async function(newStatus) {
  if (!Tenant.isValidTransition(this.status, newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  await this.save();
  return this;
};

/**
 * Get tenant data safe for API response
 * @returns {Object} - Tenant data without sensitive fields
 */
Tenant.prototype.toSafeObject = function() {
  const tenantJson = this.toJSON();
  // Remove any internal metadata if needed
  return tenantJson;
};

/**
 * Update tenant settings (merge with existing)
 * @param {Object} newSettings - Settings to merge
 * @returns {Promise<Tenant>} - Updated tenant
 */
Tenant.prototype.updateSettings = async function(newSettings) {
  // Get the current settings as a plain object to avoid Sequelize getter issues
  const currentSettings = this.getDataValue('settings') || {};
  
  // Create a new settings object by merging
  const updatedSettings = {
    ...currentSettings,
    ...newSettings,
  };
  
  // Set the new settings value
  this.setDataValue('settings', updatedSettings);
  
  // Explicitly mark the settings field as changed for Sequelize
  // This is necessary because Sequelize doesn't always detect changes to JSON columns
  this.changed('settings', true);
  
  await this.save();
  return this;
};

/**
 * Generate default settings for a new tenant
 * @returns {Object} - Default settings
 */
Tenant.generateDefaultSettings = function() {
  return {
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'USD',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    businessHours: {
      monday: { open: '09:00', close: '17:00', enabled: true },
      tuesday: { open: '09:00', close: '17:00', enabled: true },
      wednesday: { open: '09:00', close: '17:00', enabled: true },
      thursday: { open: '09:00', close: '17:00', enabled: true },
      friday: { open: '09:00', close: '17:00', enabled: true },
      saturday: { open: '10:00', close: '14:00', enabled: false },
      sunday: { open: '10:00', close: '14:00', enabled: false },
    },
  };
};

module.exports = {
  Tenant,
  TENANT_STATUS,
  PLAN_TYPES,
  VALID_TRANSITIONS,
};
