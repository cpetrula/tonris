/**
 * Location Controller
 * HTTP request handlers for location endpoints
 */
const locationService = require('./location.service');
const { getTenantUUID } = require('../../utils/tenant');

/**
 * Create a new location
 * POST /api/locations
 */
const createLocation = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const location = await locationService.createLocation(req.body, tenantUUID);
    res.status(201).json({
      success: true,
      data: { location },
      message: 'Location created successfully',
    });
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    const locations = await locationService.getLocations(tenantUUID, {
      status,
      includeInactive: includeInactive === 'true',
    });
    res.status(200).json({
      success: true,
      data: { locations },
    });
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    const location = await locationService.getLocationById(req.params.id, tenantUUID);
    res.status(200).json({
      success: true,
      data: { location },
    });
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    const location = await locationService.updateLocation(req.params.id, tenantUUID, req.body);
    res.status(200).json({
      success: true,
      data: { location },
      message: 'Location updated successfully',
    });
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    await locationService.deleteLocation(req.params.id, tenantUUID);
    res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
    });
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    const location = await locationService.setDefaultLocation(req.params.id, tenantUUID);
    res.status(200).json({
      success: true,
      data: { location },
      message: 'Location set as default',
    });
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    const location = await locationService.getDefaultLocation(tenantUUID);
    res.status(200).json({
      success: true,
      data: { location },
    });
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
