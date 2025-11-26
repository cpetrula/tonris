/**
 * Appointments Module Index
 * Central export for appointments module
 */
const appointmentRoutes = require('./appointment.routes');
const availabilityRoutes = require('./availability.routes');
const appointmentService = require('./appointment.service');
const availabilityService = require('./availability.service');
const appointmentController = require('./appointment.controller');
const { Appointment, APPOINTMENT_STATUS, CANCELLATION_REASONS } = require('./appointment.model');

module.exports = {
  appointmentRoutes,
  availabilityRoutes,
  appointmentService,
  availabilityService,
  appointmentController,
  Appointment,
  APPOINTMENT_STATUS,
  CANCELLATION_REASONS,
};
