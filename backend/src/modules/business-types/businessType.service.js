/**
 * BusinessType Service
 * Handles all business type business logic
 */
const { BusinessType } = require('./businessType.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Get all active business types
 * @returns {Promise<Array>} - List of active business types
 */
const getActiveBusinessTypes = async () => {
  const businessTypes = await BusinessType.findAll({
    where: { active: true },
    order: [['businessType', 'ASC']],
  });

  // Don't include agentId for public endpoint
  return businessTypes.map(bt => bt.toSafeObject(false));
};

/**
 * Get all business types
 * @returns {Promise<Array>} - List of all business types
 */
const getAllBusinessTypes = async () => {
  const businessTypes = await BusinessType.findAll({
    order: [['businessType', 'ASC']],
  });

  // Include agentId for admin endpoint
  return businessTypes.map(bt => bt.toSafeObject(true));
};

/**
 * Get business type by ID
 * @param {string} id - BusinessType ID
 * @returns {Promise<Object>} - BusinessType data
 */
const getBusinessTypeById = async (id) => {
  const businessType = await BusinessType.findByPk(id);
  
  if (!businessType) {
    throw new AppError('Business type not found', 404, 'BUSINESS_TYPE_NOT_FOUND');
  }

  // Include agentId for admin endpoint
  return businessType.toSafeObject(true);
};

/**
 * Create a new business type
 * @param {Object} data - BusinessType data
 * @param {string} data.businessType - Business type name
 * @param {string} data.agentId - Agent ID (UUID)
 * @param {boolean} data.active - Active status
 * @returns {Promise<Object>} - Created business type
 */
const createBusinessType = async (data) => {
  const { businessType, agentId, active = true } = data;

  // Check if business type with same name exists
  const existing = await BusinessType.findOne({ 
    where: { businessType } 
  });
  
  if (existing) {
    throw new AppError('A business type with this name already exists', 400, 'BUSINESS_TYPE_EXISTS');
  }

  const newBusinessType = await BusinessType.create({
    businessType,
    agentId,
    active,
  });

  logger.info(`New business type created: ${businessType}`);

  return newBusinessType.toSafeObject();
};

/**
 * Update a business type
 * @param {string} id - BusinessType ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated business type
 */
const updateBusinessType = async (id, data) => {
  const businessType = await BusinessType.findByPk(id);
  
  if (!businessType) {
    throw new AppError('Business type not found', 404, 'BUSINESS_TYPE_NOT_FOUND');
  }

  // Check for duplicate name if updating businessType field
  if (data.businessType && data.businessType !== businessType.businessType) {
    const existing = await BusinessType.findOne({ 
      where: { businessType: data.businessType } 
    });
    
    if (existing) {
      throw new AppError('A business type with this name already exists', 400, 'BUSINESS_TYPE_EXISTS');
    }
  }

  await businessType.update(data);

  logger.info(`Business type updated: ${id}`);

  return businessType.toSafeObject();
};

/**
 * Delete a business type
 * @param {string} id - BusinessType ID
 * @returns {Promise<void>}
 */
const deleteBusinessType = async (id) => {
  const businessType = await BusinessType.findByPk(id);
  
  if (!businessType) {
    throw new AppError('Business type not found', 404, 'BUSINESS_TYPE_NOT_FOUND');
  }

  await businessType.destroy();

  logger.info(`Business type deleted: ${id}`);
};

module.exports = {
  getActiveBusinessTypes,
  getAllBusinessTypes,
  getBusinessTypeById,
  createBusinessType,
  updateBusinessType,
  deleteBusinessType,
};
