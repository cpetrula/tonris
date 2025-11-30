/**
 * Tenant Utilities
 * Shared utilities for tenant-related operations
 */
const { Tenant } = require('../modules/tenants/tenant.model');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get tenant UUID from string tenant ID
 * @param {string} tenantIdString - String tenant identifier from header (e.g., 'hair-done-right-salon')
 * @returns {Promise<string>} - Tenant UUID
 * @throws {AppError} - If tenant not found
 */
const getTenantUUID = async (tenantIdString) => {
  const tenant = await Tenant.findOne({ where: { tenantId: tenantIdString } });
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }
  return tenant.id;
};

module.exports = {
  getTenantUUID,
};
