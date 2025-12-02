/**
 * BusinessType Model
 * Defines the BusinessType schema for business type configurations
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const BusinessType = sequelize.define('BusinessType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  businessType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'business_type',
    validate: {
      len: [1, 50],
    },
  },
  agentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'agent_id',
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'business_types',
  timestamps: true,
});

/**
 * Get business type data safe for API response
 * @returns {Object} - BusinessType data
 */
BusinessType.prototype.toSafeObject = function() {
  return this.toJSON();
};

module.exports = {
  BusinessType,
};
