/**
 * Routes Index
 * Central export for all application routes
 */
const healthRoutes = require('./health');
const meRoutes = require('./me');
const { authRoutes } = require('../modules/auth');
const { tenantRoutes } = require('../modules/tenants');

module.exports = {
  healthRoutes,
  meRoutes,
  authRoutes,
  tenantRoutes,
};
