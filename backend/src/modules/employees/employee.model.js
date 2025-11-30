/**
 * Employee Model
 * Defines the Employee schema for salon staff management
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

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
  ],
});

/**
 * Generate default schedule for an employee
 * @returns {Object} - Default schedule structure
 */
Employee.generateDefaultSchedule = function() {
  return {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '14:00', enabled: false },
    sunday: { start: '10:00', end: '14:00', enabled: false },
  };
};

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

module.exports = {
  Employee,
  EMPLOYEE_STATUS,
  EMPLOYEE_TYPES,
};
