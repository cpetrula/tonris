/**
 * SMS Handler
 * Handles incoming SMS webhooks and SMS notifications
 * Includes consent tracking and message logging
 */
const twilioService = require('./twilio.service');
const { Tenant } = require('../tenants/tenant.model');
const { SmsConsent, CONSENT_STATUS } = require('./smsConsent.model');
const { SmsMessage, MESSAGE_INTENT } = require('./smsMessage.model');
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
    
    logger.info(`SMS received for tenant: ${tenant.tenantId} - MessageSid: ${MessageSid}, Length: ${Body.length} chars`);
    
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

    // Log the incoming message
    try {
      await SmsMessage.logInbound({
        tenantId: tenant.id,
        from: From,
        to: To,
        body: Body,
        twilioSid: MessageSid,
        parsedIntent: response.intent || MESSAGE_INTENT.OTHER,
        metadata: { numMedia: parseInt(NumMedia, 10) || 0 },
      });
    } catch (logError) {
      logger.error(`Failed to log incoming SMS: ${logError.message}`);
    }

    return {
      success: true,
      tenantId: tenant.tenantId,
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
const processIncomingSms = async ({ tenant, from, body }) => {
  const normalizedBody = body.trim().toUpperCase();

  // Handle common SMS commands
  if (normalizedBody === 'STOP' || normalizedBody === 'UNSUBSCRIBE') {
    // Update consent to opted out
    try {
      await SmsConsent.recordConsent({
        phoneNumber: from,
        tenantId: tenant.id,
        consented: false,
        source: 'sms_reply',
        metadata: { keyword: normalizedBody },
      });
      logger.info(`SMS consent revoked for ${from} (tenant: ${tenant.tenantId})`);
    } catch (consentError) {
      logger.error(`Failed to update consent: ${consentError.message}`);
    }

    return {
      action: 'unsubscribe',
      intent: MESSAGE_INTENT.STOP,
      twiml: twilioService.generateSmsResponse(
        'You have been unsubscribed from messages. Reply START to resubscribe.'
      ),
    };
  }

  if (normalizedBody === 'START' || normalizedBody === 'SUBSCRIBE') {
    // Update consent to opted in
    try {
      await SmsConsent.recordConsent({
        phoneNumber: from,
        tenantId: tenant.id,
        consented: true,
        source: 'sms_reply',
        metadata: { keyword: normalizedBody },
      });
      logger.info(`SMS consent granted for ${from} (tenant: ${tenant.tenantId})`);
    } catch (consentError) {
      logger.error(`Failed to update consent: ${consentError.message}`);
    }

    return {
      action: 'subscribe',
      intent: MESSAGE_INTENT.START,
      twiml: twilioService.generateSmsResponse(
        `You have been subscribed to messages from ${tenant.name}. Reply STOP to unsubscribe.`
      ),
    };
  }

  if (normalizedBody === 'HELP') {
    return {
      action: 'help',
      intent: MESSAGE_INTENT.HELP,
      twiml: twilioService.generateSmsResponse(
        `${tenant.name}: Reply CONFIRM to confirm appointments, CANCEL to cancel, or call us for assistance.`
      ),
    };
  }

  if (normalizedBody === 'CONFIRM' || normalizedBody === 'YES' || normalizedBody === 'Y') {
    return {
      action: 'confirm_appointment',
      intent: MESSAGE_INTENT.CONFIRM,
      twiml: twilioService.generateSmsResponse(
        'Thank you for confirming your appointment. We look forward to seeing you!'
      ),
    };
  }

  if (normalizedBody === 'CANCEL' || normalizedBody === 'NO' || normalizedBody === 'N') {
    return {
      action: 'cancel_appointment',
      intent: MESSAGE_INTENT.CANCEL,
      twiml: twilioService.generateSmsResponse(
        'Your appointment has been cancelled. Reply or call us to reschedule.'
      ),
    };
  }

  // Default response for unrecognized messages
  return {
    action: 'unknown',
    intent: MESSAGE_INTENT.OTHER,
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
 * @param {boolean} params.skipConsentCheck - Skip consent check (for transactional messages)
 * @param {Object} params.metadata - Additional metadata to log
 * @returns {Promise<Object>} - Send result
 */
const sendCustomerNotification = async ({ tenantId, to, message, type, skipConsentCheck = false, metadata = {} }) => {
  try {
    const tenant = await Tenant.findOne({
      where: { tenantId },
    });

    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    // Check consent unless explicitly skipped (for transactional messages)
    if (!skipConsentCheck) {
      const hasConsent = await SmsConsent.hasConsent(to, tenant.id);
      const consent = await SmsConsent.getConsent(to, tenant.id);

      // If explicitly opted out, don't send
      if (consent && consent.status === CONSENT_STATUS.OPTED_OUT) {
        logger.warn(`SMS blocked - user opted out: ${to} (tenant: ${tenantId})`);
        return {
          success: false,
          error: 'User has opted out of SMS messages',
          code: 'CONSENT_REVOKED',
        };
      }

      // Log info if no explicit consent but not opted out
      if (!hasConsent && !consent) {
        logger.info(`SMS sending to ${to} without explicit consent (tenant: ${tenantId})`);
      }
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

    // Log the outbound message
    try {
      await SmsMessage.logOutbound({
        tenantId: tenant.id,
        from: fromNumber,
        to,
        body: message,
        type,
        twilioSid: result.sid,
        metadata,
      });
    } catch (logError) {
      logger.error(`Failed to log outbound SMS: ${logError.message}`);
    }

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

/**
 * Check if a phone number has SMS consent
 * @param {string} phoneNumber - Phone number to check
 * @param {string} tenantId - Tenant ID (UUID)
 * @returns {Promise<Object>} - Consent status
 */
const checkSmsConsent = async (phoneNumber, tenantId) => {
  try {
    const consent = await SmsConsent.getConsent(phoneNumber, tenantId);

    if (!consent) {
      return {
        hasConsent: false,
        status: 'no_record',
        message: 'No consent record found',
      };
    }

    return {
      hasConsent: consent.status === CONSENT_STATUS.OPTED_IN,
      status: consent.status,
      consentedAt: consent.consentedAt,
      optedOutAt: consent.optedOutAt,
      source: consent.source,
    };
  } catch (error) {
    logger.error(`Error checking SMS consent: ${error.message}`);
    throw error;
  }
};

/**
 * Record SMS consent
 * @param {Object} params - Consent parameters
 * @returns {Promise<Object>} - Result
 */
const recordSmsConsent = async ({ phoneNumber, tenantId, consented, source, metadata = {} }) => {
  try {
    const consent = await SmsConsent.recordConsent({
      phoneNumber,
      tenantId,
      consented,
      source,
      metadata,
    });

    logger.info(`SMS consent ${consented ? 'granted' : 'revoked'} for ${phoneNumber} (tenant: ${tenantId})`);

    return {
      success: true,
      status: consent.status,
      consentedAt: consent.consentedAt,
      optedOutAt: consent.optedOutAt,
    };
  } catch (error) {
    logger.error(`Error recording SMS consent: ${error.message}`);
    throw error;
  }
};

/**
 * Get SMS conversation history for a phone number
 * @param {string} phoneNumber - Phone number
 * @param {string} tenantId - Tenant ID (UUID)
 * @param {number} limit - Max messages to return
 * @returns {Promise<Object>} - Conversation history
 */
const getSmsConversation = async (phoneNumber, tenantId, limit = 100) => {
  try {
    const messages = await SmsMessage.getConversation(phoneNumber, tenantId, limit);

    return {
      success: true,
      phoneNumber,
      messageCount: messages.length,
      messages: messages.map(msg => ({
        id: msg.id,
        direction: msg.direction,
        body: msg.body,
        status: msg.status,
        type: msg.messageType,
        parsedIntent: msg.parsedIntent,
        createdAt: msg.createdAt,
      })),
    };
  } catch (error) {
    logger.error(`Error getting SMS conversation: ${error.message}`);
    throw error;
  }
};

/**
 * Update SMS message status from Twilio webhook
 * @param {Object} params - Status update parameters
 * @returns {Promise<Object>} - Update result
 */
const updateSmsStatus = async ({ messageSid, status, errorCode, errorMessage }) => {
  try {
    const message = await SmsMessage.updateStatus(messageSid, {
      status,
      errorCode,
      errorMessage,
    });

    if (message) {
      logger.info(`SMS status updated: ${messageSid} -> ${status}`);
      return { success: true, updated: true };
    }

    return { success: true, updated: false, message: 'Message not found' };
  } catch (error) {
    logger.error(`Error updating SMS status: ${error.message}`);
    throw error;
  }
};

module.exports = {
  handleIncomingSms,
  sendCustomerNotification,
  sendEmployeeNotification,
  sendAppointmentReminder,
  sendAppointmentConfirmation,
  checkSmsConsent,
  recordSmsConsent,
  getSmsConversation,
  updateSmsStatus,
};
