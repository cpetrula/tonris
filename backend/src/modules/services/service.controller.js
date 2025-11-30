/**
 * Service Controller
 * Handles HTTP requests for service endpoints
 */
const serviceService = require('./service.service');
const { getTenantUUID } = require('../../utils/tenant');

/**
 * GET /api/services
 * Get all services for tenant
 */
const getServices = async (req, res, next) => {
  try {
    const { status, category, limit, offset } = req.query;
    const tenantUUID = await getTenantUUID(req.tenantId);
    
    const result = await serviceService.getServices(tenantUUID, {
      status,
      category,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/services/:id
 * Get service by ID
 */
const getService = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const service = await serviceService.getServiceById(req.params.id, tenantUUID);

    res.status(200).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/services
 * Create a new service
 */
const createService = async (req, res, next) => {
  try {
    const { name, description, category, duration, price, addOns } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Service name is required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate price is a number
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a non-negative number',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate duration is a positive integer
    if (duration !== undefined && (!Number.isInteger(duration) || duration <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be a positive integer (minutes)',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const service = await serviceService.createService({
      name,
      description,
      category,
      duration,
      price,
      addOns,
    }, tenantUUID);

    res.status(201).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/services/:id
 * Update service
 */
const updateService = async (req, res, next) => {
  try {
    const { name, description, category, duration, price, status, addOns, metadata } = req.body;

    // Validate price if provided
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a non-negative number',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate duration if provided
    if (duration !== undefined && (!Number.isInteger(duration) || duration <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be a positive integer (minutes)',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const service = await serviceService.updateService(req.params.id, tenantUUID, {
      name,
      description,
      category,
      duration,
      price,
      status,
      addOns,
      metadata,
    });

    res.status(200).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/services/:id
 * Delete service
 */
const deleteService = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await serviceService.deleteService(req.params.id, tenantUUID);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
};
