/**
 * Twilio-ElevenLabs Handler
 * Handles the webhook integration between Twilio voice calls and ElevenLabs Conversational AI
 */
const Twilio = require('twilio');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { getElevenLabsService } = require('./elevenlabs.service');
const { Tenant } = require('../tenants/tenant.model');

// Lazy-loaded service references to avoid circular dependencies
let _availabilityService = null;
let _appointmentService = null;
let _serviceService = null;
let _tenantService = null;
let _AppointmentModel = null;

/**
 * Get lazy-loaded services
 */
const getServices = () => {
  if (!_availabilityService) {
    const appointments = require('../appointments');
    _availabilityService = appointments.availabilityService;
    _appointmentService = appointments.appointmentService;
    _AppointmentModel = require('../appointments/appointment.model').Appointment;
  }
  if (!_serviceService) {
    _serviceService = require('../services').serviceService;
  }
  if (!_tenantService) {
    _tenantService = require('../tenants').tenantService;
  }
  return {
    availabilityService: _availabilityService,
    appointmentService: _appointmentService,
    serviceService: _serviceService,
    tenantService: _tenantService,
    Appointment: _AppointmentModel,
  };
};

/**
 * Find tenant by phone number
 * @param {string} phoneNumber - Phone number to look up
 * @returns {Promise<Object|null>} - Tenant or null
 */
const findTenantByPhoneNumber = async (phoneNumber) => {
  try {
    const normalizedNumber = phoneNumber.replace(/[^0-9+]/g, '');
    
    // First, try to find all active tenants and check for matching twilio_phone_number
    // We need to normalize both sides of the comparison since stored values may have formatting
    const activeTenants = await Tenant.findAll({
      where: { status: 'active' },
    });
    
    if (!activeTenants || activeTenants.length === 0) {
      return null;
    }
    
    // Check twilioPhoneNumber column first (primary lookup)
    for (const tenant of activeTenants) {
      if (tenant.twilioPhoneNumber) {
        const storedNormalized = tenant.twilioPhoneNumber.replace(/[^0-9+]/g, '');
        if (storedNormalized === normalizedNumber) {
          return tenant;
        }
      }
    }
    
    // Fallback: search in metadata/settings for backward compatibility
    for (const tenant of activeTenants) {
      const twilioPhone = tenant.metadata?.twilioPhoneNumber || tenant.settings?.twilioPhoneNumber;
      
      if (twilioPhone && twilioPhone.replace(/[^0-9+]/g, '') === normalizedNumber) {
        return tenant;
      }
    }
    
    return null;
  } catch (error) {
    logger.error(`Error finding tenant by phone number: ${error.message}`);
    return null;
  }
};

/**
 * Build the WebSocket URL for the media stream handler
 * @param {string} baseUrl - Base HTTP/HTTPS URL of the application
 * @param {string} agentId - ElevenLabs agent ID
 * @param {string} tenantId - Tenant identifier
 * @param {string} callSid - Twilio call SID
 * @returns {string} - WebSocket URL for media stream
 */
