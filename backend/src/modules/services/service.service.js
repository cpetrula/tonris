/**
 * Service Service
 * Handles all service business logic
 */
const { Service, SERVICE_STATUS, SERVICE_CATEGORIES } = require('./service.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new service
 * @param {Object} serviceData - Service creation data
 * @returns {Promise<Object>} - Created service
 */
const createService = async (serviceData) => {
  const { name, description, category, duration, price, addOns } = serviceData;

  // Check if service with same name exists
  const existingService = await Service.findOne({ where: { name } });
  if (existingService) {
    throw new AppError('A service with this name already exists', 400, 'SERVICE_EXISTS');
  }

  // Create service
  const service = await Service.create({
    name,
    description,
    category: category || SERVICE_CATEGORIES.OTHER,
    duration: duration || 60,
    price: price || 0.00,
    addOns: addOns || [],
    status: SERVICE_STATUS.ACTIVE,
  });

  logger.info(`New service created: ${name}`);

  return service.toSafeObject();
};

/**
 * Get all services
 * @param {Object} options - Query options (pagination, filters)
 * @returns {Promise<Object>} - List of services
 */
const getServices = async (options = {}) => {
  const { status, category, limit = 100, offset = 0 } = options;

  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (category) {
    where.category = category;
  }

  const services = await Service.findAndCountAll({
    where,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [['name', 'ASC']],
  });

  return {
    services: services.rows.map(svc => svc.toSafeObject()),
    total: services.count,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
};

/**
 * Get service by ID
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} - Service data
 */
const getServiceById = async (serviceId) => {
  const service = await Service.findOne({ where: { id: serviceId } });
  
  if (!service) {
    throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
  }

  return service.toSafeObject();
};

/**
 * Update service
 * @param {string} serviceId - Service ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated service
 */
const updateService = async (serviceId, updateData) => {
  const service = await Service.findOne({ where: { id: serviceId } });
  
  if (!service) {
    throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
  }

  // Filter allowed update fields
  const allowedFields = ['name', 'description', 'category', 'duration', 'price', 'status', 'addOns', 'metadata'];
  const filteredData = {};
  
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
    }
  }

  // Check for duplicate name if name is being updated
  if (filteredData.name && filteredData.name !== service.name) {
    const existingService = await Service.findOne({ 
      where: { name: filteredData.name } 
    });
    if (existingService) {
      throw new AppError('A service with this name already exists', 400, 'SERVICE_EXISTS');
    }
  }

  await service.update(filteredData);

  logger.info(`Service updated: ${serviceId}`);

  return service.toSafeObject();
};

/**
 * Delete service
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object>} - Success message
 */
const deleteService = async (serviceId) => {
  const service = await Service.findOne({ where: { id: serviceId } });
  
  if (!service) {
    throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
  }

  await service.destroy();

  logger.info(`Service deleted: ${serviceId}`);

  return { message: 'Service deleted successfully' };
};

/**
 * Seed default services
 * @returns {Promise<Array>} - Created services
 */
const seedDefaultServices = async () => {
  const defaultServices = Service.generateDefaultServices();
  const createdServices = [];

  for (const serviceData of defaultServices) {
    // Check if service already exists
    const existing = await Service.findOne({ where: { name: serviceData.name } });
    if (existing) {
      createdServices.push(existing.toSafeObject());
      continue;
    }

    const service = await Service.create({
      ...serviceData,
      status: SERVICE_STATUS.ACTIVE,
    });
    createdServices.push(service.toSafeObject());
  }

  logger.info('Default services seeded');

  return createdServices;
};

/**
 * Add add-on to a service
 * @param {string} serviceId - Service ID
 * @param {Object} addOn - Add-on data { name, price, duration }
 * @returns {Promise<Object>} - Updated service
 */
const addAddOn = async (serviceId, addOn) => {
  const service = await Service.findOne({ where: { id: serviceId } });
  
  if (!service) {
    throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
  }

  await service.addAddOn(addOn);

  logger.info(`Add-on added to service: ${serviceId}`);

  return service.toSafeObject();
};

/**
 * Remove add-on from a service
 * @param {string} serviceId - Service ID
 * @param {string} addOnId - Add-on ID to remove
 * @returns {Promise<Object>} - Updated service
 */
const removeAddOn = async (serviceId, addOnId) => {
  const service = await Service.findOne({ where: { id: serviceId } });
  
  if (!service) {
    throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
  }

  await service.removeAddOn(addOnId);

  logger.info(`Add-on removed from service: ${serviceId}`);

  return service.toSafeObject();
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  seedDefaultServices,
  addAddOn,
  removeAddOn,
  SERVICE_STATUS,
  SERVICE_CATEGORIES,
};
