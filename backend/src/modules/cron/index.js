/**
 * Cron Module
 * Handles scheduled jobs and cron endpoints
 */
const cronRoutes = require('./cron.routes');
const cronService = require('./cron.service');

module.exports = {
  cronRoutes,
  cronService,
};
