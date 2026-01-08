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

/**
 * Get aggregate metrics across all tenants
 * GET /api/admin/metrics
 */
const getMetrics = async (req, res, next) => {
  try {
    const metrics = await adminService.getAggregateMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error(`Error in getMetrics controller: ${error.message}`);
    next(error);
  }
};

/**
 * Get debug info about tenant ID mappings
 * GET /api/admin/debug
 */
const getDebug = async (req, res, next) => {
  try {
    const debugInfo = await adminService.getDebugInfo();

    res.status(200).json({
      success: true,
      data: debugInfo,
    });
  } catch (error) {
    logger.error(`Error in getDebug controller: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getClients,
  getMetrics,
  getDebug,
};
