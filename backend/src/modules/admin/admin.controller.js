/**
 * Admin Controller
 * Handles admin-related HTTP requests
 */
const adminService = require('./admin.service');
const logger = require('../../utils/logger');

/**
 * Get all clients (tenants) with usage metrics
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

/**
 * Get detailed usage for a specific client
 * GET /api/admin/clients/:id/usage
 */
const getClientUsage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const usage = await adminService.getClientUsageDetails(id);

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    logger.error(`Error in getClientUsage controller: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getClients,
  getClientUsage,
};
