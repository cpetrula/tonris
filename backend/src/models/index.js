/**
 * Models Index
 * Central export for all database models
 */
const User = require('./User');
const { Tenant, TENANT_STATUS, PLAN_TYPES, VALID_TRANSITIONS } = require('../modules/tenants/tenant.model');
const { Employee, EMPLOYEE_STATUS, EMPLOYEE_TYPES } = require('../modules/employees/employee.model');
const { Service, SERVICE_STATUS, SERVICE_CATEGORIES } = require('../modules/services/service.model');
const { Appointment, APPOINTMENT_STATUS, CANCELLATION_REASONS } = require('../modules/appointments/appointment.model');
const { Subscription, SUBSCRIPTION_STATUS, BILLING_INTERVAL, PLAN_CONFIG } = require('../modules/billing/subscription.model');
const { CallLog, CALL_DIRECTION, CALL_STATUS } = require('../modules/telephony/callLog.model');
const { BusinessType } = require('../modules/business-types/businessType.model');

/**
 * Define model associations
 * Call setupAssociations if it exists on the model
 */
if (typeof Appointment.setupAssociations === 'function' && Employee && Service) {
  Appointment.setupAssociations({ Employee, Service });
}

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
  Appointment,
  APPOINTMENT_STATUS,
  CANCELLATION_REASONS,
  Subscription,
  SUBSCRIPTION_STATUS,
  BILLING_INTERVAL,
  PLAN_CONFIG,
  CallLog,
  CALL_DIRECTION,
  CALL_STATUS,
  BusinessType,
};
