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
 * @returns {Promise<Object>} - Created tenant
 */
const createTenant = async (tenantData) => {
  const { name, slug, contactEmail, contactPhone, planType } = tenantData;

  // Check if tenant with same slug exists
  const existingTenant = await Tenant.findOne({ where: { slug } });
  if (existingTenant) {
    throw new AppError('A tenant with this slug already exists', 400, 'TENANT_EXISTS');
  }

  // Generate unique tenant ID from slug
  const tenantId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  // Check if tenant with same tenantId exists
  const existingTenantId = await Tenant.findOne({ where: { tenantId } });
  if (existingTenantId) {
    throw new AppError('A tenant with this identifier already exists', 400, 'TENANT_ID_EXISTS');
  }

  // Create tenant with default settings
  const tenant = await Tenant.create({
    tenantId,
    name,
    slug,
    contactEmail,
    contactPhone,
    planType: planType || PLAN_TYPES.FREE,
    settings: Tenant.generateDefaultSettings(),
    status: TENANT_STATUS.PENDING,
  });

  logger.info(`New tenant created: ${name} (${tenantId})`);

  return tenant.toSafeObject();
};

/**
 * Get tenant by tenant ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Tenant data
 */
const getTenantById = async (tenantId) => {
  const tenant = await Tenant.findOne({ where: { tenantId } });
  
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
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Tenant settings
 */
const getTenantSettings = async (tenantId) => {
  const tenant = await Tenant.findOne({ where: { tenantId } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return {
    tenantId: tenant.tenantId,
    name: tenant.name,
    settings: tenant.settings,
    planType: tenant.planType,
    status: tenant.status,
  };
};

/**
 * Update tenant settings
 * @param {string} tenantId - Tenant identifier
 * @param {Object} settings - New settings to merge
 * @returns {Promise<Object>} - Updated tenant settings
 */
const updateTenantSettings = async (tenantId, settings) => {
  const tenant = await Tenant.findOne({ where: { tenantId } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  // Validate settings structure if needed
  if (settings && typeof settings !== 'object') {
    throw new AppError('Settings must be an object', 400, 'INVALID_SETTINGS');
  }

  await tenant.updateSettings(settings);

  logger.info(`Tenant settings updated: ${tenantId}`);

  return {
    tenantId: tenant.tenantId,
    name: tenant.name,
    settings: tenant.settings,
    planType: tenant.planType,
    status: tenant.status,
  };
};

/**
 * Update tenant status
 * @param {string} tenantId - Tenant identifier
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} - Updated tenant
 */
const updateTenantStatus = async (tenantId, newStatus) => {
  const tenant = await Tenant.findOne({ where: { tenantId } });
  
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

  logger.info(`Tenant status changed: ${tenantId} from ${previousStatus} to ${newStatus}`);

  return tenant.toSafeObject();
};

/**
 * Activate tenant (complete onboarding)
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Updated tenant
 */
const activateTenant = async (tenantId) => {
  const tenant = await Tenant.findOne({ where: { tenantId } });
  
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

  logger.info(`Tenant activated: ${tenantId}`);

  return tenant.toSafeObject();
};

/**
 * Get current user and tenant context
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - User and tenant data
 */
const getCurrentUserAndTenant = async (userId, tenantId) => {
  // Get user data
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Get tenant data
  const tenant = await Tenant.findOne({ where: { tenantId } });
  
  // Tenant may not exist for default tenant
  const tenantData = tenant ? tenant.toSafeObject() : { tenantId };

  return {
    user: user.toSafeObject(),
    tenant: tenantData,
  };
};

/**
 * Check if tenant exists
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<boolean>} - True if tenant exists
 */
const tenantExists = async (tenantId) => {
  const tenant = await Tenant.findOne({ where: { tenantId } });
  return !!tenant;
};

/**
 * Update tenant information
 * @param {string} tenantId - Tenant identifier
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated tenant
 */
const updateTenant = async (tenantId, updateData) => {
  const tenant = await Tenant.findOne({ where: { tenantId } });
  
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

  logger.info(`Tenant updated: ${tenantId}`);

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
