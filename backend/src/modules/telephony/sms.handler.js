/**
 * SMS Handler
 * Handles incoming SMS webhooks and SMS notifications
 */
const twilioService = require('./twilio.service');
const { Tenant } = require('../tenants/tenant.model');
const logger = require('../../utils/logger');

/**
 * Handle incoming SMS webhook
 * @param {Object} params - Twilio webhook parameters
 * @returns {Promise<Object>} - Processing result with TwiML
 */
const handleIncomingSms = async (params) => {
  const {
    MessageSid,
    From,
    To,
    Body,
    NumMedia,
  } = params;
  
  logger.info(`Incoming SMS: ${MessageSid} from ${From} to ${To}`);
  
  try {
    // Find tenant by phone number
    const tenant = await findTenantByPhoneNumber(To);
    
    if (!tenant) {
      logger.warn(`No tenant found for phone number: ${To}`);
      return {
        success: false,
        twiml: twilioService.generateSmsResponse(
          'This number is not in service.'
        ),
      };
    }
    
    logger.info(`SMS received for tenant: ${tenant.id} - MessageSid: ${MessageSid}, Length: ${Body.length} chars`);
    
    // Process the SMS based on content
    const response = await processIncomingSms({
      tenant,
      from: From,
      to: To,
      body: Body,
      messageSid: MessageSid,
      numMedia: parseInt(NumMedia, 10) || 0,
      originalParams: params,
    });
    
    return {
      success: true,
      tenantId: tenant.id,
      twiml: response.twiml,
      action: response.action,
    };
  } catch (error) {
    logger.error(`Error handling incoming SMS: ${error.message}`);
    
    return {
      success: false,
      twiml: twilioService.generateSmsResponse(
        'Sorry, we couldn\'t process your message. Please try again later.'
      ),
    };
  }
};

/**
 * Process incoming SMS message
 * @param {Object} params - SMS parameters
 * @returns {Promise<Object>} - Processing result
 */
const processIncomingSms = async ({ tenant, body }) => {
  const normalizedBody = body.trim().toUpperCase();
  
  // Handle common SMS commands
  if (normalizedBody === 'STOP' || normalizedBody === 'UNSUBSCRIBE') {
    return {
      action: 'unsubscribe',
      twiml: twilioService.generateSmsResponse(
        'You have been unsubscribed from messages. Reply START to resubscribe.'
      ),
    };
  }
  
  if (normalizedBody === 'START' || normalizedBody === 'SUBSCRIBE') {
    return {
      action: 'subscribe',
      twiml: twilioService.generateSmsResponse(
        `You have been subscribed to messages from ${tenant.name}. Reply STOP to unsubscribe.`
      ),
    };
  }
  
  if (normalizedBody === 'HELP') {
    return {
      action: 'help',
      twiml: twilioService.generateSmsResponse(
        `${tenant.name}: Reply CONFIRM to confirm appointments, CANCEL to cancel, or call us for assistance.`
      ),
    };
  }
  
  if (normalizedBody === 'CONFIRM' || normalizedBody === 'YES' || normalizedBody === 'Y') {
    return {
      action: 'confirm_appointment',
      twiml: twilioService.generateSmsResponse(
        'Thank you for confirming your appointment. We look forward to seeing you!'
      ),
    };
  }
  
  if (normalizedBody === 'CANCEL' || normalizedBody === 'NO' || normalizedBody === 'N') {
    return {
      action: 'cancel_appointment',
      twiml: twilioService.generateSmsResponse(
        'Your appointment has been cancelled. Reply or call us to reschedule.'
      ),
    };
  }
  
  // Default response for unrecognized messages
  return {
    action: 'unknown',
    twiml: twilioService.generateSmsResponse(
      `Thank you for your message. We'll get back to you shortly. Reply HELP for options.`
    ),
  };
};

/**
 * Send SMS notification to a customer
 * @param {Object} params - Notification parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.to - Recipient phone number
 * @param {string} params.message - Message content
 * @param {string} params.type - Notification type (appointment_reminder, confirmation, etc.)
 * @returns {Promise<Object>} - Send result
 */
