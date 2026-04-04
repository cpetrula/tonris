/**
 * Enrollments Module Index
 * Central export for enrollments module
 */
const { enrollmentRoutes, publicEnrollmentRoutes } = require('./enrollment.routes');
const enrollmentService = require('./enrollment.service');
const enrollmentController = require('./enrollment.controller');
const {
  Enrollment,
  ENROLLMENT_STATUS,
  ENROLLMENT_SOURCE,
  SCHEDULE_PREFERENCE,
  IMMUNIZATION_STATUS,
  GENDER,
} = require('./enrollment.model');

module.exports = {
  enrollmentRoutes,
  publicEnrollmentRoutes,
  enrollmentService,
  enrollmentController,
  Enrollment,
  ENROLLMENT_STATUS,
  ENROLLMENT_SOURCE,
  SCHEDULE_PREFERENCE,
  IMMUNIZATION_STATUS,
  GENDER,
};
