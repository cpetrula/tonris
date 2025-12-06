/**
 * Tenant Service
 * Handles all tenant business logic
 */
const { Tenant, TENANT_STATUS, PLAN_TYPES } = require('./tenant.model');
const { User } = require('../../models');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new tenant
 * @param {Object} tenantData - Tenant creation data
 * @param {string} tenantData.name - Business name
 * @param {string} tenantData.slug - URL-friendly slug
 * @param {string} tenantData.contactEmail - Contact email
 * @param {string} tenantData.contactPhone - Contact phone (optional)
 * @param {string} tenantData.planType - Plan type (optional)
 * @param {string} tenantData.businessTypeId - Business type ID (optional)
 * @returns {Promise<Object>} - Created tenant
 */
const createTenant = async (tenantData) => {
  const { name, slug, contactEmail, contactPhone, planType, businessTypeId } = tenantData;

  // Check if tenant with same slug exists
  const existingTenant = await Tenant.findOne({ where: { slug } });
  if (existingTenant) {
    throw new AppError('A tenant with this slug already exists', 400, 'TENANT_EXISTS');
  }

  // Create tenant with default settings
  const tenant = await Tenant.create({
    name,
    slug,
    contactEmail,
    contactPhone,
    planType: planType || PLAN_TYPES.FREE,
    settings: Tenant.generateDefaultSettings(),
    status: TENANT_STATUS.PENDING,
    businessTypeId: businessTypeId || null,
  });

  logger.info(`New tenant created: ${name} (${slug})`);

  return tenant.toSafeObject();
};

/**
 * Get tenant by ID (UUID)
 * @param {string} id - Tenant UUID
 * @returns {Promise<Object>} - Tenant data
 */
const getTenantById = async (id) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return tenant.toSafeObject();
};

/** 
 * Get tenant by twilio_phone_number
 * @param {string} phoneNumber - Twilio phone number
 * @returns {Promise<Object>} - Tenant data
 **/
const getTenantByPhoneNumber = async (phoneNumber) => {
  const tenant = await Tenant.findOne({ where: { twilioPhoneNumber: phoneNumber } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return tenant.toSafeObject();
}

/**
 * Get tenant settings
 * @param {string} id - Tenant UUID
 * @returns {Promise<Object>} - Tenant settings
 */
const getTenantSettings = async (id) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return {
    id: tenant.id,
    name: tenant.name,
    settings: tenant.settings,
    planType: tenant.planType,
    status: tenant.status,
  };
};

/**
 * Update tenant settings
 * @param {string} id - Tenant UUID
 * @param {Object} settings - New settings to merge
 * @returns {Promise<Object>} - Updated tenant settings
 */
const updateTenantSettings = async (id, settings) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  // Validate settings structure if needed
  if (settings && typeof settings !== 'object') {
    throw new AppError('Settings must be an object', 400, 'INVALID_SETTINGS');
  }

  await tenant.updateSettings(settings);

  logger.info(`Tenant settings updated: ${id}`);

  return {
    id: tenant.id,
    name: tenant.name,
    settings: tenant.settings,
    planType: tenant.planType,
    status: tenant.status,
  };
};

/**
 * Update tenant status
 * @param {string} id - Tenant UUID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} - Updated tenant
 */
const updateTenantStatus = async (id, newStatus) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  // Validate status
  if (!Object.values(TENANT_STATUS).includes(newStatus)) {
    throw new AppError(`Invalid status: ${newStatus}`, 400, 'INVALID_STATUS');
  }

  // Check if transition is valid
  if (!Tenant.isValidTransition(tenant.status, newStatus)) {
    throw new AppError(
      `Invalid status transition from ${tenant.status} to ${newStatus}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  const previousStatus = tenant.status;
  await tenant.transitionTo(newStatus);

  logger.info(`Tenant status changed: ${id} from ${previousStatus} to ${newStatus}`);

  return tenant.toSafeObject();
};

/**
 * Activate tenant (complete onboarding)
 * @param {string} id - Tenant UUID
 * @returns {Promise<Object>} - Updated tenant
 */
const activateTenant = async (id) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  if (tenant.status !== TENANT_STATUS.PENDING) {
    throw new AppError(
      `Cannot activate tenant with status ${tenant.status}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  await tenant.transitionTo(TENANT_STATUS.ACTIVE);
  tenant.onboardingCompletedAt = new Date();
  await tenant.save();

  logger.info(`Tenant activated: ${id}`);

  return tenant.toSafeObject();
};

/**
 * Get current user and tenant context
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant UUID
 * @returns {Promise<Object>} - User and tenant data
 */
const getCurrentUserAndTenant = async (userId, tenantId) => {
  // Get user data
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Get tenant data
  const tenant = await Tenant.findOne({ where: { id: tenantId } });
  
  // Tenant should exist
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return {
    user: user.toSafeObject(),
    tenant: tenant.toSafeObject(),
  };
};

/**
 * Check if tenant exists
 * @param {string} id - Tenant UUID
 * @returns {Promise<boolean>} - True if tenant exists
 */
const tenantExists = async (id) => {
  const tenant = await Tenant.findOne({ where: { id } });
  return !!tenant;
};

/**
 * Update tenant information
 * @param {string} id - Tenant UUID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated tenant
 */
const updateTenant = async (id, updateData) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  // Filter out fields that shouldn't be directly updated
  const allowedFields = ['name', 'contactEmail', 'contactPhone', 'address', 'metadata', 'twilioPhoneNumber'];
  const filteredData = {};
  
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
    }
  }

  await tenant.update(filteredData);

  logger.info(`Tenant updated: ${id}`);

  return tenant.toSafeObject();
};

module.exports = {
  createTenant,
  getTenantById,
  getTenantByPhoneNumber,
  getTenantSettings,
  updateTenantSettings,
  updateTenantStatus,
  activateTenant,
  getCurrentUserAndTenant,
  tenantExists,
  updateTenant,
  TENANT_STATUS,
  PLAN_TYPES,
};
