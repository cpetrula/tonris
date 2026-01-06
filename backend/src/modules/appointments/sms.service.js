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

/**
 * Format appointment reminder message
 * @param {Object} appointment - Appointment data
 * @param {Object} employee - Employee data
 * @param {Object} service - Service data
 * @param {string} businessName - Business name
 * @returns {string} - Formatted reminder message
 */
const formatReminderMessage = (appointment, employee, service, businessName) => {
  const appointmentDate = new Date(appointment.startTime);
  const dateStr = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = appointmentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'our team';
  const serviceName = service ? service.name : 'your appointment';

  return `Reminder from ${businessName}: Your ${serviceName} appointment with ${employeeName} is tomorrow at ${timeStr} on ${dateStr}. We look forward to seeing you!`;
};

/**
 * Send appointment reminder SMS
 * @param {Object} appointment - Appointment data
 * @param {Object} employee - Employee data
 * @param {Object} service - Service data
 * @param {string} businessName - Business name
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object|null>} - SMS send result or null if not sent
 */
const sendAppointmentReminderSms = async (appointment, employee, service, businessName, tenantId) => {
  // Check if SMS is configured
  if (!env.TWILIO_SMS_PHONE_NUMBER) {
    logger.warn('SMS not configured: TWILIO_SMS_PHONE_NUMBER is not set');
    return null;
  }

  // Check if customer phone is provided
  if (!appointment.customerPhone) {
    logger.debug('No customer phone number provided, skipping reminder SMS');
    return null;
  }

  // Check if user has opted in for SMS (only if email is provided)
  if (appointment.customerEmail) {
    const optedIn = await isUserOptedInForSms(appointment.customerEmail, tenantId);
    if (!optedIn) {
      logger.debug(`Customer ${appointment.customerEmail} has not opted in for SMS notifications`);
      return null;
    }
  }

  try {
    // Format the reminder message
    const messageBody = formatReminderMessage(appointment, employee, service, businessName);

    // Send the SMS
    const result = await twilioService.sendSms({
      to: appointment.customerPhone,
      from: env.TWILIO_SMS_PHONE_NUMBER,
      body: messageBody,
    });

    logger.info(`Appointment reminder SMS sent to ${appointment.customerPhone} for appointment ${appointment.id}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send appointment reminder SMS: ${error.message}`);
    return null;
  }
};

/**
 * Format new appointment notification for business owner
 * @param {Object} appointment - Appointment data
 * @param {Object} employee - Employee data
 * @param {Object} service - Service data
 * @param {string} businessName - Business name
 * @returns {string} - Formatted SMS message
 */
const formatNewAppointmentNotification = (appointment, employee, service, businessName) => {
  const appointmentDate = new Date(appointment.startTime);
  const dateStr = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = appointmentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Staff';
  const serviceName = service ? service.name : 'Service';
  const customerName = appointment.customerName || 'Customer';

  return `[${businessName}] New Booking!\n${customerName} - ${serviceName}\nWith: ${employeeName}\n${dateStr} at ${timeStr}`;
};

/**
 * Format cancellation notification for business owner
 * @param {Object} appointment - Appointment data
 * @param {Object} service - Service data
 * @param {string} businessName - Business name
 * @param {string} reason - Cancellation reason
 * @returns {string} - Formatted SMS message
 */
const formatCancellationNotification = (appointment, service, businessName, reason) => {
  const appointmentDate = new Date(appointment.startTime);
  const dateStr = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = appointmentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const serviceName = service ? service.name : 'Service';
  const customerName = appointment.customerName || 'Customer';
  const reasonText = reason ? `\nReason: ${reason}` : '';

  return `[${businessName}] Appointment Cancelled!\n${customerName} - ${serviceName}\n${dateStr} at ${timeStr}${reasonText}`;
};

