/**
 * Employee Service
 * Handles all employee business logic
 */
const { Employee, EMPLOYEE_STATUS, EMPLOYEE_TYPES, EMPLOYEE_ROLES } = require('./employee.model');
const { User } = require('../../models');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const { Op } = require('sequelize');

/**
 * Create a new employee
 * @param {Object} employeeData - Employee creation data
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Created employee
 */
const createEmployee = async (employeeData, tenantId) => {
  const { firstName, lastName, email, phone, employeeType, hireDate, schedule, serviceIds, role, locationId, notificationPreferences } = employeeData;

  // Check if employee with same email exists for this tenant
  const existingEmployee = await Employee.findOne({ where: { email, tenantId } });
  if (existingEmployee) {
    throw new AppError('An employee with this email already exists', 400, 'EMPLOYEE_EXISTS');
  }

  // Validate schedule if provided
  if (schedule) {
    const validation = Employee.validateSchedule(schedule);
    if (!validation.valid) {
      throw new AppError(validation.error, 400, 'INVALID_SCHEDULE');
    }
  }

  // Create employee with default schedule if not provided
  const employee = await Employee.create({
    tenantId,
    firstName,
    lastName,
    email,
    phone,
    employeeType: employeeType || EMPLOYEE_TYPES.EMPLOYEE,
    hireDate,
    schedule: schedule || Employee.generateDefaultSchedule(),
    serviceIds: serviceIds || [],
    status: EMPLOYEE_STATUS.ACTIVE,
    role: role || EMPLOYEE_ROLES.STAFF,
    locationId: locationId || null,
    notificationPreferences: notificationPreferences || {
      receiveEmailNotifications: false,
      receiveSmsNotifications: false,
      notificationTypes: ['new_appointment', 'cancellation'],
    },
  });

  logger.info(`New employee created: ${firstName} ${lastName} for tenant: ${tenantId}`);

  return employee.toSafeObject();
};

/**
 * Get all employees for a tenant
 * @param {string} tenantId - Tenant identifier
 * @param {Object} options - Query options (pagination, filters)
 * @returns {Promise<Array>} - List of employees
 */
const getEmployees = async (tenantId, options = {}) => {
  console.log('Getting employees with options:', options);
  const { status, employeeType, limit = 100, offset = 0 } = options;

  const where = { tenantId };
  
  if (status) {
    where.status = status;
  }
  
  if (employeeType) {
    where.employeeType = employeeType;
  }

  const employees = await Employee.findAndCountAll({
    where,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [['firstName', 'ASC'], ['lastName', 'ASC']],
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'loginEnabled', 'mustResetPassword', 'tempPasswordCreatedAt'],
      required: false
    }]
  });

  return {
    employees: employees.rows.map(emp => {
      const obj = emp.toSafeObject();
      // Parse schedule if it's a string (MySQL JSON column issue)
      if (typeof obj.schedule === 'string') {
        try {
          obj.schedule = JSON.parse(obj.schedule);
        } catch (e) {
          console.error('Failed to parse schedule:', e);
        }
      }
      // Add login-related fields from associated user
      if (emp.user) {
        obj.loginEnabled = Boolean(emp.user.loginEnabled);
        obj.mustResetPassword = Boolean(emp.user.mustResetPassword);
        obj.tempPasswordCreatedAt = emp.user.tempPasswordCreatedAt || null;
      } else {
        obj.loginEnabled = false;
        obj.mustResetPassword = false;
        obj.tempPasswordCreatedAt = null;
      }
      return obj;
    }),
    total: employees.count,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
};

/**
 * Get employee by ID
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Employee data
 */
const getEmployeeById = async (employeeId, tenantId) => {
  const employee = await Employee.findOne({ where: { id: employeeId, tenantId } });

  if (!employee) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }

  const obj = employee.toSafeObject();
  // Parse schedule if it's a string (MySQL JSON column issue)
  if (typeof obj.schedule === 'string') {
    try {
      obj.schedule = JSON.parse(obj.schedule);
    } catch (e) {
      console.error('Failed to parse schedule:', e);
    }
  }
  return obj;
};

