/**
 * Routes Index
 * Central export for all application routes
 */
const healthRoutes = require('./health');
const { authRoutes } = require('../modules/auth');

module.exports = {
  healthRoutes,
  authRoutes,
};