const buildMediaStreamUrl = (baseUrl, agentId, tenantId, callSid) => {
  const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
  const httpHost = baseUrl.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${httpHost}/media-stream?agent_id=${encodeURIComponent(agentId)}&tenant_id=${encodeURIComponent(tenantId)}&call_sid=${encodeURIComponent(callSid)}`;
};

/**
 * Generate TwiML to connect Twilio call to ElevenLabs Conversational AI
 * Uses the application's WebSocket server as a bridge between Twilio and ElevenLabs
 * @param {Object} params - Connection parameters
 * @param {string} params.mediaStreamUrl - WebSocket URL for the application's media stream handler
 * @param {string} params.agentId - ElevenLabs agent ID
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.callSid - Twilio call SID
 * @param {Object} params.customParameters - Additional parameters to pass to the stream
 * @returns {string} - TwiML XML string
 */
const generateElevenLabsConnectTwiml = ({ mediaStreamUrl, agentId, tenantId, callSid, customParameters = {} }) => {
  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  // Create the Connect verb with Stream to the application's WebSocket server
  // The application's WebSocket server will bridge to ElevenLabs
  const connect = response.connect();
  
  // Add stream to the application's media stream WebSocket handler
  const stream = connect.stream({
    url: mediaStreamUrl,
    name: 'ElevenLabsStream',
  });
  
  // Add custom parameters that will be forwarded to ElevenLabs
  stream.parameter({ name: 'agent_id', value: agentId });
  stream.parameter({ name: 'tenant_id', value: tenantId });
  stream.parameter({ name: 'call_sid', value: callSid });
  
  // Add any additional custom parameters
  for (const [key, value] of Object.entries(customParameters)) {
    if (value !== undefined && value !== null) {
      stream.parameter({ name: key, value: String(value) });
    }
  }
  
  return response.toString();
};

/**
 * Handle incoming Twilio voice call and connect to ElevenLabs
 * @param {Object} params - Twilio webhook parameters
 * @param {string} hostUrl - The host URL for WebSocket connection (optional, defaults to APP_BASE_URL)
 * @returns {Promise<Object>} - Processing result with TwiML
 */
const handleTwilioToElevenLabs = async (params, hostUrl = null) => {
  const {
    CallSid,
    From,
    To,
    CallStatus,
  } = params;
  
  logger.info(`Twilio-ElevenLabs: Incoming call ${CallSid} from ${From} to ${To}`);
  
  try {
    // Find tenant by the called phone number
    const tenant = await findTenantByPhoneNumber(To);
    
    if (!tenant) {
      logger.warn(`Twilio-ElevenLabs: No tenant found for phone number: ${To}`);
      return {
        success: false,
        twiml: generateErrorTwiml('This number is not in service. Please check the number and try again.'),
      };
    }
    
    // Get ElevenLabs service and check configuration
    const elevenlabsService = getElevenLabsService();
    const isAvailable = await elevenlabsService.isAvailable();
    
    if (!isAvailable) {
      logger.warn(`Twilio-ElevenLabs: ElevenLabs not configured for tenant: ${tenant.tenantId}`);
      return {
        success: false,
        twiml: generateErrorTwiml('Our AI assistant is temporarily unavailable. Please try again later.'),
      };
    }
    
    // Get the agent ID - use tenant-specific agent if configured, otherwise use default
    const agentId = tenant.settings?.elevenLabsAgentId || tenant.metadata?.elevenLabsAgentId || env.ELEVENLABS_AGENT_ID;
    
    if (!agentId) {
      logger.error(`Twilio-ElevenLabs: No agent ID configured for tenant: ${tenant.tenantId}`);
      return {
        success: false,
        twiml: generateErrorTwiml('Our AI assistant is not properly configured. Please contact support.'),
      };
    }
    
    // Build the WebSocket URL for the application's media stream handler
    // The media stream handler will bridge between Twilio and ElevenLabs
    const baseUrl = hostUrl || env.APP_BASE_URL;
    const mediaStreamUrl = buildMediaStreamUrl(baseUrl, agentId, tenant.tenantId, CallSid);
    
    // Prepare custom parameters for context
    // Include tenant_id and tenant_name for ElevenLabs webhook callbacks
    const customParameters = {
      tenant_id: tenant.tenantId,
      tenant_name: tenant.name || 'Our Business',
      business_name: tenant.name || 'Our Business',
      caller_number: From,
      call_status: CallStatus,
    };
    
    // Add business hours if available
    if (tenant.settings?.businessHours) {
      customParameters.business_hours = JSON.stringify(tenant.settings.businessHours);
    }
    
    // Generate TwiML to connect to the application's media stream WebSocket
    // The media stream handler will bridge to ElevenLabs
    const twiml = generateElevenLabsConnectTwiml({
      mediaStreamUrl,
      agentId,
      tenantId: tenant.tenantId,
      callSid: CallSid,
      customParameters,
    });
    
    logger.info(`Twilio-ElevenLabs: Connected call ${CallSid} to ElevenLabs agent ${agentId} for tenant ${tenant.tenantId}`);
    
    return {
      success: true,
      tenantId: tenant.tenantId,
      agentId,
      callSid: CallSid,
      twiml,
    };
  } catch (error) {
    logger.error(`Twilio-ElevenLabs: Error handling call ${CallSid}: ${error.message}`);
    return {
      success: false,
      twiml: generateErrorTwiml('We encountered an error. Please try again later.'),
    };
  }
};

/**
 * Generate error TwiML response
 * @param {string} message - Error message to speak
 * @returns {string} - TwiML XML string
 */
const generateErrorTwiml = (message) => {
  const VoiceResponse = Twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  response.say({
    voice: 'Polly.Joanna',
    language: 'en-US',
  }, message);
  
  response.hangup();
  
  return response.toString();
};

/**
 * Handle ElevenLabs tool call for tenant data
 * This is called when ElevenLabs agent needs to interact with tenant services
 * @param {Object} toolData - Tool call data from ElevenLabs
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Tool result
 */
const handleElevenLabsToolCall = async (toolData, tenantId) => {
  const { tool_name, parameters } = toolData;
  
  logger.info(`ElevenLabs tool call: ${tool_name} for tenant: ${tenantId}`);
  
  // Get lazy-loaded services to avoid circular dependencies
  const { availabilityService, appointmentService, serviceService, tenantService, Appointment } = getServices();
  
  try {
    switch (tool_name) {
      case 'check_availability':
      case 'get_availability': {
        const queryDate = parameters.date ? new Date(parameters.date) : getNextBusinessDay();
        const availability = await availabilityService.getAvailabilityForDate(
          tenantId,
          queryDate,
          parameters.serviceId
        );
        return { 
          success: true, 
          availability,
          message: formatAvailabilityResponse(availability),
        };
      }
      
      case 'book_appointment':
      case 'create_appointment': {
        const appointment = await appointmentService.createAppointment(parameters, tenantId);
        return { 
          success: true, 
          appointment: appointment.toSafeObject ? appointment.toSafeObject() : appointment,
          message: `Appointment booked successfully for ${parameters.customerName}`,
        };
      }
      
      case 'cancel_appointment': {
        const appointment = await appointmentService.cancelAppointment(
          parameters.appointmentId,
          tenantId,
          parameters.reason || 'customer_request',
          parameters.notes
        );
        return { 
          success: true, 
          appointment: appointment.toSafeObject ? appointment.toSafeObject() : appointment,
          message: 'Appointment cancelled successfully',
        };
      }
      
      case 'get_services':
      case 'list_services': {
        const result = await serviceService.getServices(tenantId, { 
          status: 'active',
          limit: parameters.limit || 50,
        });
        return { 
          success: true, 
          services: result.services.map(s => s.toSafeObject ? s.toSafeObject() : s),
          message: formatServicesResponse(result.services),
        };
      }
      
      case 'get_service_details': {
        const service = await serviceService.getServiceById(parameters.serviceId, tenantId);
        return { 
          success: true, 
          service: service.toSafeObject ? service.toSafeObject() : service,
        };
      }
      
      case 'get_hours':
      case 'get_business_hours': {
        const tenant = await tenantService.getTenantById(tenantId);
        const hours = tenant?.settings?.businessHours || getDefaultBusinessHours();
        return { 
          success: true, 
          hours,
          timezone: tenant?.settings?.timezone || 'UTC',
          message: formatBusinessHoursResponse(hours),
        };
      }
      
      case 'get_tenant_info': {
        const tenant = await tenantService.getTenantById(tenantId);
        return {
          success: true,
          tenant: {
            name: tenant?.name,
            businessHours: tenant?.settings?.businessHours,
            timezone: tenant?.settings?.timezone,
          },
        };
      }
      
      case 'find_appointment': {
        // Find appointment by customer phone or email
        const where = { tenantId };
        
        if (parameters.customerPhone) {
          where.customerPhone = parameters.customerPhone;
        }
        if (parameters.customerEmail) {
          where.customerEmail = parameters.customerEmail;
        }
        
        const appointments = await Appointment.findAll({
          where,
          order: [['startTime', 'DESC']],
          limit: parameters.limit || 5,
        });
        
        return {
          success: true,
          appointments: appointments.map(a => a.toSafeObject ? a.toSafeObject() : a),
          count: appointments.length,
        };
      }
      
      default:
        logger.warn(`Unknown ElevenLabs tool: ${tool_name}`);
        return { 
          success: false, 
          error: `Unknown tool: ${tool_name}`,
        };
    }
  } catch (error) {
    logger.error(`ElevenLabs tool call error: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get next business day
 * @returns {Date} - Next business day
 */
const getNextBusinessDay = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
};