/**
 * Update employee
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant identifier
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated employee
 */
const updateEmployee = async (employeeId, tenantId, updateData) => {
  const employee = await Employee.findOne({ where: { id: employeeId, tenantId } });
  
  if (!employee) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }

  // Filter allowed update fields
  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'employeeType', 'status', 'hireDate', 'serviceIds', 'metadata', 'schedule', 'role', 'locationId', 'notificationPreferences', 'userId'];
  const filteredData = {};

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
    }
  }

  // Validate schedule if being updated
  if (filteredData.schedule) {
    const validation = Employee.validateSchedule(filteredData.schedule);
    if (!validation.valid) {
      throw new AppError(validation.error, 400, 'INVALID_SCHEDULE');
    }
  }

  // Check for duplicate email if email is being updated
  if (filteredData.email && filteredData.email !== employee.email) {
    const existingEmployee = await Employee.findOne({ 
      where: { email: filteredData.email, tenantId } 
    });
    if (existingEmployee) {
      throw new AppError('An employee with this email already exists', 400, 'EMPLOYEE_EXISTS');
    }
  }

  await employee.update(filteredData);

  logger.info(`Employee updated: ${employeeId} for tenant: ${tenantId}`);

  const obj = employee.toSafeObject();
  // Parse schedule if it's a string (MySQL JSON column issue)
  if (typeof obj.schedule === 'string') {
    try {
      obj.schedule = JSON.parse(obj.schedule);
    } catch (e) {
      console.error('Failed to parse schedule:', e);
    }
  }
  return obj;
};

/**
 * Delete employee
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Success message
 */
const deleteEmployee = async (employeeId, tenantId) => {
  const employee = await Employee.findOne({ where: { id: employeeId, tenantId } });
  
  if (!employee) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }

  await employee.destroy();

  logger.info(`Employee deleted: ${employeeId} for tenant: ${tenantId}`);

  return { message: 'Employee deleted successfully' };
};

/**
 * Get employee schedule
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Employee schedule
 */
const getEmployeeSchedule = async (employeeId, tenantId) => {
  const employee = await Employee.findOne({ where: { id: employeeId, tenantId } });
  
  if (!employee) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }

  return {
    employeeId: employee.id,
    employeeName: employee.getFullName(),
    schedule: employee.schedule,
  };
};

/**
 * Update employee schedule
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant identifier
 * @param {Object} schedule - New schedule data
 * @returns {Promise<Object>} - Updated schedule
 */
const updateEmployeeSchedule = async (employeeId, tenantId, schedule) => {
  const employee = await Employee.findOne({ where: { id: employeeId, tenantId } });

  if (!employee) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }

  // Validate the new schedule
  const mergedSchedule = { ...employee.schedule, ...schedule };
  const validation = Employee.validateSchedule(mergedSchedule);
  if (!validation.valid) {
    throw new AppError(validation.error, 400, 'INVALID_SCHEDULE');
  }

  await employee.updateSchedule(schedule);

  logger.info(`Employee schedule updated: ${employeeId} for tenant: ${tenantId}`);

  return {
    employeeId: employee.id,
    employeeName: employee.getFullName(),
    schedule: employee.schedule,
  };
};

/**
 * Link services to employee
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant identifier
 * @param {Array<string>} serviceIds - Service IDs to link
 * @returns {Promise<Object>} - Updated employee
 */
const linkServicesToEmployee = async (employeeId, tenantId, serviceIds) => {
  const employee = await Employee.findOne({ where: { id: employeeId, tenantId } });
  
  if (!employee) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }

  await employee.linkServices(serviceIds);

  logger.info(`Services linked to employee: ${employeeId} for tenant: ${tenantId}`);

  return employee.toSafeObject();
};

/**
 * Update employee notification preferences
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant identifier
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} - Updated employee
 */
