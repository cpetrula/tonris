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
const { appointmentRoutes, availabilityRoutes, waitingListRoutes } = require('../modules/appointments');
const { billingRoutes } = require('../modules/billing');
const { telephonyRoutes } = require('../modules/telephony');
const { aiRoutes } = require('../modules/ai-assistant');
const { businessTypesRoutes } = require('../modules/business-types');
const { adminRoutes } = require('../modules/admin');
const { voiceRoutes } = require('../modules/voices');
const { cronRoutes } = require('../modules/cron');
const { locationRoutes } = require('../modules/locations');
const userRoutes = require('../modules/users/user.routes');

module.exports = {
  healthRoutes,
  meRoutes,
  authRoutes,
  tenantRoutes,
  employeeRoutes,
  serviceRoutes,
  appointmentRoutes,
  availabilityRoutes,
  waitingListRoutes,
  billingRoutes,
  telephonyRoutes,
  aiRoutes,
  businessTypesRoutes,
  adminRoutes,
  voiceRoutes,
  cronRoutes,
  locationRoutes,
  userRoutes,
};