/**
 * Get default business hours
 * @returns {Object} - Default business hours
 */
const getDefaultBusinessHours = () => ({
  monday: { open: '09:00', close: '17:00', enabled: true },
  tuesday: { open: '09:00', close: '17:00', enabled: true },
  wednesday: { open: '09:00', close: '17:00', enabled: true },
  thursday: { open: '09:00', close: '17:00', enabled: true },
  friday: { open: '09:00', close: '17:00', enabled: true },
  saturday: { open: '10:00', close: '14:00', enabled: false },
  sunday: { open: '10:00', close: '14:00', enabled: false },
});

/**
 * Format availability response for voice
 * @param {Object} availability - Availability data
 * @returns {string} - Formatted response
 */
const formatAvailabilityResponse = (availability) => {
  if (!availability || !availability.slots || availability.slots.length === 0) {
    return 'I don\'t see any available time slots for that date. Would you like to check another date?';
  }
  
  const count = availability.slots.length;
  return `I found ${count} available time slot${count > 1 ? 's' : ''}. Would you like me to list them for you?`;
};

/**
 * Format services response for voice
 * @param {Array} services - Services list
 * @returns {string} - Formatted response
 */
const formatServicesResponse = (services) => {
  if (!services || services.length === 0) {
    return 'We currently don\'t have any services available.';
  }
  
  const serviceNames = services.slice(0, 5).map(s => s.name).join(', ');
  const more = services.length > 5 ? ` and ${services.length - 5} more` : '';
  return `We offer: ${serviceNames}${more}. Which service would you like to book?`;
};