/**
 * Send SMS notification to business owner for new appointment
 * @param {Object} appointment - Appointment data
 * @param {Object} employee - Employee data
 * @param {Object} service - Service data
 * @param {Object} tenant - Tenant data with contactPhone and notificationSettings
 * @returns {Promise<Object|null>} - SMS send result or null if not sent
 */
const sendNewAppointmentSmsNotification = async (appointment, employee, service, tenant) => {
  // Check if SMS is configured
  if (!env.TWILIO_SMS_PHONE_NUMBER) {
    logger.warn('SMS not configured: TWILIO_SMS_PHONE_NUMBER is not set');
    return null;
  }

  // Check if tenant has a contact phone
  if (!tenant.contactPhone) {
    logger.debug(`No contact phone for tenant ${tenant.id}, skipping SMS notification`);
    return null;
  }

  // Check notification settings
  let notificationSettings = tenant.notificationSettings;
  if (typeof notificationSettings === 'string') {
    try {
      notificationSettings = JSON.parse(notificationSettings);
    } catch (e) {
      notificationSettings = {};
    }
  }

  // Default to true if not set
  const smsNewAppointment = notificationSettings?.smsNewAppointment !== false;

  if (!smsNewAppointment) {
    logger.debug(`SMS notification for new appointments is disabled for tenant ${tenant.id}`);
    return null;
  }

  try {
    // Format the message
    const messageBody = formatNewAppointmentNotification(appointment, employee, service, tenant.name);

    // Send the SMS
    const result = await twilioService.sendSms({
      to: tenant.contactPhone,
      from: env.TWILIO_SMS_PHONE_NUMBER,
      body: messageBody,
    });

    logger.info(`New appointment SMS notification sent to business owner ${tenant.contactPhone} for appointment ${appointment.id}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send new appointment SMS notification to business owner: ${error.message}`);
    return null;
  }
};

/**
 * Send SMS notification to business owner for appointment cancellation
 * @param {Object} appointment - Appointment data
 * @param {Object} service - Service data
 * @param {Object} tenant - Tenant data with contactPhone and notificationSettings
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object|null>} - SMS send result or null if not sent
 */
const sendCancellationSmsNotification = async (appointment, service, tenant, reason) => {
  // Check if SMS is configured
  if (!env.TWILIO_SMS_PHONE_NUMBER) {
    logger.warn('SMS not configured: TWILIO_SMS_PHONE_NUMBER is not set');
    return null;
  }

  // Check if tenant has a contact phone
  if (!tenant.contactPhone) {
    logger.debug(`No contact phone for tenant ${tenant.id}, skipping SMS notification`);
    return null;
  }

  // Check notification settings
  let notificationSettings = tenant.notificationSettings;
  if (typeof notificationSettings === 'string') {
    try {
      notificationSettings = JSON.parse(notificationSettings);
    } catch (e) {
      notificationSettings = {};
    }
  }

  // Default to true if not set
  const smsCancellation = notificationSettings?.smsCancellation !== false;

  if (!smsCancellation) {
    logger.debug(`SMS notification for cancellations is disabled for tenant ${tenant.id}`);
    return null;
  }

  try {
    // Format the message
    const messageBody = formatCancellationNotification(appointment, service, tenant.name, reason);

    // Log the message body for debugging
    logger.info(`Cancellation SMS message body: ${messageBody.substring(0, 50)}...`);

    // Send the SMS
    const result = await twilioService.sendSms({
      to: tenant.contactPhone,
      from: env.TWILIO_SMS_PHONE_NUMBER,
      body: messageBody,
    });

    logger.info(`Cancellation SMS notification sent to business owner ${tenant.contactPhone} for appointment ${appointment.id}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send cancellation SMS notification to business owner: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendAppointmentConfirmationSms,
  sendAppointmentReminderSms,
  sendNewAppointmentSmsNotification,
  sendCancellationSmsNotification,
  formatAppointmentSummary,
  formatReminderMessage,
  formatNewAppointmentNotification,
  formatCancellationNotification,
  isUserOptedInForSms,
};
