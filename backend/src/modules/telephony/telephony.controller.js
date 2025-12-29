/**
 * Telephony Controller
 * Handles HTTP requests for telephony endpoints
 */
const twilioService = require('./twilio.service');
const callHandler = require('./call.handler');
const smsHandler = require('./sms.handler');
const { Tenant } = require('../tenants/tenant.model');
const { getTenantUUID } = require('../../utils/tenant');
const logger = require('../../utils/logger');
const env = require('../../config/env');

/**
 * POST /api/webhooks/twilio/voice
 * Handle incoming voice call webhook
 */
const handleVoiceWebhook = async (req, res, next) => {
  try {
    // Validate Twilio signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers['x-twilio-signature'];
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      
      if (!twilioService.validateWebhookSignature(signature, url, req.body)) {
        logger.warn('Invalid Twilio webhook signature for voice');
        return res.status(403).send('Invalid signature');
      }
    }
    
    const result = await callHandler.handleIncomingCall(req.body);
    
    // Return TwiML response
    res.type('text/xml');
    res.send(result.twiml);
  } catch (error) {
    logger.error(`Voice webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/webhooks/twilio/sms
 * Handle incoming SMS webhook
 */
const handleSmsWebhook = async (req, res, next) => {
  try {
    // Validate Twilio signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers['x-twilio-signature'];
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      
      if (!twilioService.validateWebhookSignature(signature, url, req.body, 'sms')) {
        logger.warn('Invalid Twilio webhook signature for SMS');
        return res.status(403).send('Invalid signature');
      }
    }
    
    const result = await smsHandler.handleIncomingSms(req.body);
    
    // Return TwiML response
    res.type('text/xml');
    res.send(result.twiml);
  } catch (error) {
    logger.error(`SMS webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/webhooks/twilio/status
 * Handle call status callback webhook
 */
const handleStatusWebhook = async (req, res, next) => {
  try {
    // Validate Twilio signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers['x-twilio-signature'];
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      
      if (!twilioService.validateWebhookSignature(signature, url, req.body)) {
        logger.warn('Invalid Twilio webhook signature for status');
        return res.status(403).send('Invalid signature');
      }
    }
    
    await callHandler.handleCallStatus(req.body);
    
    // Acknowledge receipt
    res.status(200).send('OK');
  } catch (error) {
    logger.error(`Status webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/telephony/provision-number
 * Provision a new phone number for the tenant
 */
const provisionNumber = async (req, res, next) => {
  try {
    const { areaCode, country } = req.body;
    const tenantUUID = await getTenantUUID(req.tenantId);
    
    const result = await twilioService.provisionPhoneNumber({
      tenantId: tenantUUID,
      areaCode,
      country,
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Phone number provisioned successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/telephony/release-number/:sid
 * Release a phone number
 */
const releaseNumber = async (req, res, next) => {
  try {
    const { sid } = req.params;
    
    await twilioService.releasePhoneNumber(sid);
    
    res.status(200).json({
      success: true,
      message: 'Phone number released successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/telephony/send-sms
 * Send an SMS message
 */
const sendSms = async (req, res, next) => {
  try {
    const { to, message, type } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number and message are required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await smsHandler.sendCustomerNotification({
      tenantId: tenantUUID,
      to,
      message,
      type: type || 'custom',
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
 * POST /api/telephony/send-employee-sms
 * Send an SMS to an employee
 */
const sendEmployeeSms = async (req, res, next) => {
  try {
    const { to, message, type } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number and message are required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await smsHandler.sendEmployeeNotification({
      tenantId: tenantUUID,
      to,
      message,
      type: type || 'custom',
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
 * POST /api/telephony/send-appointment-reminder
 * Send appointment reminder SMS
 */
const sendAppointmentReminder = async (req, res, next) => {
  try {
    const {
      customerPhone,
      customerName,
      appointmentDate,
      appointmentTime,
      serviceName,
    } = req.body;
    
    if (!customerPhone || !customerName || !appointmentDate || !appointmentTime || !serviceName) {
      return res.status(400).json({
        success: false,
        error: 'Customer phone, name, appointment date, time, and service name are required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await smsHandler.sendAppointmentReminder({
      tenantId: tenantUUID,
      customerPhone,
      customerName,
      appointmentDate,
      appointmentTime,
      serviceName,
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
 * GET /api/telephony/call-logs
 * Get call logs for the tenant
 */
const getCallLogs = async (req, res, next) => {
  try {
    const {
      limit,
      offset,
      direction,
      status,
      startDate,
      endDate,
    } = req.query;
    
    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await callHandler.getCallLogs(tenantUUID, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      direction,
      status,
      startDate,
      endDate,
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
 * POST /api/telephony/make-call
 * Initiate an outbound call
 */
const makeCall = async (req, res, next) => {
  try {
    const { to, twimlUrl } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number is required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    // Get tenant's phone number
    const tenant = await Tenant.findOne({
      where: { tenantId: req.tenantId },
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND',
      });
    }
    
    const fromNumber = tenant.metadata?.twilioPhoneNumber || tenant.settings?.twilioPhoneNumber;
    
    if (!fromNumber) {
      return res.status(400).json({
        success: false,
        error: 'No phone number configured for this tenant',
        code: 'NO_PHONE_NUMBER',
      });
    }
    
    const result = await twilioService.makeCall({
      to,
      from: fromNumber,
      url: twimlUrl || `${process.env.APP_BASE_URL}/api/webhooks/twilio/outbound-voice`,
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
 * POST /api/telephony/test-sms
 * Test endpoint for SMS functionality (no auth required)
 * WARNING: This endpoint should be disabled in production or protected with additional security
 */
const testSms = async (req, res, next) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number (to) and message are required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    if (!env.TWILIO_SMS_PHONE_NUMBER) {
      return res.status(503).json({
        success: false,
        error: 'SMS service not configured',
        code: 'SMS_NOT_CONFIGURED',
      });
    }
    
    const result = await twilioService.sendSms({
      to,
      from: env.TWILIO_SMS_PHONE_NUMBER,
      body: message,
    });
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Test SMS sent successfully',
    });
  } catch (error) {
    // Log detailed error for debugging but return generic error to client
    logger.error(`Test SMS failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      code: 'SMS_SEND_FAILED',
    });
  }
};

