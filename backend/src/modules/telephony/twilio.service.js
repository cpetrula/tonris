/**
 * Twilio Service
 * Handles all direct interactions with the Twilio API
 */
const Twilio = require('twilio');
const env = require('../../config/env');
const logger = require('../../utils/logger');

// Initialize Twilio client with credentials (for voice/telephony)
const twilioClient = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  ? new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;

// Initialize Twilio SMS client with separate credentials
const twilioSmsClient = env.TWILIO_SMS_ACCOUNT_SID && env.TWILIO_SMS_AUTH_TOKEN
  ? new Twilio(env.TWILIO_SMS_ACCOUNT_SID, env.TWILIO_SMS_AUTH_TOKEN)
  : null;

/**
 * Verify Twilio is configured
 * @throws {Error} If Twilio is not configured
 */
const ensureTwilioConfigured = () => {
  if (!twilioClient) {
    throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
  }
};

/**
 * Extract area code from a phone number
 * Handles US/Canada phone numbers in various formats
 * @param {string} phoneNumber - Phone number to parse
 * @returns {string|null} - Area code (3 digits) or null if not found
 */
const extractAreaCode = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // US/Canada numbers are 10 digits (without country code) or 11 digits (with country code 1)
  if (digits.length === 10) {
    // First 3 digits are the area code
    return digits.substring(0, 3);
  } else if (digits.length === 11 && digits[0] === '1') {
    // Remove country code and get first 3 digits
    return digits.substring(1, 4);
  }
  
  return null;
};

/**
 * Provision a new phone number for a tenant with geographic preference
 * @param {Object} params - Provisioning parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.areaCode - Preferred area code (optional)
 * @param {string} params.country - Country code (default: US)
 * @returns {Promise<Object>} - Provisioned phone number details
 */
const provisionPhoneNumber = async ({ tenantId, areaCode, country = 'US' }) => {
  ensureTwilioConfigured();
  
  try {
    let availableNumbers = [];
    
    // Try to find a number with the preferred area code first
    if (areaCode) {
      logger.info(`Searching for phone number with area code: ${areaCode}`);
      try {
        availableNumbers = await twilioClient.availablePhoneNumbers(country)
          .local
          .list({
            voiceEnabled: true,
            smsEnabled: true,
            areaCode: areaCode,
          });
        
        if (availableNumbers.length > 0) {
          logger.info(`Found ${availableNumbers.length} numbers with area code ${areaCode}`);
        }
      } catch (error) {
        logger.warn(`Failed to search with area code ${areaCode}: ${error.message}`);
      }
    }
    
    // If no numbers found with preferred area code, search without restriction
    if (availableNumbers.length === 0) {
      logger.info('Searching for any available phone number');
      availableNumbers = await twilioClient.availablePhoneNumbers(country)
        .local
        .list({
          voiceEnabled: true,
          smsEnabled: true,
        });
    }
    
    if (availableNumbers.length === 0) {
      throw new Error('No available phone numbers found');
    }
    
    // Purchase the first available number
    const phoneNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: availableNumbers[0].phoneNumber,
      voiceUrl: `${env.APP_BASE_URL}/api/webhooks/twilio/voice`,
      voiceMethod: 'POST',
      smsUrl: `${env.APP_BASE_URL}/api/webhooks/twilio/sms`,
      smsMethod: 'POST',
      statusCallback: `${env.APP_BASE_URL}/api/webhooks/twilio/status`,
      statusCallbackMethod: 'POST',
    });
    
    logger.info(`Phone number provisioned: ${phoneNumber.phoneNumber} for tenant: ${tenantId}`);
    
    return {
      phoneNumber: phoneNumber.phoneNumber,
      sid: phoneNumber.sid,
      friendlyName: phoneNumber.friendlyName,
      capabilities: phoneNumber.capabilities,
    };
  } catch (error) {
    logger.error(`Failed to provision phone number: ${error.message}`);
    throw error;
  }
};

/**
 * Update webhook URLs for an existing phone number
 * @param {string} phoneNumberSid - Twilio phone number SID
 * @param {Object} urls - Webhook URLs to update
 * @returns {Promise<Object>} - Updated phone number details
 */
const updatePhoneNumberWebhooks = async (phoneNumberSid, urls) => {
  ensureTwilioConfigured();
  
  try {
    const updateParams = {};
    
    if (urls.voiceUrl) {
      updateParams.voiceUrl = urls.voiceUrl;
      updateParams.voiceMethod = 'POST';
    }
    if (urls.smsUrl) {
      updateParams.smsUrl = urls.smsUrl;
      updateParams.smsMethod = 'POST';
    }
    if (urls.statusCallback) {
      updateParams.statusCallback = urls.statusCallback;
      updateParams.statusCallbackMethod = 'POST';
    }
    
    const phoneNumber = await twilioClient.incomingPhoneNumbers(phoneNumberSid)
      .update(updateParams);
    
    logger.info(`Phone number webhooks updated: ${phoneNumber.phoneNumber}`);
    return phoneNumber;
  } catch (error) {
    logger.error(`Failed to update phone number webhooks: ${error.message}`);
    throw error;
  }
};

/**
 * Release (delete) a phone number
 * @param {string} phoneNumberSid - Twilio phone number SID
 * @returns {Promise<boolean>} - True if successful
 */
const releasePhoneNumber = async (phoneNumberSid) => {
  ensureTwilioConfigured();
  
  try {
    await twilioClient.incomingPhoneNumbers(phoneNumberSid).remove();
    logger.info(`Phone number released: ${phoneNumberSid}`);
    return true;
  } catch (error) {
    logger.error(`Failed to release phone number: ${error.message}`);
    throw error;
  }
};

