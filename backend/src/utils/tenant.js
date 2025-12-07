/**
 * Tenant Utilities
 * Shared utilities for tenant-related operations
 */
const { Tenant } = require('../modules/tenants/tenant.model');
const { AppError } = require('../middleware/errorHandler');
const { UUID_REGEX } = require('./validation');

/**
 * Get tenant UUID from slug or UUID
 * @param {string} slugOrId - Tenant slug (e.g., 'hair-done-right-salon') or UUID
 * @returns {Promise<string>} - Tenant UUID
 * @throws {AppError} - If tenant not found
 */
const getTenantUUID = async (slugOrId) => {
  // If already a UUID, verify it exists and return it
  if (UUID_REGEX.test(slugOrId)) {
    const tenant = await Tenant.findOne({ where: { id: slugOrId } });
    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }
    return tenant.id;
  }
  
  // Otherwise, treat it as a slug and look it up
  const tenant = await Tenant.findOne({ where: { slug: slugOrId } });
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }
  return tenant.id;
};

module.exports = {
  getTenantUUID,
};
