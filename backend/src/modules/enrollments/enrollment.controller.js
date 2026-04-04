/**
 * Enrollment Controller
 * Handles HTTP requests for enrollment endpoints
 */
const enrollmentService = require('./enrollment.service');
const { getTenantUUID } = require('../../utils/tenant');
const { EMAIL_REGEX } = require('../../utils/validation');
const { Tenant } = require('../tenants/tenant.model');
const logger = require('../../utils/logger');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ==========================================
// PUBLIC ENDPOINTS (no auth required)
// ==========================================

/**
 * POST /api/public/enrollments
 * Submit a public enrollment form
 */
const submitPublicEnrollment = async (req, res, next) => {
  try {
    const tenantSlug = req.query.tenant;
    if (!tenantSlug) {
      return res.status(400).json({
        success: false,
        error: 'Tenant identifier is required (use ?tenant=slug)',
        code: 'VALIDATION_ERROR',
      });
    }

    // Resolve tenant — support both UUID and slug
    let tenantId;
    if (UUID_REGEX.test(tenantSlug)) {
      tenantId = tenantSlug;
    } else {
      // Look up tenant by slug/name
      const tenant = await Tenant.findOne({
        where: { slug: tenantSlug },
      });
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Organization not found',
          code: 'TENANT_NOT_FOUND',
        });
      }
      tenantId = tenant.id;
    }

    const {
      childFirstName,
      childLastName,
      childDateOfBirth,
      guardianFirstName,
      guardianLastName,
      guardianEmail,
      guardianPhone,
      programPreference,
    } = req.body;

    // Validate required fields
    if (!childFirstName || !childLastName || !childDateOfBirth) {
      return res.status(400).json({
        success: false,
        error: 'Child first name, last name, and date of birth are required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!guardianFirstName || !guardianLastName || !guardianEmail || !guardianPhone) {
      return res.status(400).json({
        success: false,
        error: 'Guardian first name, last name, email, and phone are required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!programPreference) {
      return res.status(400).json({
        success: false,
        error: 'Program preference is required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!EMAIL_REGEX.test(guardianEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    }

    const enrollment = await enrollmentService.createEnrollment(
      { ...req.body, source: 'website' },
      tenantId
    );

    res.status(201).json({
      success: true,
      data: { enrollment },
      message: 'Enrollment submitted successfully. We will contact you within 48-72 hours.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/enrollments/programs
 * Get available programs for a tenant (public)
 */
const getPublicPrograms = async (req, res, next) => {
  try {
    const tenantSlug = req.query.tenant;
    if (!tenantSlug) {
      return res.status(400).json({
        success: false,
        error: 'Tenant identifier is required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Return available programs
    // In the future this could be dynamic per tenant, but for now it's a standard list
    const programs = [
      { id: 'infant', name: 'Infant Care', ages: '3 months – 12 months', room: 'Caterpillar Room' },
      { id: 'toddler', name: 'Toddler', ages: '12 – 24 months', room: 'Dragonfly Room' },
      { id: 'early-preschool', name: 'Early Preschool', ages: '2 – 3 years', room: '' },
      { id: 'preschool', name: 'Preschool', ages: '2.5 – 4 years', room: 'Bumblebee Room' },
      { id: 'pre-k', name: 'Pre-Kindergarten', ages: '4 – 5 years', room: 'Butterfly Room' },
      { id: 'school-age', name: 'School Age', ages: 'TK – 12 years', room: '' },
    ];

    const scheduleOptions = [
      { id: 'five_days', name: '5 Days (Mon–Fri)' },
      { id: 'three_days', name: '3 Days (Mon/Wed/Fri)' },
      { id: 'two_days', name: '2 Days (Tue/Thu)' },
    ];

    res.status(200).json({
      success: true,
      data: { programs, scheduleOptions },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// AUTHENTICATED ENDPOINTS
// ==========================================

/**
 * GET /api/enrollments
 * Get all enrollments for tenant
 */
const getEnrollments = async (req, res, next) => {
  try {
    const { status, programPreference, source, startDate, endDate, limit, offset } = req.query;
    const tenantUUID = await getTenantUUID(req.tenantId);

    const result = await enrollmentService.getEnrollments(tenantUUID, {
      status,
      programPreference,
      source,
      startDate,
      endDate,
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
 * GET /api/enrollments/:id
 * Get enrollment by ID
 */
const getEnrollment = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const enrollment = await enrollmentService.getEnrollmentById(req.params.id, tenantUUID);

    res.status(200).json({
      success: true,
      data: { enrollment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/enrollments/:id
 * Update enrollment
 */
const updateEnrollment = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);

    // Attach reviewer info if status is being changed
    const updateData = { ...req.body };
    if (updateData.status && req.user) {
      updateData.reviewedBy = req.user.id;
    }

    const enrollment = await enrollmentService.updateEnrollment(
      req.params.id,
      tenantUUID,
      updateData
    );

    res.status(200).json({
      success: true,
      data: { enrollment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/enrollments/:id
 * Delete enrollment
 */
const deleteEnrollment = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    await enrollmentService.deleteEnrollment(req.params.id, tenantUUID);

    res.status(200).json({
      success: true,
      data: { message: 'Enrollment deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/enrollments/:id/approve
 * Approve an enrollment
 */
const approveEnrollment = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);

    const enrollment = await enrollmentService.updateEnrollment(
      req.params.id,
      tenantUUID,
      {
        status: 'approved',
        reviewedBy: req.user?.id,
        reviewNotes: req.body.reviewNotes,
      }
    );

    res.status(200).json({
      success: true,
      data: { enrollment },
      message: 'Enrollment approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/enrollments/:id/reject
 * Reject an enrollment
 */
const rejectEnrollment = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);

    const enrollment = await enrollmentService.updateEnrollment(
      req.params.id,
      tenantUUID,
      {
        status: 'rejected',
        reviewedBy: req.user?.id,
        reviewNotes: req.body.reviewNotes,
      }
    );

    res.status(200).json({
      success: true,
      data: { enrollment },
      message: 'Enrollment rejected',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitPublicEnrollment,
  getPublicPrograms,
  getEnrollments,
  getEnrollment,
  updateEnrollment,
  deleteEnrollment,
  approveEnrollment,
  rejectEnrollment,
};
