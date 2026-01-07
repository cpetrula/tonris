/**
 * Employee Model
 * Defines the Employee schema for salon staff management
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const { EMPLOYEE_ROLES } = require('../../middleware/authorization');

/**
 * Valid employee statuses
 */
const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
};

/**
 * Valid employee types
 */
const EMPLOYEE_TYPES = {
  EMPLOYEE: 'employee',
  CONTRACTOR: 'contractor',
};

const Employee = sequelize.define('Employee', {
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
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name',
    validate: {
      len: [1, 100],
    },
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name',
    validate: {
      len: [1, 100],
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  employeeType: {
    type: DataTypes.ENUM(...Object.values(EMPLOYEE_TYPES)),
    defaultValue: EMPLOYEE_TYPES.EMPLOYEE,
    allowNull: false,
    field: 'employee_type',
  },
  status: {
    type: DataTypes.ENUM(...Object.values(EMPLOYEE_STATUS)),
    defaultValue: EMPLOYEE_STATUS.ACTIVE,
    allowNull: false,
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'hire_date',
  },
  schedule: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  serviceIds: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    field: 'service_ids',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM(...Object.values(EMPLOYEE_ROLES)),
    defaultValue: EMPLOYEE_ROLES.STAFF,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'location_id',
    references: {
      model: 'locations',
      key: 'id',
    },
  },
  notificationPreferences: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'notification_preferences',
    defaultValue: {
      receiveEmailNotifications: false,
      receiveSmsNotifications: false,
      notificationTypes: ['new_appointment', 'cancellation'],
    },
  },
}, {
  tableName: 'employees',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['tenant_id', 'email'],
      unique: true,
    },
    {
      fields: ['location_id'],
    },
    {
      fields: ['user_id'],
      unique: true,
    },
  ],
});

/**
 * Generate default schedule for an employee
 * Uses blocks array format to support split shifts
 * @returns {Object} - Default schedule structure
 */
Employee.generateDefaultSchedule = function() {
  return {
    monday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
    tuesday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
    wednesday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
    thursday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
    friday: { enabled: true, blocks: [{ start: '09:00', end: '17:00' }] },
    saturday: { enabled: false, blocks: [] },
    sunday: { enabled: false, blocks: [] },
  };
};

/**
 * Validate schedule format
 * @param {Object} schedule - Schedule to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
Employee.validateSchedule = function(schedule) {
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

  for (const day of validDays) {
    if (!schedule[day]) {
      return { valid: false, error: `Missing schedule for ${day}` };
    }

    const daySchedule = schedule[day];

    if (typeof daySchedule.enabled !== 'boolean') {
      return { valid: false, error: `Invalid enabled flag for ${day}` };
    }

    if (!Array.isArray(daySchedule.blocks)) {
      return { valid: false, error: `Blocks must be an array for ${day}` };
    }

    for (let i = 0; i < daySchedule.blocks.length; i++) {
      const block = daySchedule.blocks[i];

      if (!block.start || !block.end) {
        return { valid: false, error: `Block ${i + 1} on ${day} must have start and end times` };
      }

      if (!timeRegex.test(block.start) || !timeRegex.test(block.end)) {
        return { valid: false, error: `Invalid time format in block ${i + 1} on ${day}. Use HH:MM format (e.g., 09:00)` };
      }

      if (block.start >= block.end) {
        return { valid: false, error: `Start time must be before end time in block ${i + 1} on ${day}` };
      }
    }
  }

  return { valid: true };
};

/**
 * Check if employee is available at a specific day and time
 * @param {string} day - Day of week (lowercase)
 * @param {string} time - Time in HH:MM format
 * @returns {boolean} - True if available
 */
Employee.prototype.isAvailableAt = function(day, time) {
  const daySchedule = this.schedule[day.toLowerCase()];

  if (!daySchedule || !daySchedule.enabled) {
    return false;
  }

  for (const block of daySchedule.blocks) {
    if (time >= block.start && time < block.end) {
      return true;
    }
  }

  return false;
};

/**
 * Get formatted schedule summary for display
 * @returns {Object} - Schedule summary with formatted strings per day
 */
Employee.prototype.getScheduleSummary = function() {
  const summary = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (const day of days) {
    const daySchedule = this.schedule[day];

    if (!daySchedule || !daySchedule.enabled || daySchedule.blocks.length === 0) {
      summary[day] = 'Off';
    } else {
      const blockStrings = daySchedule.blocks.map(block => {
        const startFormatted = formatTime12h(block.start);
        const endFormatted = formatTime12h(block.end);
        return `${startFormatted} - ${endFormatted}`;
      });
      summary[day] = blockStrings.join(', ');
    }
  }

  return summary;
};

/**
 * Helper to convert 24h time to 12h format
 */
function formatTime12h(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Get employee data safe for API response
 * @returns {Object} - Employee data
 */
Employee.prototype.toSafeObject = function() {
  return this.toJSON();
};

/**
 * Get employee full name
 * @returns {string} - Full name
 */
Employee.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Update employee schedule
 * @param {Object} newSchedule - New schedule data
 * @returns {Promise<Employee>} - Updated employee
 */
Employee.prototype.updateSchedule = async function(newSchedule) {
  this.schedule = {
    ...this.schedule,
    ...newSchedule,
  };
  await this.save();
  return this;
};

/**
 * Link services to employee
 * @param {Array<string>} serviceIds - Array of service IDs
 * @returns {Promise<Employee>} - Updated employee
 */
Employee.prototype.linkServices = async function(serviceIds) {
  this.serviceIds = serviceIds;
  await this.save();
  return this;
};

/**
 * Check if employee has notifications enabled for a specific type
 * @param {string} notificationType - Type of notification ('new_appointment', 'cancellation')
 * @param {string} channel - Channel ('email' or 'sms')
 * @returns {boolean} - True if notifications enabled
 */
Employee.prototype.hasNotificationsEnabled = function(notificationType, channel) {
  const prefs = this.notificationPreferences || {};

  // Check if channel is enabled
  if (channel === 'email' && !prefs.receiveEmailNotifications) {
    return false;
  }
  if (channel === 'sms' && !prefs.receiveSmsNotifications) {
    return false;
  }

  // Check if notification type is in the list (default to all types if not specified)
  const types = prefs.notificationTypes || ['new_appointment', 'cancellation'];
  return types.includes(notificationType);
};

/**
 * Check if employee has any notifications enabled
 * @returns {boolean} - True if any notifications enabled
 */
Employee.prototype.hasAnyNotificationsEnabled = function() {
  const prefs = this.notificationPreferences || {};
  return prefs.receiveEmailNotifications || prefs.receiveSmsNotifications;
};

/**
 * Check if employee is admin
 * @returns {boolean} - True if admin
 */
Employee.prototype.isAdmin = function() {
  return this.role === 'admin';
};

/**
 * Check if employee is manager or higher
 * @returns {boolean} - True if manager or admin
 */
Employee.prototype.isManagerOrHigher = function() {
  return ['admin', 'manager'].includes(this.role);
};

/**
 * Check if employee has a linked user account
 * @returns {boolean} - True if has user account
 */
Employee.prototype.hasUserAccount = function() {
  return !!this.userId;
};

module.exports = {
  Employee,
  EMPLOYEE_STATUS,
  EMPLOYEE_TYPES,
  EMPLOYEE_ROLES,
};
