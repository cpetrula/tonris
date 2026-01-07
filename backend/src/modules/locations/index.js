/**
 * Locations Module
 * Exports location model, service, and routes
 */
const { Location, LOCATION_STATUS } = require('./location.model');
const locationService = require('./location.service');
const locationRoutes = require('./location.routes');

module.exports = {
  Location,
  LOCATION_STATUS,
  locationService,
  locationRoutes,
};