const updateEmployeeNotificationPreferences = async (employeeId, tenantId, preferences) => {
  const employee = await Employee.findOne({ where: { id: employeeId, tenantId } });

  if (!employee) {
    throw new AppError('Employee not found', 404, 'EMPLOYEE_NOT_FOUND');
  }

  // Merge with existing preferences
  const updatedPreferences = {
    ...employee.notificationPreferences,
    ...preferences,
  };

  await employee.update({ notificationPreferences: updatedPreferences });

  logger.info(`Employee notification preferences updated: ${employeeId} for tenant: ${tenantId}`);

  return employee.toSafeObject();
};

/**
 * Get employees with notifications enabled for a specific event type
 * @param {string} tenantId - Tenant ID
 * @param {string} locationId - Location ID (optional, null = all locations)
 * @param {string} notificationType - Type of notification ('new_appointment', 'cancellation')
 * @returns {Promise<Object>} - { emails: string[], phones: string[] }
 */
const getNotificationRecipients = async (tenantId, locationId, notificationType) => {
  const where = {
    tenantId,
    status: EMPLOYEE_STATUS.ACTIVE,
  };

  // If locationId is provided, filter by location
  // If null, include employees without location (backward compatibility)
  if (locationId) {
    where[Op.or] = [
      { locationId },
      { locationId: null }, // Include employees not assigned to a specific location
    ];
  }

  const employees = await Employee.findAll({ where });

  const emails = [];
  const phones = [];

  for (const employee of employees) {
    const prefs = employee.notificationPreferences || {};
    const types = prefs.notificationTypes || ['new_appointment', 'cancellation'];

    // Check if this notification type is enabled
    if (!types.includes(notificationType)) {
      continue;
    }

    // Collect emails
    if (prefs.receiveEmailNotifications && employee.email) {
      emails.push(employee.email);
    }

    // Collect phones
    if (prefs.receiveSmsNotifications && employee.phone) {
      phones.push(employee.phone);
    }
  }

  return { emails, phones };
};

/**
 * Get employees by location
 * @param {string} tenantId - Tenant ID
 * @param {string} locationId - Location ID
 * @returns {Promise<Array>} - List of employees
 */
const getEmployeesByLocation = async (tenantId, locationId) => {
  const where = { tenantId };

  if (locationId) {
    where.locationId = locationId;
  }

  const employees = await Employee.findAll({
    where,
    order: [['firstName', 'ASC'], ['lastName', 'ASC']],
  });

  return employees.map(emp => emp.toSafeObject());
};

/**
 * Find employee by phone number for a tenant
 * Used for voice self-service authentication
 * @param {string} phoneNumber - Caller's phone number
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Employee|null>} - Employee if found, null otherwise
 */
const findEmployeeByPhone = async (phoneNumber, tenantId) => {
  if (!phoneNumber || !tenantId) {
    return null;
  }

  // Normalize phone number (remove formatting, keep only digits and +)
  const normalized = phoneNumber.replace(/[^0-9+]/g, '');

  const employees = await Employee.findAll({
    where: {
      tenantId,
      status: EMPLOYEE_STATUS.ACTIVE,
    },
  });

  // Check each employee's phone with flexible matching
  for (const employee of employees) {
    if (employee.phone) {
      const empNormalized = employee.phone.replace(/[^0-9+]/g, '');

      // Exact match
      if (empNormalized === normalized) {
        logger.info(`Employee found by exact phone match: ${employee.id}`);
        return employee;
      }

      // Match last 10 digits (handles +1 country code differences)
      if (empNormalized.slice(-10) === normalized.slice(-10) &&
          normalized.slice(-10).length === 10) {
        logger.info(`Employee found by last-10-digits phone match: ${employee.id}`);
        return employee;
      }
    }
  }

  logger.info(`No employee found for phone: ${phoneNumber} in tenant: ${tenantId}`);
  return null;
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeSchedule,
  updateEmployeeSchedule,
  linkServicesToEmployee,
  updateEmployeeNotificationPreferences,
  getNotificationRecipients,
  getEmployeesByLocation,
  findEmployeeByPhone,
  EMPLOYEE_STATUS,
  EMPLOYEE_TYPES,
  EMPLOYEE_ROLES,
};
