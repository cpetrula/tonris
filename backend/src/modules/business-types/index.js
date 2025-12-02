/**
 * Business Types Module
 * Central export for all business types related functionality
 */
const businessTypesRoutes = require('./businessType.routes');
const businessTypeController = require('./businessType.controller');
const businessTypeService = require('./businessType.service');
const { BusinessType } = require('./businessType.model');

module.exports = {
  businessTypesRoutes,
  businessTypeController,
  businessTypeService,
  BusinessType,
};
