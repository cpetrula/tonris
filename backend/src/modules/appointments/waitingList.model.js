/**
 * Waiting List Model
 * Manages queue for cancelled appointment slots
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Waiting list entry status
 */
const WAITING_STATUS = {
  WAITING: 'waiting',
  NOTIFIED: 'notified',
  BOOKED: 'booked',
  NO_RESPONSE: 'no_response',
  EXPIRED: 'expired',
};

const WaitingList = sequelize.define('WaitingList', {
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
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'customer_name',
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'customer_phone',
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'service_id',
    references: {
      model: 'services',
      key: 'id',
    },
  },
  serviceName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'service_name',
    comment: 'Service name if serviceId not available',
  },
  serviceDurationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'service_duration_minutes',
    defaultValue: 30,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(WAITING_STATUS)),
    allowNull: false,
    defaultValue: WAITING_STATUS.WAITING,
  },
  notifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'notified_at',
    comment: 'When customer was notified about an available slot',
  },
  notifiedSlotTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'notified_slot_time',
    comment: 'The slot time they were notified about',
  },
  responseDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'response_deadline',
    comment: 'Deadline to respond before moving to next person',
  },
  bookedAppointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'booked_appointment_id',
    references: {
      model: 'appointments',
      key: 'id',
    },
    comment: 'If booked, the resulting appointment ID',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'waiting_list',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['customer_phone'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['tenant_id', 'status', 'created_at'],
      name: 'waiting_list_tenant_status_created',
    },
  ],
});

/**
 * Check if customer is already on waiting list today
 * @param {string} tenantId - Tenant ID
 * @param {string} customerPhone - Customer phone
 * @returns {Promise<boolean>} - True if already on list
 */
WaitingList.isOnWaitingList = async function(tenantId, customerPhone) {
  const { Op } = require('sequelize');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await this.findOne({
    where: {
      tenantId,
      customerPhone,
      status: WAITING_STATUS.WAITING,
      createdAt: { [Op.gte]: today },
    },
  });

  return !!existing;
};

/**
 * Get waiting list for a tenant (today only)
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<WaitingList[]>} - Waiting entries
 */
WaitingList.getTodayList = async function(tenantId) {
  const { Op } = require('sequelize');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.findAll({
    where: {
      tenantId,
      createdAt: { [Op.gte]: today },
    },
    order: [['createdAt', 'ASC']],
  });
};

/**
 * Get position in queue
 * @param {string} tenantId - Tenant ID
 * @param {string} customerPhone - Customer phone
 * @returns {Promise<number|null>} - Position (1-based) or null
 */
WaitingList.getPosition = async function(tenantId, customerPhone) {
  const { Op } = require('sequelize');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const waitingEntries = await this.findAll({
    where: {
      tenantId,
      status: WAITING_STATUS.WAITING,
      createdAt: { [Op.gte]: today },
    },
    order: [['createdAt', 'ASC']],
    attributes: ['id', 'customerPhone'],
  });

  const index = waitingEntries.findIndex(e => e.customerPhone === customerPhone);
  return index >= 0 ? index + 1 : null;
};

/**
 * Find entries matching a cancelled slot duration
 * @param {string} tenantId - Tenant ID
 * @param {number} slotDurationMinutes - Available slot duration
 * @returns {Promise<WaitingList[]>} - Matching entries (first-come-first-served)
 */
WaitingList.findMatchingEntries = async function(tenantId, slotDurationMinutes) {
  const { Op } = require('sequelize');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.findAll({
    where: {
      tenantId,
      status: WAITING_STATUS.WAITING,
      serviceDurationMinutes: { [Op.lte]: slotDurationMinutes },
      createdAt: { [Op.gte]: today },
    },
    order: [['createdAt', 'ASC']],
  });
};

/**
 * Find notified entry by phone for response handling
 * @param {string} customerPhone - Customer phone
 * @returns {Promise<WaitingList|null>} - Most recent notified entry
 */
WaitingList.findNotifiedByPhone = async function(customerPhone) {
  return this.findOne({
    where: {
      customerPhone,
      status: WAITING_STATUS.NOTIFIED,
    },
    order: [['notifiedAt', 'DESC']],
  });
};

/**
 * Clear old entries (run daily)
 * @param {string} tenantId - Optional tenant ID filter
 * @returns {Promise<number>} - Number of entries deleted
 */
WaitingList.clearOldEntries = async function(tenantId = null) {
  const { Op } = require('sequelize');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where = {
    createdAt: { [Op.lt]: today },
  };

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const deleted = await this.destroy({ where });
  return deleted;
};

module.exports = {
  WaitingList,
  WAITING_STATUS,
};
