/**
 * Employee Service
 * Handles all employee business logic
 */
const { Employee, EMPLOYEE_STATUS, EMPLOYEE_TYPES } = require('./employee.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new employee
 * @param {Object} employeeData - Employee creation data
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Created employee
 */
const createEmployee = async (employeeData, tenantId) => {
  const { firstName, lastName, email, phone, employeeType, hireDate, schedule, serviceIds } = employeeData;

  // Check if employee with same email exists for this tenant
  const existingEmployee = await Employee.findOne({ where: { email, tenantId } });
  if (existingEmployee) {
    throw new AppError('An employee with this email already exists', 400, 'EMPLOYEE_EXISTS');
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
  });

  return {
    employees: employees.rows.map(emp => emp.toSafeObject()),
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

  return employee.toSafeObject();
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
  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'employeeType', 'status', 'hireDate', 'serviceIds', 'metadata'];
  const filteredData = {};
  
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
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

  return employee.toSafeObject();
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

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeSchedule,
  updateEmployeeSchedule,
  linkServicesToEmployee,
  EMPLOYEE_STATUS,
  EMPLOYEE_TYPES,
};
