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
  businessHours: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    field: 'business_hours',
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
  
  // Handle case where address might be stored as a JSON string instead of object
  // This can happen with some database configurations or data migrations
  if (tenantJson.address && typeof tenantJson.address === 'string') {
    try {
      tenantJson.address = JSON.parse(tenantJson.address);
    } catch (error) {
      // If parsing fails, leave it as is or set to null
      console.warn(`Failed to parse address JSON for tenant ${this.id}:`, error.message);
      tenantJson.address = null;
    }
  }
  
  // Handle case where metadata might be stored as a JSON string
  if (tenantJson.metadata && typeof tenantJson.metadata === 'string') {
    try {
      tenantJson.metadata = JSON.parse(tenantJson.metadata);
    } catch (error) {
      console.warn(`Failed to parse metadata JSON for tenant ${this.id}:`, error.message);
      tenantJson.metadata = null;
    }
  }
  
  return tenantJson;
};

/**
 * Update tenant business hours (merge with existing)
 * @param {Object} newHours - Business hours to merge
 * @returns {Promise<Tenant>} - Updated tenant
 */
Tenant.prototype.updateBusinessHours = async function(newHours) {
  // Get the current business_hours as a plain object to avoid Sequelize getter issues
  let currentData = this.getDataValue('business_hours');
  
  // Handle bad data scenarios - if business_hours is not a valid object, reset to empty
  if (!currentData || typeof currentData !== 'object' || Array.isArray(currentData)) {
    currentData = {};
  }
  
  // Ensure we're working with a plain object by deep cloning
  // JSON.parse/stringify is used here because business_hours is already JSON-serializable
  // and we need to detach from any Sequelize proxies or getters
  try {
    currentData = JSON.parse(JSON.stringify(currentData));
  } catch (error) {
    // If JSON serialization fails (e.g., circular references), start fresh
    currentData = {};
  }
  
  // Create a new data object by merging - newHours should be the businessHours object
  const updatedData = {
    businessHours: newHours,
  };
  
  // Set the new business_hours value
  this.setDataValue('business_hours', updatedData);
  
  // Explicitly mark the business_hours field as changed for Sequelize
  // This is necessary because Sequelize doesn't always detect changes to JSON columns
  this.changed('business_hours', true);
  
  await this.save();
  
  // Reload from database to ensure the value was persisted correctly
  await this.reload();
  
  return this;
};

/**
 * Update tenant settings (deprecated - use updateBusinessHours instead)
 * @param {Object} newSettings - Settings to merge
 * @returns {Promise<Tenant>} - Updated tenant
 * @deprecated Use updateBusinessHours instead
 */
Tenant.prototype.updateSettings = async function(newSettings) {
  // For backward compatibility, if businessHours is in newSettings, use it
  if (newSettings.businessHours) {
    return this.updateBusinessHours(newSettings.businessHours);
  }
  return this;
};

/**
 * Generate default business hours for a new tenant
 * @returns {Object} - Default business hours
 */
Tenant.generateDefaultBusinessHours = function() {
  return {
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

/**
 * Generate default settings (deprecated - use generateDefaultBusinessHours)
 * @returns {Object} - Default settings
 * @deprecated Use generateDefaultBusinessHours instead
 */
Tenant.generateDefaultSettings = function() {
  return Tenant.generateDefaultBusinessHours();
};

/**
 * Sanitize and repair tenant business hours
 * This method fixes corrupt or malformed business hours data
 * @returns {Promise<Tenant>} - Tenant with sanitized business hours
 */
Tenant.prototype.sanitizeBusinessHours = async function() {
  let currentData = this.getDataValue('business_hours');
  
  // If business_hours is completely invalid, reset to defaults
  if (!currentData || typeof currentData !== 'object' || Array.isArray(currentData)) {
    this.setDataValue('business_hours', Tenant.generateDefaultBusinessHours());
    this.changed('business_hours', true);
    await this.save();
    await this.reload();
    return this;
  }
  
  // Try to parse and re-serialize to catch any hidden issues
  try {
    currentData = JSON.parse(JSON.stringify(currentData));
  } catch (error) {
    // If serialization fails, reset to defaults
    this.setDataValue('business_hours', Tenant.generateDefaultBusinessHours());
    this.changed('business_hours', true);
    await this.save();
    await this.reload();
    return this;
  }
  
  // Ensure businessHours key exists
  const defaultData = Tenant.generateDefaultBusinessHours();
  const sanitizedData = {
    businessHours: currentData.businessHours || defaultData.businessHours,
  };
  
  // Validate and fix businessHours if it's malformed
  if (typeof sanitizedData.businessHours !== 'object' || Array.isArray(sanitizedData.businessHours)) {
    sanitizedData.businessHours = defaultData.businessHours;
  }
  
  // Only update if changes were made
  if (JSON.stringify(currentData) !== JSON.stringify(sanitizedData)) {
    this.setDataValue('business_hours', sanitizedData);
    this.changed('business_hours', true);
    await this.save();
    await this.reload();
  }
  
  return this;
};

/**
 * Sanitize and repair tenant settings (deprecated - use sanitizeBusinessHours)
 * @returns {Promise<Tenant>} - Tenant with sanitized settings
 * @deprecated Use sanitizeBusinessHours instead
 */
Tenant.prototype.sanitizeSettings = async function() {
  return this.sanitizeBusinessHours();
};

module.exports = {
  Tenant,
  TENANT_STATUS,
  PLAN_TYPES,
  VALID_TRANSITIONS,
};
