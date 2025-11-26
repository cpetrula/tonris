/**
 * Routes Index
 * Central export for all application routes
 */
const healthRoutes = require('./health');
const meRoutes = require('./me');
const { authRoutes } = require('../modules/auth');
const { tenantRoutes } = require('../modules/tenants');
const { employeeRoutes } = require('../modules/employees');
const { serviceRoutes } = require('../modules/services');
const { appointmentRoutes, availabilityRoutes } = require('../modules/appointments');
const { billingRoutes } = require('../modules/billing');

module.exports = {
  healthRoutes,
  meRoutes,
  authRoutes,
  tenantRoutes,
  employeeRoutes,
  serviceRoutes,
  appointmentRoutes,
  availabilityRoutes,
  billingRoutes,
};
