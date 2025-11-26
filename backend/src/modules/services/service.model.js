/**
 * Service Model
 * Defines the Service schema for salon services management
 */
const { DataTypes } = require('sequelize');
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
    type: DataTypes.STRING(64),
    allowNull: false,
    field: 'tenant_id',
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
  addOn.id = require('uuid').v4();
  addOns.push(addOn);
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
 * Generate default salon services for a new tenant
 * @returns {Array<Object>} - Array of default service objects
 */
Service.generateDefaultServices = function() {
  return [
    {
      name: 'Haircut',
      description: 'Standard haircut service',
      category: SERVICE_CATEGORIES.HAIR,
      duration: 45,
      price: 35.00,
      addOns: [
        { id: require('uuid').v4(), name: 'Blow Dry', price: 15.00, duration: 15 },
        { id: require('uuid').v4(), name: 'Deep Conditioning', price: 20.00, duration: 20 },
      ],
    },
    {
      name: 'Hair Coloring',
      description: 'Full hair coloring service',
      category: SERVICE_CATEGORIES.HAIR,
      duration: 120,
      price: 85.00,
      addOns: [
        { id: require('uuid').v4(), name: 'Highlights', price: 40.00, duration: 30 },
        { id: require('uuid').v4(), name: 'Toner', price: 25.00, duration: 15 },
      ],
    },
    {
      name: 'Manicure',
      description: 'Classic manicure service',
      category: SERVICE_CATEGORIES.NAILS,
      duration: 30,
      price: 25.00,
      addOns: [
        { id: require('uuid').v4(), name: 'Gel Polish', price: 15.00, duration: 10 },
        { id: require('uuid').v4(), name: 'Nail Art', price: 10.00, duration: 15 },
      ],
    },
    {
      name: 'Pedicure',
      description: 'Classic pedicure service',
      category: SERVICE_CATEGORIES.NAILS,
      duration: 45,
      price: 35.00,
      addOns: [
        { id: require('uuid').v4(), name: 'Callus Removal', price: 10.00, duration: 10 },
        { id: require('uuid').v4(), name: 'Hot Stone Massage', price: 15.00, duration: 15 },
      ],
    },
    {
      name: 'Facial',
      description: 'Basic facial treatment',
      category: SERVICE_CATEGORIES.SKIN,
      duration: 60,
      price: 65.00,
      addOns: [
        { id: require('uuid').v4(), name: 'Microdermabrasion', price: 30.00, duration: 20 },
        { id: require('uuid').v4(), name: 'LED Light Therapy', price: 25.00, duration: 15 },
      ],
    },
    {
      name: 'Makeup Application',
      description: 'Professional makeup application',
      category: SERVICE_CATEGORIES.MAKEUP,
      duration: 45,
      price: 55.00,
      addOns: [
        { id: require('uuid').v4(), name: 'Lash Extensions', price: 35.00, duration: 30 },
        { id: require('uuid').v4(), name: 'Bridal Upgrade', price: 50.00, duration: 30 },
      ],
    },
    {
      name: 'Swedish Massage',
      description: 'Relaxing full body massage',
      category: SERVICE_CATEGORIES.MASSAGE,
      duration: 60,
      price: 75.00,
      addOns: [
        { id: require('uuid').v4(), name: 'Hot Stones', price: 20.00, duration: 15 },
        { id: require('uuid').v4(), name: 'Aromatherapy', price: 10.00, duration: 0 },
      ],
    },
  ];
};

module.exports = {
  Service,
  SERVICE_STATUS,
  SERVICE_CATEGORIES,
};
