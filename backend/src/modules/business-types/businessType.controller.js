/**
 * BusinessType Controller
 * Handles HTTP requests for business type endpoints
 */
const businessTypeService = require('./businessType.service');

/**
 * GET /api/business-types/active
 * Get all active business types (public endpoint for registration)
 */
const getActiveBusinessTypes = async (req, res, next) => {
  try {
    const businessTypes = await businessTypeService.getActiveBusinessTypes();

    res.status(200).json({
      success: true,
      data: { businessTypes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/business-types
 * Get all business types (admin only)
 */
const getAllBusinessTypes = async (req, res, next) => {
  try {
    const businessTypes = await businessTypeService.getAllBusinessTypes();

    res.status(200).json({
      success: true,
      data: { businessTypes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/business-types/:id
 * Get business type by ID
 */
const getBusinessTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const businessType = await businessTypeService.getBusinessTypeById(id);

    res.status(200).json({
      success: true,
      data: { businessType },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/business-types
 * Create a new business type (admin only)
 */
const createBusinessType = async (req, res, next) => {
  try {
    const { businessType, agentId, active } = req.body;

    // Validate input
    if (!businessType || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'Business type name and agent ID are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const newBusinessType = await businessTypeService.createBusinessType({
      businessType,
      agentId,
      active,
    });

    res.status(201).json({
      success: true,
      data: { businessType: newBusinessType },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/business-types/:id
 * Update a business type (admin only)
 */
const updateBusinessType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const businessType = await businessTypeService.updateBusinessType(id, updateData);

    res.status(200).json({
      success: true,
      data: { businessType },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/business-types/:id
 * Delete a business type (admin only)
 */
const deleteBusinessType = async (req, res, next) => {
  try {
    const { id } = req.params;
    await businessTypeService.deleteBusinessType(id);

    res.status(200).json({
      success: true,
      message: 'Business type deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveBusinessTypes,
  getAllBusinessTypes,
  getBusinessTypeById,
  createBusinessType,
  updateBusinessType,
  deleteBusinessType,
};