/**
 * GET /api/telephony/sms/consent/:phone
 * Check SMS consent status for a phone number
 */
const checkSmsConsent = async (req, res) => {
  try {
    const { phone } = req.params;
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant context required',
        code: 'TENANT_REQUIRED',
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        code: 'PHONE_REQUIRED',
      });
    }

    const result = await smsHandler.checkSmsConsent(phone, tenantId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Check SMS consent failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to check SMS consent',
      code: 'CONSENT_CHECK_FAILED',
    });
  }
};

/**
 * POST /api/telephony/sms/consent
 * Record SMS consent for a phone number
 */
const recordSmsConsent = async (req, res) => {
  try {
    const { phoneNumber, consented, source } = req.body;
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant context required',
        code: 'TENANT_REQUIRED',
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        code: 'PHONE_REQUIRED',
      });
    }

    if (typeof consented !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Consented must be a boolean',
        code: 'INVALID_CONSENT_VALUE',
      });
    }

    const result = await smsHandler.recordSmsConsent({
      phoneNumber,
      tenantId,
      consented,
      source: source || 'api',
      metadata: { recordedBy: req.user?.id },
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Record SMS consent failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to record SMS consent',
      code: 'CONSENT_RECORD_FAILED',
    });
  }
};

/**
 * GET /api/telephony/sms/messages/:phone
 * Get SMS conversation history for a phone number
 */
const getSmsConversation = async (req, res) => {
  try {
    const { phone } = req.params;
    const { limit = 100 } = req.query;
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant context required',
        code: 'TENANT_REQUIRED',
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        code: 'PHONE_REQUIRED',
      });
    }

    const result = await smsHandler.getSmsConversation(phone, tenantId, parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Get SMS conversation failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get SMS conversation',
      code: 'CONVERSATION_FETCH_FAILED',
    });
  }
};

module.exports = {
  handleVoiceWebhook,
  handleSmsWebhook,
  handleStatusWebhook,
  provisionNumber,
  releaseNumber,
  sendSms,
  sendEmployeeSms,
  sendAppointmentReminder,
  getCallLogs,
  makeCall,
  testSms,
  checkSmsConsent,
  recordSmsConsent,
  getSmsConversation,
};
