/**
 * Usage Record Model
 * Tracks minute usage per billing period for usage-based billing
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const logger = require('../../utils/logger');

/**
 * Usage types
 */
const USAGE_TYPE = {
  CALL_MINUTES: 'call_minutes',
};

const UsageRecord = sequelize.define('UsageRecord', {
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
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'subscription_id',
    references: {
      model: 'subscriptions',
      key: 'id',
    },
  },
  callLogId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'call_log_id',
    comment: 'Reference to the call log that generated this usage',
  },
  usageType: {
    type: DataTypes.ENUM(...Object.values(USAGE_TYPE)),
    defaultValue: USAGE_TYPE.CALL_MINUTES,
    allowNull: false,
    field: 'usage_type',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Usage quantity (e.g., minutes for calls)',
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'period_start',
    comment: 'Start of the billing period this usage belongs to',
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'period_end',
    comment: 'End of the billing period this usage belongs to',
  },
  stripeUsageRecordId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_usage_record_id',
    comment: 'Stripe usage record ID if reported to Stripe',
  },
  reportedToStripeAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reported_to_stripe_at',
    comment: 'When this usage was reported to Stripe',
  },
  isOverage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_overage',
    comment: 'Whether this usage is overage (beyond included minutes)',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata (call details, etc.)',
  },
}, {
  tableName: 'usage_records',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['subscription_id'],
    },
    {
      fields: ['period_start', 'period_end'],
    },
    {
      fields: ['call_log_id'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

/**
 * Get usage summary for a tenant in a specific period
 * @param {string} tenantId - Tenant identifier
 * @param {Date} periodStart - Period start date
 * @param {Date} periodEnd - Period end date
 * @returns {Promise<Object>} - Usage summary
 */
UsageRecord.getUsageSummary = async function(tenantId, periodStart, periodEnd) {
  const { Op } = require('sequelize');
  
  const records = await UsageRecord.findAll({
    where: {
      tenantId,
      periodStart: {
        [Op.gte]: periodStart,
      },
      periodEnd: {
        [Op.lte]: periodEnd,
      },
    },
  });
  
  const totalMinutes = records.reduce((sum, record) => sum + record.quantity, 0);
  const overageMinutes = records
    .filter(r => r.isOverage)
    .reduce((sum, record) => sum + record.quantity, 0);
  
  return {
    totalMinutes,
    includedMinutesUsed: totalMinutes - overageMinutes,
    overageMinutes,
    recordCount: records.length,
    periodStart,
    periodEnd,
  };
};

/**
 * Get usage history for a tenant (last N periods)
 * @param {string} tenantId - Tenant identifier
 * @param {number} periods - Number of periods to fetch (default 6)
 * @returns {Promise<Array>} - Array of usage summaries by period
 */
UsageRecord.getUsageHistory = async function(tenantId, periods = 6) {
  const { Op } = require('sequelize');
  
  // Get distinct periods ordered by period_start descending
  const records = await UsageRecord.findAll({
    where: { tenantId },
    attributes: [
      'periodStart',
      'periodEnd',
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalMinutes'],
      [sequelize.fn('SUM', 
        sequelize.literal('CASE WHEN is_overage = true THEN quantity ELSE 0 END')
      ), 'overageMinutes'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'recordCount'],
    ],
    group: ['period_start', 'period_end'],
    order: [['period_start', 'DESC']],
    limit: periods,
    raw: true,
  });
  
  return records.map(r => ({
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    totalMinutes: parseInt(r.totalMinutes, 10) || 0,
    overageMinutes: parseInt(r.overageMinutes, 10) || 0,
    includedMinutesUsed: (parseInt(r.totalMinutes, 10) || 0) - (parseInt(r.overageMinutes, 10) || 0),
    recordCount: parseInt(r.recordCount, 10) || 0,
  }));
};

module.exports = {
  UsageRecord,
  USAGE_TYPE,
};
