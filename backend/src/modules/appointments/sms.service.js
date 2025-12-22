/**
 * SMS Service
 * Handles sending SMS notifications for appointments
 */
const twilioService = require('../telephony/twilio.service');
const User = require('../../models/User');
const env = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Format appointment data into a user-friendly SMS message
 * @param {Object} appointment - Appointment data
 * @param {Object} employee - Employee data
 * @param {Object} service - Service data
 * @returns {string} - Formatted SMS message
 */
const formatAppointmentSummary = (appointment, employee, service) => {
  const appointmentDate = new Date(appointment.startTime);
  const dateStr = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = appointmentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'our team';
  const serviceName = service ? service.name : 'your service';
  const duration = appointment.totalDuration || (service ? service.duration : 0);

  return `Appointment Confirmed!\n\nService: ${serviceName}\nWith: ${employeeName}\nDate: ${dateStr}\nTime: ${timeStr}\nDuration: ${duration} min\n\nSee you soon!`;
};

/**
 * Check if a user has opted in for SMS notifications
 * @param {string} customerEmail - Customer email to check
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} - True if user exists and has opted in for SMS
 */
const isUserOptedInForSms = async (customerEmail, tenantId) => {
  if (!customerEmail) {
    return false;
  }

  try {
    const user = await User.findOne({
      where: { email: customerEmail, tenantId },
    });

    // Return true only if user exists and has smsOptIn set to true
    return !!(user && user.smsOptIn === true);
  } catch (error) {
    logger.error(`Error checking SMS opt-in status: ${error.message}`);
    return false;
  }
};

/**
 * Send appointment confirmation SMS
 * @param {Object} appointment - Appointment data
 * @param {Object} employee - Employee data
 * @param {Object} service - Service data
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} - SMS send result or null if not sent
 */
const sendAppointmentConfirmationSms = async (appointment, employee, service, tenantId) => {
  // Check if SMS is configured
  if (!env.TWILIO_SMS_PHONE_NUMBER) {
    logger.warn('SMS not configured: TWILIO_SMS_PHONE_NUMBER is not set');
    return null;
  }

  // Check if customer phone is provided
  if (!appointment.customerPhone) {
    logger.info('No customer phone number provided, skipping SMS');
    return null;
  }

  // Check if user has opted in for SMS (only if email is provided)
  if (appointment.customerEmail) {
    const optedIn = await isUserOptedInForSms(appointment.customerEmail, tenantId);
    if (!optedIn) {
      logger.info(`Customer ${appointment.customerEmail} has not opted in for SMS notifications`);
      return null;
    }
  }

  try {
    // Format the message
    const messageBody = formatAppointmentSummary(appointment, employee, service);

    // Send the SMS
    const result = await twilioService.sendSms({
      to: appointment.customerPhone,
      from: env.TWILIO_SMS_PHONE_NUMBER,
      body: messageBody,
    });

    logger.info(`Appointment confirmation SMS sent to ${appointment.customerPhone} for appointment ${appointment.id}`);
    return result;
  } catch (error) {
    // Log error but don't fail the appointment creation
    logger.error(`Failed to send appointment confirmation SMS: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendAppointmentConfirmationSms,
  formatAppointmentSummary,
  isUserOptedInForSms,
};
