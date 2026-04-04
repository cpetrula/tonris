/**
 * Enrollment Controller
 * Handles HTTP requests for enrollment endpoints
 */
const { Op } = require('sequelize');
const enrollmentService = require('./enrollment.service');
const { getTenantUUID } = require('../../utils/tenant');
const { EMAIL_REGEX } = require('../../utils/validation');
const { Tenant } = require('../tenants/tenant.model');
const logger = require('../../utils/logger');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve tenant ID from a slug, name fragment, or UUID
 * Slugs are generated as "name-timestamp" so we also try matching by slug prefix
 */
const resolveTenantId = async (identifier) => {
  if (UUID_REGEX.test(identifier)) {
    return identifier;
  }

  // Try exact slug match first
  let tenant = await Tenant.findOne({ where: { slug: identifier } });
  if (tenant) return tenant.id;

  // Try slug prefix match (slugs are "name-timestamp")
  tenant = await Tenant.findOne({
    where: { slug: { [Op.like]: `${identifier}-%` } },
  });
  if (tenant) return tenant.id;

  // Try case-insensitive name match
  tenant = await Tenant.findOne({
    where: { name: { [Op.like]: `%${identifier.replace(/-/g, ' ')}%` } },
  });
  if (tenant) return tenant.id;

  return null;
};

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

    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
        code: 'TENANT_NOT_FOUND',
      });
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
      { id: 'infant', name: 'Infants', ages: '0 – 12 months' },
      { id: 'toddler', name: 'Toddlers', ages: '12 – 24 months' },
      { id: 'early-preschool', name: 'Early Preschool', ages: '2 – 3 years' },
      { id: 'preschool', name: 'Preschool', ages: '3 – 4 years' },
      { id: 'pre-k', name: 'Pre-Kindergarten', ages: '4 – 5 years' },
      { id: 'school-age', name: 'School Age', ages: 'TK – 12 years' },
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

/**
 * POST /api/public/enrollments/tour
 * Submit a tour request (lightweight enrollment)
 */
const submitTourRequest = async (req, res, next) => {
  try {
    const tenantSlug = req.query.tenant;
    if (!tenantSlug) {
      return res.status(400).json({
        success: false,
        error: 'Tenant identifier is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantId = await resolveTenantId(tenantSlug);
    if (!tenantId) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
        code: 'TENANT_NOT_FOUND',
      });
    }

    const { firstName, lastName, email, phone, preferredDate, preferredTime, childAge, programInterest, notes } = req.body;

    // Validate preferred date is not on a weekend
    if (preferredDate) {
      const date = new Date(preferredDate + 'T12:00:00');
      const day = date.getDay();
      if (day === 0 || day === 6) {
        return res.status(400).json({
          success: false,
          error: 'Tours are only available Monday through Friday',
          code: 'VALIDATION_ERROR',
        });
      }
    }

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, email, and phone are required',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    }

    // Create as a lightweight enrollment with "tour" program preference
    const enrollment = await enrollmentService.createEnrollment(
      {
        childFirstName: childAge || 'TBD',
        childLastName: lastName,
        childDateOfBirth: '2020-01-01', // Placeholder — will be collected during tour
        programPreference: programInterest || 'undecided',
        guardianFirstName: firstName,
        guardianLastName: lastName,
        guardianEmail: email,
        guardianPhone: phone,
        preferredStartDate: preferredDate || undefined,
        additionalNotes: [
          'TOUR REQUEST',
          preferredDate ? `Preferred date: ${preferredDate}` : null,
          preferredTime ? `Preferred time: ${preferredTime}` : null,
          childAge ? `Child age: ${childAge}` : null,
          notes || null,
        ].filter(Boolean).join(' | '),
        source: 'website',
      },
      tenantId
    );

    logger.info(`Tour request submitted: ${enrollment.id} from ${firstName} ${lastName} (tenant: ${tenantId})`);

    res.status(201).json({
      success: true,
      data: { tourRequest: enrollment },
      message: 'Tour request submitted. We will call you within 24 hours to confirm.',
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
  submitTourRequest,
  getPublicPrograms,
  getEnrollments,
  getEnrollment,
  updateEnrollment,
  deleteEnrollment,
  approveEnrollment,
  rejectEnrollment,
};
