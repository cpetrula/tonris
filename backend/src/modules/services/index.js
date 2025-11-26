/**
 * Services Module Index
 * Central export for services module
 */
const serviceRoutes = require('./service.routes');
const serviceService = require('./service.service');
const serviceController = require('./service.controller');
const { Service, SERVICE_STATUS, SERVICE_CATEGORIES } = require('./service.model');

module.exports = {
  serviceRoutes,
  serviceService,
  serviceController,
  Service,
  SERVICE_STATUS,
  SERVICE_CATEGORIES,
};
