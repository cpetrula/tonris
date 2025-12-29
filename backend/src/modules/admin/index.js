/**
 * Admin Module Index
 * Exports admin module components
 */
const adminRoutes = require('./admin.routes');
const adminController = require('./admin.controller');
const adminService = require('./admin.service');
const { adminAuthMiddleware } = require('./admin.middleware');

module.exports = {
  adminRoutes,
  adminController,
  adminService,
  adminAuthMiddleware,
};