const sendCustomerNotification = async ({ tenantId, to, message, type }) => {
  try {
    const tenant = await Tenant.findOne({
      where: { tenantId },
    });
    
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    
    const fromNumber = tenant.metadata?.twilioPhoneNumber || tenant.settings?.twilioPhoneNumber;
    
    if (!fromNumber) {
      throw new Error(`No Twilio phone number configured for tenant: ${tenantId}`);
    }
    
    const result = await twilioService.sendSms({
      to,
      from: fromNumber,
      body: message,
    });
    
    logger.info(`Customer SMS sent: ${result.sid} type: ${type} tenant: ${tenantId}`);
    
    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      type,
    };
  } catch (error) {
    logger.error(`Error sending customer notification: ${error.message}`);
    throw error;
  }
};

/**
 * Send SMS notification to an employee
 * @param {Object} params - Notification parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.to - Employee phone number
 * @param {string} params.message - Message content
 * @param {string} params.type - Notification type
 * @returns {Promise<Object>} - Send result
 */
const sendEmployeeNotification = async ({ tenantId, to, message, type }) => {
  try {
    const tenant = await Tenant.findOne({
      where: { tenantId },
    });
    
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    
    const fromNumber = tenant.metadata?.twilioPhoneNumber || tenant.settings?.twilioPhoneNumber;
    
    if (!fromNumber) {
      throw new Error(`No Twilio phone number configured for tenant: ${tenantId}`);
    }
    
    const result = await twilioService.sendSms({
      to,
      from: fromNumber,
      body: message,
    });
    
    logger.info(`Employee SMS sent: ${result.sid} type: ${type} tenant: ${tenantId}`);
    
    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      type,
    };
  } catch (error) {
    logger.error(`Error sending employee notification: ${error.message}`);
    throw error;
  }
};

/**
 * Send appointment reminder SMS
 * @param {Object} params - Reminder parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.customerPhone - Customer phone number
 * @param {string} params.customerName - Customer name
 * @param {string} params.appointmentDate - Appointment date
 * @param {string} params.appointmentTime - Appointment time
 * @param {string} params.serviceName - Service name
 * @returns {Promise<Object>} - Send result
 */
const sendAppointmentReminder = async ({
  tenantId,
  customerPhone,
  customerName,
  appointmentDate,
  appointmentTime,
  serviceName,
}) => {
  const message = `Hi ${customerName}! This is a reminder for your ${serviceName} appointment on ${appointmentDate} at ${appointmentTime}. Reply CONFIRM to confirm or CANCEL to cancel.`;
  
  return sendCustomerNotification({
    tenantId,
    to: customerPhone,
    message,
    type: 'appointment_reminder',
  });
};

/**
 * Send appointment confirmation SMS
 * @param {Object} params - Confirmation parameters
 * @returns {Promise<Object>} - Send result
 */
const sendAppointmentConfirmation = async ({
  tenantId,
  customerPhone,
  customerName,
  appointmentDate,
  appointmentTime,
  serviceName,
}) => {
  const message = `Hi ${customerName}! Your ${serviceName} appointment has been confirmed for ${appointmentDate} at ${appointmentTime}. Reply HELP for options.`;
  
  return sendCustomerNotification({
    tenantId,
    to: customerPhone,
    message,
    type: 'appointment_confirmation',
  });
};

/**
 * Find tenant by their Twilio phone number
 * @param {string} phoneNumber - Phone number to look up
 * @returns {Promise<Object|null>} - Tenant or null
 */
const findTenantByPhoneNumber = async (phoneNumber) => {
  try {
    const normalizedNumber = normalizePhoneNumber(phoneNumber);
    
    // Find all active tenants
    const tenants = await Tenant.findAll({
      where: {
        status: 'active',
      },
    });
    
    if (!tenants || tenants.length === 0) {
      return null;
    }
    
    // Find tenant with matching phone number in metadata or settings
    for (const tenant of tenants) {
      const twilioPhone = tenant.metadata?.twilioPhoneNumber || tenant.settings?.twilioPhoneNumber;
      
      if (twilioPhone && normalizePhoneNumber(twilioPhone) === normalizedNumber) {
        return tenant;
      }
    }
    
    // No tenant found with matching phone number
    logger.warn(`No tenant found with phone number: ${phoneNumber}`);
    return null;
  } catch (error) {
    logger.error(`Error finding tenant by phone number: ${error.message}`);
    return null;
  }
};

/**
 * Normalize phone number for comparison
 * @param {string} phoneNumber - Phone number
 * @returns {string} - Normalized phone number
 */
const normalizePhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/[^0-9+]/g, '');
};

module.exports = {
  handleIncomingSms,
  sendCustomerNotification,
  sendEmployeeNotification,
  sendAppointmentReminder,
  sendAppointmentConfirmation,
};
