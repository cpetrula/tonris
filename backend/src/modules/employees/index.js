/**
 * Employees Module Index
 * Central export for employee module
 */
const employeeRoutes = require('./employee.routes');
const employeeService = require('./employee.service');
const employeeController = require('./employee.controller');
const { Employee, EMPLOYEE_STATUS, EMPLOYEE_TYPES } = require('./employee.model');

module.exports = {
  employeeRoutes,
  employeeService,
  employeeController,
  Employee,
  EMPLOYEE_STATUS,
  EMPLOYEE_TYPES,
};