/**
 * Format business hours response for voice
 * @param {Object} hours - Business hours
 * @returns {string} - Formatted response
 */
const formatBusinessHoursResponse = (hours) => {
  if (!hours) {
    return 'I don\'t have business hours information available.';
  }
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const openDays = days.filter(day => hours[day]?.enabled);
  
  if (openDays.length === 0) {
    return 'Business hours are not currently available.';
  }
  
  // Check if weekdays have same hours
  const weekdayHours = hours.monday;
  const weekdaysSame = ['tuesday', 'wednesday', 'thursday', 'friday'].every(
    day => hours[day]?.enabled === weekdayHours?.enabled &&
           hours[day]?.open === weekdayHours?.open &&
           hours[day]?.close === weekdayHours?.close
  );
  
  if (weekdaysSame && weekdayHours?.enabled) {
    let response = `We're open Monday through Friday from ${weekdayHours.open} to ${weekdayHours.close}`;
    
    if (hours.saturday?.enabled) {
      response += `, Saturday from ${hours.saturday.open} to ${hours.saturday.close}`;
    }
    if (hours.sunday?.enabled) {
      response += `, and Sunday from ${hours.sunday.open} to ${hours.sunday.close}`;
    }
    
    return response + '.';
  }
  
  return 'Our hours vary by day. Would you like me to tell you about a specific day?';
};

module.exports = {
  handleTwilioToElevenLabs,
  handleElevenLabsToolCall,
  generateElevenLabsConnectTwiml,
  generateErrorTwiml,
  findTenantByPhoneNumber,
  buildMediaStreamUrl,
  formatAvailabilityResponse,
  formatServicesResponse,
  formatBusinessHoursResponse,
};
