/**
 * Admin Controller
 * Handles admin-related HTTP requests
 */
const adminService = require('./admin.service');
const logger = require('../../utils/logger');

/**
 * Get all clients (tenants)
 * GET /api/admin/clients
 */
const getClients = async (req, res, next) => {
  try {
    const clients = await adminService.getAllClients();

    res.status(200).json({
      success: true,
      data: {
        clients,
        total: clients.length,
      },
    });
  } catch (error) {
    logger.error(`Error in getClients controller: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getClients,
};
