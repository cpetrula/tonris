/**
 * Models Index
 * Central export for all database models
 */
const User = require('./User');
const { Tenant, TENANT_STATUS, PLAN_TYPES, VALID_TRANSITIONS } = require('../modules/tenants/tenant.model');
const { Employee, EMPLOYEE_STATUS, EMPLOYEE_TYPES } = require('../modules/employees/employee.model');
const { Service, SERVICE_STATUS, SERVICE_CATEGORIES } = require('../modules/services/service.model');

module.exports = {
  User,
  Tenant,
  TENANT_STATUS,
  PLAN_TYPES,
  VALID_TRANSITIONS,
  Employee,
  EMPLOYEE_STATUS,
  EMPLOYEE_TYPES,
  Service,
  SERVICE_STATUS,
  SERVICE_CATEGORIES,
};
