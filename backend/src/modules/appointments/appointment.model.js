/**
 * Appointment Model
 * Defines the Appointment schema for salon booking management
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Valid appointment statuses
 */
const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

/**
 * Valid cancellation reasons
 */
const CANCELLATION_REASONS = {
  CUSTOMER_REQUEST: 'customer_request',
  EMPLOYEE_UNAVAILABLE: 'employee_unavailable',
  RESCHEDULE: 'reschedule',
  NO_SHOW: 'no_show',
  OTHER: 'other',
};

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id',
    },
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200],
    },
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  customerPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  appointmentDate: {
    type: DataTypes.DATE,  // DATETIME(3) in database - stores full datetime but typically only date part is used
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  endTime: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(APPOINTMENT_STATUS)),
    defaultValue: APPOINTMENT_STATUS.SCHEDULED,
    allowNull: false,
  },
  addOns: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of add-on IDs selected for this appointment',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  totalDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total duration in minutes including add-ons',
  },
  cancellationReason: {
    type: DataTypes.ENUM(...Object.values(CANCELLATION_REASONS)),
    allowNull: true,
  },
  cancellationNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'appointments',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['tenant_id', 'employee_id'],
    },
    {
      fields: ['tenant_id', 'start_time', 'end_time'],
    },
    {
      fields: ['tenant_id', 'status'],
    },
    {
      fields: ['tenant_id', 'customer_email'],
    },
  ],
});

/**
 * Get appointment data safe for API response
 * @returns {Object} - Appointment data
 */
Appointment.prototype.toSafeObject = function() {
  return this.toJSON();
};

/**
 * Check if appointment can be cancelled
 * @returns {boolean} - True if appointment can be cancelled
 */
Appointment.prototype.canBeCancelled = function() {
  return [
    APPOINTMENT_STATUS.SCHEDULED,
    APPOINTMENT_STATUS.CONFIRMED,
  ].includes(this.status);
};

/**
 * Check if appointment can be modified
 * @returns {boolean} - True if appointment can be modified
 */
Appointment.prototype.canBeModified = function() {
  return [
    APPOINTMENT_STATUS.SCHEDULED,
    APPOINTMENT_STATUS.CONFIRMED,
  ].includes(this.status);
};

/**
 * Cancel the appointment
 * @param {string} reason - Cancellation reason
 * @param {string} notes - Additional cancellation notes
 * @returns {Promise<Appointment>} - Updated appointment
 */
Appointment.prototype.cancel = async function(reason, notes = null) {
  if (!this.canBeCancelled()) {
    throw new Error('Appointment cannot be cancelled in current status');
  }
  
  this.status = APPOINTMENT_STATUS.CANCELLED;
  this.cancellationReason = reason;
  this.cancellationNotes = notes;
  this.cancelledAt = new Date();
  await this.save();
  return this;
};

module.exports = {
  Appointment,
  APPOINTMENT_STATUS,
  CANCELLATION_REASONS,
};