/**
 * Send an SMS message
 * @param {Object} params - SMS parameters
 * @param {string} params.to - Recipient phone number
 * @param {string} params.from - Sender phone number (Twilio number)
 * @param {string} params.body - Message content
 * @param {string} params.statusCallback - Optional status callback URL
 * @returns {Promise<Object>} - Sent message details
 */
const sendSms = async ({ to, from, body, statusCallback }) => {
  // Use SMS-specific client for SMS operations
  if (!twilioSmsClient) {
    throw new Error('Twilio SMS is not configured. Please set TWILIO_SMS_ACCOUNT_SID and TWILIO_SMS_AUTH_TOKEN environment variables.');
  }
  
  try {
    const messageParams = {
      to,
      from,
      body,
    };
    
    if (statusCallback) {
      messageParams.statusCallback = statusCallback;
    }
    
    const message = await twilioSmsClient.messages.create(messageParams);
    
    logger.info(`SMS sent: ${message.sid} to ${to}`);
    
    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateSent: message.dateSent,
    };
  } catch (error) {
    logger.error(`Failed to send SMS: ${error.message}`);
    throw error;
  }
};

/**
 * Make an outbound call
 * @param {Object} params - Call parameters
 * @param {string} params.to - Recipient phone number
 * @param {string} params.from - Caller phone number (Twilio number)
 * @param {string} params.url - TwiML URL for call handling
 * @param {string} params.statusCallback - Optional status callback URL
 * @returns {Promise<Object>} - Call details
 */
const makeCall = async ({ to, from, url, statusCallback }) => {
  ensureTwilioConfigured();
  
  try {
    const callParams = {
      to,
      from,
      url,
    };
    
    if (statusCallback) {
      callParams.statusCallback = statusCallback;
      callParams.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
      callParams.statusCallbackMethod = 'POST';
    }
    
    const call = await twilioClient.calls.create(callParams);
    
    logger.info(`Outbound call initiated: ${call.sid} to ${to}`);
    
    return {
      sid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from,
      direction: call.direction,
    };
  } catch (error) {
    logger.error(`Failed to make call: ${error.message}`);
    throw error;
  }
};

/**
 * Get call details
 * @param {string} callSid - Twilio call SID
 * @returns {Promise<Object>} - Call details
 */
const getCall = async (callSid) => {
  ensureTwilioConfigured();
  
  try {
    const call = await twilioClient.calls(callSid).fetch();
    return call;
  } catch (error) {
    logger.error(`Failed to get call: ${error.message}`);
    throw error;
  }
};

/**
 * Validate Twilio webhook request signature
 * @param {string} signature - X-Twilio-Signature header
 * @param {string} url - Full URL of the webhook endpoint
 * @param {Object} params - Request body parameters
 * @param {string} type - Type of webhook ('voice' or 'sms'), defaults to 'voice'
 * @returns {boolean} - True if signature is valid
 */
const validateWebhookSignature = (signature, url, params, type = 'voice') => {
  // Use appropriate auth token based on webhook type
  const authToken = type === 'sms' ? env.TWILIO_SMS_AUTH_TOKEN : env.TWILIO_AUTH_TOKEN;
  
  if (!authToken) {
    logger.warn(`Twilio ${type} auth token not configured, skipping signature validation`);
    return true;
  }
  
  return Twilio.validateRequest(
    authToken,
    signature,
    url,
    params
  );
};

/**
 * Generate TwiML for forwarding a call to AI
 * @param {Object} params - TwiML parameters
 * @param {string} params.message - Optional welcome message
 * @param {string} params.aiWebhookUrl - URL to forward AI response (required)
 * @returns {string} - TwiML XML string
 * @throws {Error} If aiWebhookUrl is not provided
 */
const generateForwardToAiTwiml = ({ message, aiWebhookUrl }) => {
  if (!aiWebhookUrl) {
    throw new Error('aiWebhookUrl is required for AI forwarding');
  }
  
  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  if (message) {
    response.say({ voice: 'alice' }, message);
  }
  
  // Redirect to AI webhook for further processing
  response.redirect({ method: 'POST' }, aiWebhookUrl);
  
  return response.toString();
};

/**
 * Generate TwiML for a simple voice response
 * @param {string} message - Message to speak
 * @param {Object} options - Voice options
 * @returns {string} - TwiML XML string
 */
const generateVoiceResponse = (message, options = {}) => {
  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  response.say({
    voice: options.voice || 'alice',
    language: options.language || 'en-US',
  }, message);
  
  if (options.hangup !== false) {
    response.hangup();
  }
  
  return response.toString();
};

/**
 * Generate TwiML for SMS response
 * @param {string} message - Message to send
 * @returns {string} - TwiML XML string
 */
const generateSmsResponse = (message) => {
  const MessagingResponse = Twilio.twiml.MessagingResponse;
  const response = new MessagingResponse();
  
  response.message(message);
  
  return response.toString();
};

/**
 * Look up phone number by incoming call number
 * @param {string} phoneNumber - Phone number to look up
 * @returns {Promise<Object|null>} - Incoming phone number details
 */
const getIncomingPhoneNumber = async (phoneNumber) => {
  ensureTwilioConfigured();
  
  try {
    const numbers = await twilioClient.incomingPhoneNumbers
      .list({ phoneNumber });
    
    return numbers.length > 0 ? numbers[0] : null;
  } catch (error) {
    logger.error(`Failed to lookup incoming phone number: ${error.message}`);
    throw error;
  }
};

module.exports = {
  provisionPhoneNumber,
  updatePhoneNumberWebhooks,
  releasePhoneNumber,
  sendSms,
  makeCall,
  getCall,
  validateWebhookSignature,
  generateForwardToAiTwiml,
  generateVoiceResponse,
  generateSmsResponse,
  getIncomingPhoneNumber,
  extractAreaCode,
};
