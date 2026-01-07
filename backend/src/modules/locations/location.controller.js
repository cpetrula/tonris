/**
 * Location Controller
 * HTTP request handlers for location endpoints
 */
const locationService = require('./location.service');
const { successResponse, errorResponse } = require('../../utils/responseHelpers');

/**
 * Create a new location
 * POST /api/locations
 */
const createLocation = async (req, res, next) => {
  try {
    const location = await locationService.createLocation(req.body, req.tenantId);
    return successResponse(res, { location }, 'Location created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all locations
 * GET /api/locations
 */
const getLocations = async (req, res, next) => {
  try {
    const { status, includeInactive } = req.query;
    const locations = await locationService.getLocations(req.tenantId, {
      status,
      includeInactive: includeInactive === 'true',
    });
    return successResponse(res, { locations });
  } catch (error) {
    next(error);
  }
};

/**
 * Get location by ID
 * GET /api/locations/:id
 */
const getLocationById = async (req, res, next) => {
  try {
    const location = await locationService.getLocationById(req.params.id, req.tenantId);
    return successResponse(res, { location });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a location
 * PATCH /api/locations/:id
 */
const updateLocation = async (req, res, next) => {
  try {
    const location = await locationService.updateLocation(req.params.id, req.tenantId, req.body);
    return successResponse(res, { location }, 'Location updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a location
 * DELETE /api/locations/:id
 */
const deleteLocation = async (req, res, next) => {
  try {
    await locationService.deleteLocation(req.params.id, req.tenantId);
    return successResponse(res, null, 'Location deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Set a location as default
 * PATCH /api/locations/:id/default
 */
const setDefaultLocation = async (req, res, next) => {
  try {
    const location = await locationService.setDefaultLocation(req.params.id, req.tenantId);
    return successResponse(res, { location }, 'Location set as default');
  } catch (error) {
    next(error);
  }
};

/**
 * Get the default location
 * GET /api/locations/default
 */
const getDefaultLocation = async (req, res, next) => {
  try {
    const location = await locationService.getDefaultLocation(req.tenantId);
    return successResponse(res, { location });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  setDefaultLocation,
  getDefaultLocation,
};
