/**
 * Location Model
 * Defines the Location schema for multi-location business support
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Valid location statuses
 */
const LOCATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const Location = sequelize.define('Location', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255],
    },
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
    // { street, city, state, zipCode }
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      is: /^[+]?[0-9][0-9\s()-]{5,}$/i,
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_default',
  },
  status: {
    type: DataTypes.ENUM(...Object.values(LOCATION_STATUS)),
    defaultValue: LOCATION_STATUS.ACTIVE,
    allowNull: false,
  },
  businessHours: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'business_hours',
    // Optional override of tenant business hours
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'locations',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['tenant_id', 'name'],
      unique: true,
    },
    {
      fields: ['tenant_id', 'is_default'],
    },
  ],
});

/**
 * Generate default business hours structure
 * @returns {Object} - Default business hours
 */
Location.generateDefaultBusinessHours = function() {
  return {
    monday: { open: '09:00', close: '17:00', enabled: true },
    tuesday: { open: '09:00', close: '17:00', enabled: true },
    wednesday: { open: '09:00', close: '17:00', enabled: true },
    thursday: { open: '09:00', close: '17:00', enabled: true },
    friday: { open: '09:00', close: '17:00', enabled: true },
    saturday: { open: '10:00', close: '14:00', enabled: false },
    sunday: { open: '10:00', close: '14:00', enabled: false },
  };
};

/**
 * Get location data safe for API response
 * @returns {Object} - Location data
 */
Location.prototype.toSafeObject = function() {
  return this.toJSON();
};

/**
 * Get formatted address string
 * @returns {string} - Formatted address
 */
Location.prototype.getFormattedAddress = function() {
  if (!this.address) return '';

  const { street, city, state, zipCode } = this.address;
  const parts = [street, city, state, zipCode].filter(Boolean);
  return parts.join(', ');
};

module.exports = {
  Location,
  LOCATION_STATUS,
};
