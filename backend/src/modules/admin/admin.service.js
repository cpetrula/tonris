/**
 * Admin Service
 * Business logic for admin operations
 */
const { Tenant } = require('../tenants/tenant.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Get all clients (tenants) with their details
 * @returns {Promise<Array>} - List of all clients
 */
const getAllClients = async () => {
  try {
    // Fetch all tenants ordered by creation date (newest first)
    const tenants = await Tenant.findAll({
      attributes: ['id', 'name', 'slug', 'status', 'planType', 'contactEmail', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });

    logger.info(`Retrieved ${tenants.length} clients for admin view`);

    // Format the response
    return tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      planType: tenant.planType,
      contactEmail: tenant.contactEmail,
      signUpDate: tenant.createdAt,
      lastUpdated: tenant.updatedAt,
    }));
  } catch (error) {
    logger.error(`Error fetching clients for admin: ${error.message}`);
    throw new AppError('Failed to fetch clients', 500, 'FETCH_CLIENTS_FAILED');
  }
};

module.exports = {
  getAllClients,
};
