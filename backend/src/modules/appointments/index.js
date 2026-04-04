/**
 * Appointments Module Index
 * Central export for appointments module
 */
const appointmentRoutes = require('./appointment.routes');
const availabilityRoutes = require('./availability.routes');
const waitingListRoutes = require('./waitingList.routes');
const appointmentService = require('./appointment.service');
const availabilityService = require('./availability.service');
const waitingListService = require('./waitingList.service');
const appointmentController = require('./appointment.controller');
const waitingListController = require('./waitingList.controller');
const { Appointment, APPOINTMENT_STATUS, CANCELLATION_REASONS } = require('./appointment.model');
const { WaitingList, WAITING_STATUS, WAITING_TYPE } = require('./waitingList.model');

module.exports = {
  appointmentRoutes,
  availabilityRoutes,
  waitingListRoutes,
  appointmentService,
  availabilityService,
  waitingListService,
  appointmentController,
  waitingListController,
  Appointment,
  APPOINTMENT_STATUS,
  CANCELLATION_REASONS,
  WaitingList,
  WAITING_STATUS,
  WAITING_TYPE,
};
