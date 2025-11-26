/**
 * Call Handler
 * Handles incoming call webhooks from Twilio
 */
const twilioService = require('./twilio.service');
const { CallLog, CALL_DIRECTION, CALL_STATUS } = require('./callLog.model');
const { Tenant } = require('../tenants/tenant.model');
const logger = require('../../utils/logger');

/**
 * Handle incoming voice call webhook
 * @param {Object} params - Twilio webhook parameters
 * @returns {Promise<Object>} - Processing result with TwiML
 */
const handleIncomingCall = async (params) => {
  const {
    CallSid,
    From,
    To,
    CallStatus,
    Direction,
  } = params;
  
  logger.info(`Incoming call: ${CallSid} from ${From} to ${To}`);
  
  try {
    // Find tenant by phone number
    const tenant = await findTenantByPhoneNumber(To);
    
    if (!tenant) {
      logger.warn(`No tenant found for phone number: ${To}`);
      return {
        success: false,
        twiml: twilioService.generateVoiceResponse(
          'We\'re sorry, this number is not in service. Please check the number and try again.'
        ),
      };
    }
    
    // Create call log entry
    const callLog = await CallLog.create({
      tenantId: tenant.tenantId,
      twilioCallSid: CallSid,
      direction: CALL_DIRECTION.INBOUND,
      status: CallStatus || CALL_STATUS.INITIATED,
      fromNumber: From,
      toNumber: To,
      startedAt: new Date(),
      metadata: {
        direction: Direction,
        originalParams: params,
      },
    });
    
    logger.info(`Call log created: ${callLog.id} for tenant: ${tenant.tenantId}`);
    
    // Generate TwiML to forward to AI (business hours check could be added here)
    const welcomeMessage = getWelcomeMessage(tenant);
    const twiml = twilioService.generateVoiceResponse(welcomeMessage, { hangup: false });
    
    return {
      success: true,
      callLogId: callLog.id,
      tenantId: tenant.tenantId,
      twiml,
    };
  } catch (error) {
    logger.error(`Error handling incoming call: ${error.message}`);
    
    return {
      success: false,
      twiml: twilioService.generateVoiceResponse(
        'We\'re experiencing technical difficulties. Please try again later.'
      ),
    };
  }
};

/**
 * Handle call status callback webhook
 * @param {Object} params - Twilio status callback parameters
 * @returns {Promise<Object>} - Processing result
 */
const handleCallStatus = async (params) => {
  const {
    CallSid,
    CallStatus,
    CallDuration,
    RecordingUrl,
  } = params;
  
  logger.info(`Call status update: ${CallSid} - ${CallStatus}`);
  
  try {
    const callLog = await CallLog.findOne({
      where: { twilioCallSid: CallSid },
    });
    
    if (!callLog) {
      logger.warn(`Call log not found for CallSid: ${CallSid}`);
      return { success: false, message: 'Call log not found' };
    }
    
    // Update call log with status
    await callLog.updateFromTwilio({
      CallStatus,
      CallDuration,
      RecordingUrl,
    });
    
    // Set end time if call is completed
    if (['completed', 'busy', 'no-answer', 'canceled', 'failed'].includes(CallStatus)) {
      callLog.endedAt = new Date();
      await callLog.save();
    }
    
    logger.info(`Call log updated: ${callLog.id} status: ${CallStatus}`);
    
    return {
      success: true,
      callLogId: callLog.id,
      status: CallStatus,
    };
  } catch (error) {
    logger.error(`Error handling call status: ${error.message}`);
    throw error;
  }
};

/**
 * Find tenant by their Twilio phone number
 * @param {string} phoneNumber - Phone number to look up
 * @returns {Promise<Object|null>} - Tenant or null
 */
const findTenantByPhoneNumber = async (phoneNumber) => {
  try {
    // Phone numbers are stored in tenant settings or metadata
    const tenant = await Tenant.findOne({
      where: {
        status: 'active',
      },
    });
    
    if (!tenant) {
      return null;
    }
    
    // Check if tenant has this phone number configured
    const twilioPhone = tenant.metadata?.twilioPhoneNumber || tenant.settings?.twilioPhoneNumber;
    
    if (twilioPhone && normalizePhoneNumber(twilioPhone) === normalizePhoneNumber(phoneNumber)) {
      return tenant;
    }
    
    // For demo/development: return first active tenant
    // In production, this should be more strict
    return tenant;
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
 * Get welcome message for tenant
 * @param {Object} tenant - Tenant object
 * @returns {string} - Welcome message
 */
const getWelcomeMessage = (tenant) => {
  const businessName = tenant.name || 'our business';
  return `Thank you for calling ${businessName}. Please hold while we connect you with our AI assistant.`;
};

/**
 * Get call logs for a tenant
 * @param {string} tenantId - Tenant identifier
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Call logs
 */
const getCallLogs = async (tenantId, options = {}) => {
  const {
    limit = 50,
    offset = 0,
    direction,
    status,
    startDate,
    endDate,
  } = options;
  
  const where = { tenantId };
  
  if (direction) {
    where.direction = direction;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (startDate || endDate) {
    const { Op } = require('sequelize');
    where.createdAt = {};
    if (startDate) {
      where.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      where.createdAt[Op.lte] = new Date(endDate);
    }
  }
  
  const callLogs = await CallLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  
  return {
    logs: callLogs.rows.map(log => log.toSafeObject()),
    total: callLogs.count,
    limit,
    offset,
  };
};

module.exports = {
  handleIncomingCall,
  handleCallStatus,
  findTenantByPhoneNumber,
  getCallLogs,
};
