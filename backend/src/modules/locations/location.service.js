/**
 * Location Service
 * Business logic for location management
 */
const { Location, LOCATION_STATUS } = require('./location.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new location
 * @param {Object} locationData - Location data
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} - Created location
 */
const createLocation = async (locationData, tenantId) => {
  const { name, address, phone, email, businessHours, metadata } = locationData;

  // Check if location name already exists for this tenant
  const existingLocation = await Location.findOne({
    where: { tenantId, name },
  });

  if (existingLocation) {
    throw new AppError('A location with this name already exists', 400, 'LOCATION_EXISTS');
  }

  // Check if this should be the default location (first location for tenant)
  const locationCount = await Location.count({ where: { tenantId } });
  const isDefault = locationCount === 0;

  const location = await Location.create({
    tenantId,
    name,
    address,
    phone,
    email,
    isDefault,
    businessHours,
    metadata,
  });

  logger.info(`Location created: ${name} for tenant ${tenantId}`);

  return location.toSafeObject();
};

/**
 * Get all locations for a tenant
 * @param {string} tenantId - Tenant ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - List of locations
 */
const getLocations = async (tenantId, options = {}) => {
  const { status, includeInactive = false } = options;

  const where = { tenantId };

  if (status) {
    where.status = status;
  } else if (!includeInactive) {
    where.status = LOCATION_STATUS.ACTIVE;
  }

  const locations = await Location.findAll({
    where,
    order: [
      ['isDefault', 'DESC'],
      ['name', 'ASC'],
    ],
  });

  return locations.map(loc => loc.toSafeObject());
};

/**
 * Get location by ID
 * @param {string} locationId - Location ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} - Location data
 */
const getLocationById = async (locationId, tenantId) => {
  const location = await Location.findOne({
    where: { id: locationId, tenantId },
  });

  if (!location) {
    throw new AppError('Location not found', 404, 'LOCATION_NOT_FOUND');
  }

  return location.toSafeObject();
};

/**
 * Update a location
 * @param {string} locationId - Location ID
 * @param {string} tenantId - Tenant ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated location
 */
const updateLocation = async (locationId, tenantId, updateData) => {
  const location = await Location.findOne({
    where: { id: locationId, tenantId },
  });

  if (!location) {
    throw new AppError('Location not found', 404, 'LOCATION_NOT_FOUND');
  }

  // Check if renaming to an existing name
  if (updateData.name && updateData.name !== location.name) {
    const existingLocation = await Location.findOne({
      where: { tenantId, name: updateData.name },
    });

    if (existingLocation) {
      throw new AppError('A location with this name already exists', 400, 'LOCATION_EXISTS');
    }
  }

  // Whitelist of allowed update fields
  const allowedFields = ['name', 'address', 'phone', 'email', 'status', 'businessHours', 'metadata'];
  const filteredData = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  await location.update(filteredData);

  logger.info(`Location updated: ${location.name} for tenant ${tenantId}`);

  return location.toSafeObject();
};

/**
 * Delete a location
 * @param {string} locationId - Location ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteLocation = async (locationId, tenantId) => {
  const location = await Location.findOne({
    where: { id: locationId, tenantId },
  });

  if (!location) {
    throw new AppError('Location not found', 404, 'LOCATION_NOT_FOUND');
  }

  // Prevent deleting the default location
  if (location.isDefault) {
    throw new AppError('Cannot delete the default location. Set another location as default first.', 400, 'CANNOT_DELETE_DEFAULT');
  }

  await location.destroy();

  logger.info(`Location deleted: ${location.name} for tenant ${tenantId}`);

  return true;
};

/**
 * Get the default location for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} - Default location or null
 */
const getDefaultLocation = async (tenantId) => {
  const location = await Location.findOne({
    where: { tenantId, isDefault: true },
  });

  return location ? location.toSafeObject() : null;
};

/**
 * Set a location as the default
 * @param {string} locationId - Location ID
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} - Updated location
 */
const setDefaultLocation = async (locationId, tenantId) => {
  const location = await Location.findOne({
    where: { id: locationId, tenantId },
  });

  if (!location) {
    throw new AppError('Location not found', 404, 'LOCATION_NOT_FOUND');
  }

  // Remove default from current default location
  await Location.update(
    { isDefault: false },
    { where: { tenantId, isDefault: true } }
  );

  // Set this location as default
  await location.update({ isDefault: true });

  logger.info(`Location set as default: ${location.name} for tenant ${tenantId}`);

  return location.toSafeObject();
};

/**
 * Create default location for a tenant from tenant data
 * @param {string} tenantId - Tenant ID
 * @param {Object} tenantData - Tenant data with address info
 * @returns {Promise<Object>} - Created location
 */
const createDefaultLocationFromTenant = async (tenantId, tenantData) => {
  const { name, address, contactPhone, contactEmail } = tenantData;

  // Check if default location already exists
  const existingDefault = await Location.findOne({
    where: { tenantId, isDefault: true },
  });

  if (existingDefault) {
    return existingDefault.toSafeObject();
  }

  const location = await Location.create({
    tenantId,
    name: name || 'Main Location',
    address: address || null,
    phone: contactPhone || null,
    email: contactEmail || null,
    isDefault: true,
  });

  logger.info(`Default location created for tenant ${tenantId}`);

  return location.toSafeObject();
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  getDefaultLocation,
  setDefaultLocation,
  createDefaultLocationFromTenant,
};
