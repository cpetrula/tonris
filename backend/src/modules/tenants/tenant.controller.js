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

/**
 * GET /api/tenant/dashboard-stats
 * Get dashboard statistics for tenant
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const stats = await tenantService.getDashboardStats(tenantUUID);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tenant/profile
 * Get tenant business profile
 */
const getTenantProfile = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const profile = await tenantService.getTenantProfile(tenantUUID);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tenant/profile
 * Update tenant business profile
 */
const updateTenantProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, city, state, zipCode, website, description } = req.body;

    // Validate email format if provided
    if (email && !VALIDATION.EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const profile = await tenantService.updateTenantProfile(tenantUUID, {
      name, email, phone, address, city, state, zipCode, website, description,
    });

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tenant/hours
 * Get tenant business hours
 */
const getTenantHours = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const hours = await tenantService.getTenantHours(tenantUUID);

    res.status(200).json({
      success: true,
      data: hours,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tenant/hours
 * Update tenant business hours
 */
const updateTenantHours = async (req, res, next) => {
  try {
    const { hours } = req.body;

    if (!hours || typeof hours !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Hours object is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const updatedHours = await tenantService.updateTenantHours(tenantUUID, hours);

    res.status(200).json({
      success: true,
      data: updatedHours,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tenant/ai-settings
 * Get tenant AI voice settings
 */
const getTenantAiSettings = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const aiSettings = await tenantService.getTenantAiSettings(tenantUUID);

    res.status(200).json({
      success: true,
      data: aiSettings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tenant/ai-settings
 * Update tenant AI voice settings
 */
const updateTenantAiSettings = async (req, res, next) => {
  try {
    const { voiceType, language, greetingMessage, appointmentReminders, reminderHours, followUpCalls } = req.body;

    const tenantUUID = await getTenantUUID(req.tenantId);
    const aiSettings = await tenantService.updateTenantAiSettings(tenantUUID, {
      voiceType, language, greetingMessage, appointmentReminders, reminderHours, followUpCalls,
    });

    res.status(200).json({
      success: true,
      data: aiSettings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tenant/notifications
 * Get tenant notification settings
 */
const getTenantNotifications = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const notifications = await tenantService.getTenantNotifications(tenantUUID);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/tenant/notifications
 * Update tenant notification settings
 */
const updateTenantNotifications = async (req, res, next) => {
  try {
    const { email, sms } = req.body;

    const tenantUUID = await getTenantUUID(req.tenantId);
    const notifications = await tenantService.updateTenantNotifications(tenantUUID, { email, sms });

    res.status(200).json({
      success: true,
      data: notifications,
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
  getDashboardStats,
  // Granular settings
  getTenantProfile,
  updateTenantProfile,
  getTenantHours,
  updateTenantHours,
  getTenantAiSettings,
  updateTenantAiSettings,
  getTenantNotifications,
  updateTenantNotifications,
};
