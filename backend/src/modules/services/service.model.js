/**
 * Service Model
 * Defines the Service schema for salon services management
 */
const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const { sequelize } = require('../../config/db');

/**
 * Valid service statuses
 */
const SERVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

/**
 * Valid service categories
 */
const SERVICE_CATEGORIES = {
  HAIR: 'hair',
  NAILS: 'nails',
  SKIN: 'skin',
  MAKEUP: 'makeup',
  MASSAGE: 'massage',
  OTHER: 'other',
};

const Service = sequelize.define('Service', {
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
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM(...Object.values(SERVICE_CATEGORIES)),
    defaultValue: SERVICE_CATEGORIES.OTHER,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    comment: 'Duration in minutes',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(SERVICE_STATUS)),
    defaultValue: SERVICE_STATUS.ACTIVE,
    allowNull: false,
  },
  addOns: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    field: 'add_ons',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'services',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['tenant_id', 'name'],
      unique: true,
    },
  ],
});

/**
 * Get service data safe for API response
 * @returns {Object} - Service data
 */
Service.prototype.toSafeObject = function() {
  return this.toJSON();
};

/**
 * Add an add-on to the service
 * @param {Object} addOn - Add-on object { name, price, duration }
 * @returns {Promise<Service>} - Updated service
 */
Service.prototype.addAddOn = async function(addOn) {
  const addOns = [...this.addOns];
  const newAddOn = { ...addOn, id: crypto.randomUUID() };
  addOns.push(newAddOn);
  this.addOns = addOns;
  await this.save();
  return this;
};

/**
 * Remove an add-on from the service
 * @param {string} addOnId - Add-on ID to remove
 * @returns {Promise<Service>} - Updated service
 */
Service.prototype.removeAddOn = async function(addOnId) {
  this.addOns = this.addOns.filter(addOn => addOn.id !== addOnId);
  await this.save();
  return this;
};

/**
 * Generate default services for a new tenant based on business type
 * @param {string} businessTypeName - Name of the business type (optional, defaults to Salon/Spa)
 * @returns {Array<Object>} - Array of default service objects
 */
Service.generateDefaultServices = function(businessTypeName = null) {
  const { getServicesByBusinessType, SALON_SPA_SERVICES } = require('./service.seeds');
  
  // If no business type provided, return Salon/Spa services for backward compatibility
  if (!businessTypeName) {
    return SALON_SPA_SERVICES;
  }
  
  // Get services for the specified business type
  return getServicesByBusinessType(businessTypeName);
};

module.exports = {
  Service,
  SERVICE_STATUS,
  SERVICE_CATEGORIES,
};
