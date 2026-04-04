/**
 * Waiting List Model
 * Unified model for both same-day slot backfill (salons) and enrollment waitlists (schools)
 */
const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Waiting list entry status
 */
const WAITING_STATUS = {
  WAITING: 'waiting',
  NOTIFIED: 'notified',
  BOOKED: 'booked',
  ENROLLED: 'enrolled',
  NO_RESPONSE: 'no_response',
  EXPIRED: 'expired',
};

/**
 * Waiting list type
 */
const WAITING_TYPE = {
  SLOT_BACKFILL: 'slot_backfill',   // Salon: same-day cancelled slot fill
  ENROLLMENT: 'enrollment',         // School: long-term waitlist for program openings
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
  type: {
    type: DataTypes.ENUM(...Object.values(WAITING_TYPE)),
    allowNull: false,
    defaultValue: WAITING_TYPE.SLOT_BACKFILL,
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
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'customer_email',
  },
  // --- Salon (slot_backfill) fields ---
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
  },
  serviceDurationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'service_duration_minutes',
    defaultValue: 30,
  },
  // --- School (enrollment) fields ---
  childName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'child_name',
  },
  childDob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'child_dob',
  },
  programName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'program_name',
    comment: 'Desired program (e.g. Infant, Toddler, Preschool)',
  },
  preferredSchedule: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'preferred_schedule',
    comment: 'e.g. full-time, M/W/F, T/Th',
  },
  preferredLocation: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'preferred_location',
  },
  preferredStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'preferred_start_date',
  },
  // --- Shared status fields ---
  status: {
    type: DataTypes.ENUM(...Object.values(WAITING_STATUS)),
    allowNull: false,
    defaultValue: WAITING_STATUS.WAITING,
  },
  notifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'notified_at',
  },
  notifiedSlotTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'notified_slot_time',
  },
  responseDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'response_deadline',
  },
  bookedAppointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'booked_appointment_id',
    references: {
      model: 'appointments',
      key: 'id',
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Special needs, allergies, additional info from parent/customer',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'waiting_list',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['customer_phone'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['created_at'] },
    { fields: ['tenant_id', 'type', 'status', 'created_at'], name: 'idx_wl_tenant_type_status' },
  ],
});

/**
 * Check if customer is already on the waiting list
 * For slot_backfill: checks today only
 * For enrollment: checks any active entry for same program
 */
WaitingList.isOnWaitingList = async function(tenantId, customerPhone, type, programName = null) {
  const where = {
    tenantId,
    customerPhone,
    status: WAITING_STATUS.WAITING,
    type,
  };

  if (type === WAITING_TYPE.SLOT_BACKFILL) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: today };
  } else if (programName) {
    where.programName = programName;
  }

  return !!(await this.findOne({ where }));
};

/**
 * Get waiting list entries for a tenant
 * For slot_backfill: today only
 * For enrollment: all active entries
 */
WaitingList.getList = async function(tenantId, type) {
  const where = { tenantId, type };

  if (type === WAITING_TYPE.SLOT_BACKFILL) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: today };
  }

  return this.findAll({ where, order: [['createdAt', 'ASC']] });
};

/**
 * Get position in queue
 */
WaitingList.getPosition = async function(tenantId, customerPhone, type) {
  const where = {
    tenantId,
    type,
    status: WAITING_STATUS.WAITING,
  };

  if (type === WAITING_TYPE.SLOT_BACKFILL) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: today };
  }

  const entries = await this.findAll({
    where,
    order: [['createdAt', 'ASC']],
    attributes: ['id', 'customerPhone'],
  });

  const index = entries.findIndex(e => e.customerPhone === customerPhone);
  return index >= 0 ? index + 1 : null;
};

/**
 * Find entries matching a cancelled slot duration (slot_backfill only)
 */
WaitingList.findMatchingEntries = async function(tenantId, slotDurationMinutes) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.findAll({
    where: {
      tenantId,
      type: WAITING_TYPE.SLOT_BACKFILL,
      status: WAITING_STATUS.WAITING,
      serviceDurationMinutes: { [Op.lte]: slotDurationMinutes },
      createdAt: { [Op.gte]: today },
    },
    order: [['createdAt', 'ASC']],
  });
};

/**
 * Find entries waiting for a specific program (enrollment only)
 */
WaitingList.findByProgram = async function(tenantId, programName) {
  return this.findAll({
    where: {
      tenantId,
      type: WAITING_TYPE.ENROLLMENT,
      status: WAITING_STATUS.WAITING,
      programName,
    },
    order: [['createdAt', 'ASC']],
  });
};

/**
 * Find notified entry by phone for response handling
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
 * Clear old entries
 * slot_backfill: entries older than today
 * enrollment: entries older than 6 months
 */
WaitingList.clearOldEntries = async function(tenantId = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const where = {
    [Op.or]: [
      { type: WAITING_TYPE.SLOT_BACKFILL, createdAt: { [Op.lt]: today } },
      { type: WAITING_TYPE.ENROLLMENT, status: { [Op.in]: [WAITING_STATUS.NO_RESPONSE, WAITING_STATUS.EXPIRED] }, createdAt: { [Op.lt]: sixMonthsAgo } },
    ],
  };

  if (tenantId) where.tenantId = tenantId;

  return this.destroy({ where });
};

module.exports = {
  WaitingList,
  WAITING_STATUS,
  WAITING_TYPE,
};
