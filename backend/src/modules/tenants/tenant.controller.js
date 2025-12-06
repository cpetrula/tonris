/**
 * Tenant Controller
 * Handles HTTP requests for tenant endpoints
 */
const tenantService = require('./tenant.service');
const { getTenantUUID } = require('../../utils/tenant');

/**
 * Validation patterns
 */
const VALIDATION = {
  // Email validation regex
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Slug validation - lowercase letters, numbers, and hyphens only
  SLUG_REGEX: /^[a-z0-9-]+$/,
  // Phone number validation - must start with optional + followed by at least one digit, then allow numbers, spaces, parentheses, and hyphens (min 6 chars)
  PHONE_REGEX: /^[+]?[0-9][0-9\s()-]{5,}$/,
};

/**
 * GET /api/me
 * Get current user and tenant context
 */
const getCurrentUserAndTenant = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await tenantService.getCurrentUserAndTenant(
      req.user.userId,
      tenantUUID
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    const settings = await tenantService.getTenantSettings(tenantUUID);

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

    const tenantUUID = await getTenantUUID(req.tenantId);
    const updatedSettings = await tenantService.updateTenantSettings(
      tenantUUID,
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
    if (!VALIDATION.SLUG_REGEX.test(slug)) {
      return res.status(400).json({
        success: false,
        error: 'Slug must contain only lowercase letters, numbers, and hyphens',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate email format
    if (!VALIDATION.EMAIL_REGEX.test(contactEmail)) {
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    const tenant = await tenantService.getTenantById(tenantUUID);

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
    const { name, contactEmail, contactPhone, address, metadata, twilioPhoneNumber } = req.body;

    // Validate email format if provided
    if (contactEmail) {
      if (!VALIDATION.EMAIL_REGEX.test(contactEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
          code: 'VALIDATION_ERROR',
        });
      }
    }

    // Validate Twilio phone number format if provided
    if (twilioPhoneNumber) {
      if (!VALIDATION.PHONE_REGEX.test(twilioPhoneNumber)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Twilio phone number format',
          code: 'VALIDATION_ERROR',
        });
      }
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const tenant = await tenantService.updateTenant(tenantUUID, {
      name,
      contactEmail,
      contactPhone,
      address,
      metadata,
      twilioPhoneNumber,
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
    const tenantUUID = await getTenantUUID(req.tenantId);
    const tenant = await tenantService.activateTenant(tenantUUID);

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

    const tenantUUID = await getTenantUUID(req.tenantId);
    const tenant = await tenantService.updateTenantStatus(tenantUUID, status);

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
