/**
 * Tenant Controller
 * Handles HTTP requests for tenant endpoints
 */
const tenantService = require('./tenant.service');

/**
 * GET /api/me
 * Get current user and tenant context
 */
const getCurrentUserAndTenant = async (req, res, next) => {
  try {
    const result = await tenantService.getCurrentUserAndTenant(
      req.user.userId,
      req.tenantId
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tenant/settings
 * Get tenant settings
 */
const getTenantSettings = async (req, res, next) => {
  try {
    const settings = await tenantService.getTenantSettings(req.tenantId);

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tenant/settings
 * Update tenant settings
 */
const updateTenantSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        error: 'Settings object is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const updatedSettings = await tenantService.updateTenantSettings(
      req.tenantId,
      settings
    );

    res.status(200).json({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tenant
 * Create a new tenant (for signup flow)
 */
const createTenant = async (req, res, next) => {
  try {
    const { name, slug, contactEmail, contactPhone, planType } = req.body;

    // Validate required fields
    if (!name || !slug || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Name, slug, and contact email are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        success: false,
        error: 'Slug must contain only lowercase letters, numbers, and hyphens',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenant = await tenantService.createTenant({
      name,
      slug,
      contactEmail,
      contactPhone,
      planType,
    });

    res.status(201).json({
      success: true,
      data: { tenant },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tenant
 * Get current tenant information
 */
const getTenant = async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.tenantId);

    res.status(200).json({
      success: true,
      data: { tenant },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tenant
 * Update tenant information
 */
const updateTenant = async (req, res, next) => {
  try {
    const { name, contactEmail, contactPhone, address, metadata } = req.body;

    // Validate email format if provided
    if (contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
          code: 'VALIDATION_ERROR',
        });
      }
    }

    const tenant = await tenantService.updateTenant(req.tenantId, {
      name,
      contactEmail,
      contactPhone,
      address,
      metadata,
    });

    res.status(200).json({
      success: true,
      data: { tenant },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tenant/activate
 * Activate tenant (complete onboarding)
 */
const activateTenant = async (req, res, next) => {
  try {
    const tenant = await tenantService.activateTenant(req.tenantId);

    res.status(200).json({
      success: true,
      data: { tenant },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tenant/status
 * Update tenant status
 */
const updateTenantStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenant = await tenantService.updateTenantStatus(req.tenantId, status);

    res.status(200).json({
      success: true,
      data: { tenant },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUserAndTenant,
  getTenantSettings,
  updateTenantSettings,
  createTenant,
  getTenant,
  updateTenant,
  activateTenant,
  updateTenantStatus,
};
