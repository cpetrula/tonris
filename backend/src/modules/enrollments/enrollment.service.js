/**
 * Enrollment Service
 * Handles all enrollment business logic
 */
const { Op } = require('sequelize');
const { Enrollment, ENROLLMENT_STATUS } = require('./enrollment.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new enrollment
 * @param {Object} data - Enrollment data
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Created enrollment
 */
const createEnrollment = async (data, tenantId) => {
  const {
    childFirstName,
    childLastName,
    childDateOfBirth,
    childGender,
    programPreference,
    schedulePreference,
    preferredStartDate,
    guardianFirstName,
    guardianLastName,
    guardianEmail,
    guardianPhone,
    guardianRelationship,
    guardianAddress,
    secondaryGuardianFirstName,
    secondaryGuardianLastName,
    secondaryGuardianPhone,
    secondaryGuardianRelationship,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    allergies,
    medicalNotes,
    specialNeeds,
    immunizationStatus,
    physicianName,
    physicianPhone,
    additionalNotes,
    source = 'website',
  } = data;

  const enrollment = await Enrollment.create({
    tenantId,
    childFirstName,
    childLastName,
    childDateOfBirth,
    childGender,
    programPreference,
    schedulePreference,
    preferredStartDate,
    guardianFirstName,
    guardianLastName,
    guardianEmail,
    guardianPhone,
    guardianRelationship,
    guardianAddress,
    secondaryGuardianFirstName,
    secondaryGuardianLastName,
    secondaryGuardianPhone,
    secondaryGuardianRelationship,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
    allergies,
    medicalNotes,
    specialNeeds,
    immunizationStatus,
    physicianName,
    physicianPhone,
    additionalNotes,
    source,
    status: ENROLLMENT_STATUS.SUBMITTED,
    submittedAt: new Date(),
  });

  logger.info(`New enrollment created: ${enrollment.id} for ${childFirstName} ${childLastName} (tenant: ${tenantId})`);

  return enrollment.toSafeObject();
};

/**
 * Get all enrollments for a tenant
 * @param {string} tenantId - Tenant identifier
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - List of enrollments with pagination
 */
const getEnrollments = async (tenantId, options = {}) => {
  const {
    status,
    programPreference,
    source,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = options;

  const where = { tenantId };

  if (status) {
    where.status = status;
  }

  if (programPreference) {
    where.programPreference = programPreference;
  }

  if (source) {
    where.source = source;
  }

  if (startDate || endDate) {
    where.submittedAt = {};
    if (startDate) {
      where.submittedAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      where.submittedAt[Op.lte] = new Date(endDate);
    }
  }

  const enrollments = await Enrollment.findAndCountAll({
    where,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [['submittedAt', 'DESC']],
  });

  return {
    enrollments: enrollments.rows.map(e => e.toSafeObject()),
    total: enrollments.count,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
};

/**
 * Get enrollment by ID
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Enrollment data
 */
const getEnrollmentById = async (enrollmentId, tenantId) => {
  const enrollment = await Enrollment.findOne({
    where: { id: enrollmentId, tenantId },
  });

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404, 'ENROLLMENT_NOT_FOUND');
  }

  return enrollment.toSafeObject();
};

/**
 * Update an enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} tenantId - Tenant identifier
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated enrollment
 */
const updateEnrollment = async (enrollmentId, tenantId, updateData) => {
  const enrollment = await Enrollment.findOne({
    where: { id: enrollmentId, tenantId },
  });

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404, 'ENROLLMENT_NOT_FOUND');
  }

  // Track status changes
  const oldStatus = enrollment.status;

  // Apply allowed updates
  const allowedFields = [
    'status', 'reviewNotes', 'additionalNotes',
    'childFirstName', 'childLastName', 'childDateOfBirth', 'childGender',
    'programPreference', 'schedulePreference', 'preferredStartDate',
    'guardianFirstName', 'guardianLastName', 'guardianEmail', 'guardianPhone',
    'guardianRelationship', 'guardianAddress',
    'secondaryGuardianFirstName', 'secondaryGuardianLastName',
    'secondaryGuardianPhone', 'secondaryGuardianRelationship',
    'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship',
    'allergies', 'medicalNotes', 'specialNeeds', 'immunizationStatus',
    'physicianName', 'physicianPhone',
  ];

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      enrollment[field] = updateData[field];
    }
  }

  // Set review metadata on status change
  if (updateData.status && updateData.status !== oldStatus) {
    enrollment.reviewedAt = new Date();
    if (updateData.reviewedBy) {
      enrollment.reviewedBy = updateData.reviewedBy;
    }
  }

  await enrollment.save();

  logger.info(`Enrollment updated: ${enrollmentId} (${oldStatus} → ${enrollment.status}) for tenant: ${tenantId}`);

  return enrollment.toSafeObject();
};

/**
 * Delete an enrollment
 * @param {string} enrollmentId - Enrollment ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Success message
 */
const deleteEnrollment = async (enrollmentId, tenantId) => {
  const enrollment = await Enrollment.findOne({
    where: { id: enrollmentId, tenantId },
  });

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404, 'ENROLLMENT_NOT_FOUND');
  }

  await enrollment.destroy();

  logger.info(`Enrollment deleted: ${enrollmentId} for tenant: ${tenantId}`);

  return { message: 'Enrollment deleted successfully' };
};

module.exports = {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
};
