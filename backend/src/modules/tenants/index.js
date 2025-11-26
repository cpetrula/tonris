/**
 * Tenants Module Index
 * Central export for tenant module
 */
const tenantRoutes = require('./tenant.routes');
const tenantService = require('./tenant.service');
const tenantController = require('./tenant.controller');
const { Tenant, TENANT_STATUS, PLAN_TYPES, VALID_TRANSITIONS } = require('./tenant.model');

module.exports = {
  tenantRoutes,
  tenantService,
  tenantController,
  Tenant,
  TENANT_STATUS,
  PLAN_TYPES,
  VALID_TRANSITIONS,
};
