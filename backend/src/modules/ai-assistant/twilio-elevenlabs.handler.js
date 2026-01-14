/**
 * Twilio-ElevenLabs Handler
 * Handles the webhook integration between Twilio voice calls and ElevenLabs Conversational AI
 */
const Twilio = require('twilio');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { getElevenLabsService } = require('./elevenlabs.service');
const { Tenant } = require('../tenants/tenant.model');
const { BusinessType } = require('../business-types/businessType.model');
const { CallLog, CALL_DIRECTION, CALL_STATUS } = require('../telephony/callLog.model');
const { ElevenLabsVoice } = require('../voices/elevenlabsVoice.model');

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
 * Format time from 24h to 12h for voice
 * @param {string} time24 - Time in 24h format (e.g., "09:00")
 * @returns {string} - Time in 12h format (e.g., "9am")
 */
const formatTimeForVoice = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const hours12 = hours % 12 || 12;
  return minutes === 0 ? `${hours12}${period}` : `${hours12}:${minutes.toString().padStart(2, '0')}${period}`;
};

/**
 * Format business hours for voice/AI consumption
 * @param {Object} businessHours - Business hours object from tenant settings
 * @returns {string} - Human-readable business hours string
 */
const formatBusinessHoursForVoice = (businessHours) => {
  if (!businessHours) return 'Hours not set';

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Group consecutive days with same hours
  const groups = [];
  let currentGroup = null;

  days.forEach((day, index) => {
    const hours = businessHours[day];
    const isEnabled = hours?.enabled === true;
    const open = hours?.open || '09:00';
    const close = hours?.close || '17:00';
    const key = isEnabled ? `${open}-${close}` : 'closed';

    if (currentGroup && currentGroup.key === key) {
      currentGroup.endDay = dayNames[index];
      currentGroup.endIndex = index;
    } else {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = {
        startDay: dayNames[index],
        endDay: dayNames[index],
        startIndex: index,
        endIndex: index,
        key,
        open,
        close,
        isEnabled,
      };
    }
  });
  if (currentGroup) groups.push(currentGroup);

  // Format each group
  const parts = groups.map((g) => {
    const dayRange =
      g.startDay === g.endDay ? g.startDay : `${g.startDay} through ${g.endDay}`;

    if (!g.isEnabled) return `closed ${dayRange}`;

    const openTime = formatTimeForVoice(g.open);
    const closeTime = formatTimeForVoice(g.close);
    return `${dayRange} ${openTime} to ${closeTime}`;
  });

  return parts.join(', ');
};

/**
 * Get today's hours for voice
 * @param {Object} businessHours - Business hours object from tenant settings
 * @param {string} timezone - Timezone to use (default: America/Los_Angeles)
 * @returns {string} - Today's hours string (e.g., "Today we're open 9am to 5pm")
 */
const getTodayHours = (businessHours, timezone = 'America/Los_Angeles') => {
  if (!businessHours) return "Hours not set";

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();

  // Get current day in the specified timezone
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }).toLowerCase();
  const todayHours = businessHours[dayName];

  if (!todayHours || todayHours.enabled !== true) {
    return "We're closed today";
  }

  const openTime = formatTimeForVoice(todayHours.open);
  const closeTime = formatTimeForVoice(todayHours.close);
  return `Today we're open ${openTime} to ${closeTime}`;
};

/**
 * Format address for voice
 * @param {Object} address - Address object
 * @returns {string} - Human-readable address string
 */
const formatAddressForVoice = (address) => {
  if (!address) return '';

  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);

  return parts.join(', ');
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
          // Reload tenant to ensure we have the freshest data from the database
          // This is important for dynamic variables that may have been updated since the last call
          await tenant.reload();
          return tenant;
        }
      }
    }

    // Fallback: search in metadata/settings for backward compatibility
    for (const tenant of activeTenants) {
      const twilioPhone = tenant.metadata?.twilioPhoneNumber || tenant.settings?.twilioPhoneNumber;

      if (twilioPhone && twilioPhone.replace(/[^0-9+]/g, '') === normalizedNumber) {
        // Reload tenant to ensure we have the freshest data
        await tenant.reload();
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
 * Get agent ID for a tenant based on their business type
 * @param {Object} tenant - Tenant object
 * @returns {Promise<string|null>} - Agent ID or null
 */
const getAgentIdForTenant = async (tenant) => {
  try {
    // First, check if tenant has a business_type_id
    if (tenant.businessTypeId) {
      // Look up the business type to get the agent_id
      const businessType = await BusinessType.findByPk(tenant.businessTypeId);
      
      if (businessType && businessType.active) {
        logger.info(`Using agent ID from business type ${businessType.businessType} for tenant ${tenant.id}`);
        return businessType.agentId;
      } else if (businessType && !businessType.active) {
        logger.warn(`Business type ${businessType.businessType} is not active for tenant ${tenant.id}`);
      } else {
        logger.warn(`Business type not found for business_type_id ${tenant.businessTypeId} for tenant ${tenant.id}`);
      }
    }
    
    // Use tenant-specific agent ID from metadata
    const agentId = tenant.metadata?.elevenLabsAgentId;
    
    if (agentId) {
      logger.info(`Using tenant-specific agent ID for tenant ${tenant.id}`);
      return agentId;
    }
    
    logger.warn(`No agent ID found for tenant ${tenant.id}`);
    return null;
  } catch (error) {
    logger.error(`Error getting agent ID for tenant ${tenant.id}: ${error.message}`);
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
    
    // Create call log entry for tracking
    // Check if call log already exists to avoid duplicates (e.g., from retries)
    let callLog = await CallLog.findOne({
      where: { twilioCallSid: CallSid },
    });
    
    if (!callLog) {
      callLog = await CallLog.create({
        tenantId: tenant.id,
        twilioCallSid: CallSid,
        direction: CALL_DIRECTION.INBOUND,
        // Note: Twilio's CallStatus values (queued, ringing, in-progress, etc.) 
        // match our CALL_STATUS enum, so we can use them directly
        status: CallStatus || CALL_STATUS.INITIATED,
        fromNumber: From,
        toNumber: To,
        startedAt: new Date(),
        metadata: {
          direction: params.Direction,
          callStatus: params.CallStatus,
          accountSid: params.AccountSid,
          apiVersion: params.ApiVersion,
          // Store ElevenLabs-specific metadata
          agentId: null, // Will be populated when conversation starts
          elevenLabsConversationId: null, // Will be populated by media-stream.handler.js
        },
      });
      
      logger.info(`Twilio-ElevenLabs: Call log created: ${callLog.id} for tenant: ${tenant.id}`);
    } else {
      logger.info(`Twilio-ElevenLabs: Call log already exists: ${callLog.id}`);
    }
    
    // Get ElevenLabs service and check configuration
    const elevenlabsService = getElevenLabsService();
    const isAvailable = await elevenlabsService.isAvailable();
    
    if (!isAvailable) {
      logger.warn(`Twilio-ElevenLabs: ElevenLabs not configured for tenant: ${tenant.id}`);
      return {
        success: false,
        twiml: generateErrorTwiml('Our AI assistant is temporarily unavailable. Please try again later.'),
      };
    }
    
    // Get the agent ID - use business type agent if configured, otherwise use tenant-specific agent
    const agentId = await getAgentIdForTenant(tenant);
    
    if (!agentId) {
      logger.error(`Twilio-ElevenLabs: No agent ID configured for tenant: ${tenant.id}`);
      return {
        success: false,
        twiml: generateErrorTwiml('Our AI assistant is not properly configured. Please contact support.'),
      };
    }
    
    // Update call log with agent ID now that we have it
    callLog.metadata = {
      ...callLog.metadata,
      agentId,
    };
    await callLog.save();
    
    // Build the WebSocket URL for the application's media stream handler
    // The media stream handler will bridge between Twilio and ElevenLabs
    const baseUrl = hostUrl || env.APP_BASE_URL;
    const mediaStreamUrl = buildMediaStreamUrl(baseUrl, agentId, tenant.id, CallSid);
    
    // Prepare custom parameters for context
    // Include ALL tenant data and metadata for ElevenLabs to use as dynamic variables
    const customParameters = {
      // Core tenant identification (always required)
      tenant_id: tenant.id,
      tenant_name: tenant.name || 'Our Business',
      business_name: tenant.name || 'Our Business',
      
      // Call context
      caller_number: From,
      call_status: CallStatus,
      
      // Contact information
      contact_email: tenant.contactEmail,
      contact_phone: tenant.contactPhone,
      
      // AI assistant settings with fallbacks
      ai_greeting: tenant.metadata?.aiGreeting || `Thanks for calling ${tenant.name || 'our business'}! How can I help you today?`,
      ai_tone: tenant.metadata?.aiTone,
    };
    
    // Add business hours if available
    // Debug: Log the raw businessHours structure to diagnose data flow issues
    logger.debug(`Twilio-ElevenLabs: tenant.businessHours raw value:`, {
      tenantId: tenant.id,
      businessHoursType: typeof tenant.businessHours,
      hasBusinessHours: !!tenant.businessHours,
      hasNestedBusinessHours: !!tenant.businessHours?.businessHours,
      rawValue: JSON.stringify(tenant.businessHours)?.substring(0, 500),
    });

    if (tenant.businessHours?.businessHours) {
      const businessHours = tenant.businessHours.businessHours;
      // Raw JSON for backward compatibility
      customParameters.business_hours = JSON.stringify(businessHours);
      // Human-readable format for AI voice responses
      customParameters.business_hours_voice = formatBusinessHoursForVoice(businessHours);
      // Today's specific hours
      const timezone = tenant.settings?.timezone || 'America/Los_Angeles';
      customParameters.today_hours = getTodayHours(businessHours, timezone);

      // Debug: Log the formatted hours being sent to ElevenLabs
      logger.info(`Twilio-ElevenLabs: Sending business hours to agent - voice: "${customParameters.business_hours_voice}", today: "${customParameters.today_hours}"`);
    } else {
      logger.warn(`Twilio-ElevenLabs: No business hours found for tenant ${tenant.id}`);
    }

    // Add address information if available
    if (tenant.address) {
      try {
        // Flatten address into individual fields for easier use in ElevenLabs
        const address = typeof tenant.address === 'string' ? JSON.parse(tenant.address) : tenant.address;
        if (address && typeof address === 'object') {
          customParameters.address_street = address.street;
          customParameters.address_city = address.city;
          customParameters.address_state = address.state;
          customParameters.address_zip = address.zipCode || address.zip;
          customParameters.address_country = address.country;
          // Also provide full address as JSON string for backward compatibility
          customParameters.address = JSON.stringify(address);
          // Human-readable format for AI voice responses
          customParameters.address_voice = formatAddressForVoice(address);
        }
      } catch (error) {
        logger.warn(`Failed to parse tenant address for tenant ${tenant.id}: ${error.message}`);
      }
    }
    
    // Include ALL metadata fields as dynamic variables
    // This ensures any custom fields added to tenant metadata are available to ElevenLabs
    if (tenant.metadata && typeof tenant.metadata === 'object') {
      try {
        const metadata = typeof tenant.metadata === 'string' ? JSON.parse(tenant.metadata) : tenant.metadata;
        
        if (metadata && typeof metadata === 'object') {
          // Add each metadata field to customParameters
          // Skip fields we've already explicitly set above to avoid conflicts
          const reservedKeys = ['aiGreeting', 'aiTone', 'elevenLabsAgentId', 'twilioPhoneNumber'];
          for (const [key, value] of Object.entries(metadata)) {
            // Skip reserved keys and null/undefined values
            if (!reservedKeys.includes(key) && value !== null && value !== undefined) {
              // Convert objects to JSON strings for ElevenLabs
              if (typeof value === 'object') {
                customParameters[key] = JSON.stringify(value);
              } else {
                customParameters[key] = value;
              }
            }
          }
        }
      } catch (error) {
        logger.warn(`Failed to parse tenant metadata for tenant ${tenant.id}: ${error.message}`);
      }
    }
    
    // Add tenant plan and status for potential use in agent logic
    customParameters.plan_type = tenant.planType;
    customParameters.tenant_status = tenant.status;
    
    // Fetch and add voice information if tenant has a voice configured
    // Note: This performs a separate query. For high-traffic scenarios, consider
    // using a JOIN in the tenant query or implementing caching to optimize performance
    if (tenant.voiceId) {
      try {
        const voice = await ElevenLabsVoice.findByPk(tenant.voiceId);
        if (voice) {
          customParameters.elevenlabs_voice_id = voice.elevenlabsVoiceId;
          logger.info(`Twilio-ElevenLabs: Using voice ${voice.label} (${voice.elevenlabsVoiceId}) for tenant ${tenant.id}`);
        }
      } catch (error) {
        logger.warn(`Failed to fetch voice for tenant ${tenant.id}: ${error.message}`);
      }
    }
    
    // Debug: Log all custom parameters being sent to the stream
    logger.info(`Twilio-ElevenLabs: Custom parameters for call ${CallSid}:`, {
      business_hours_voice: customParameters.business_hours_voice,
      today_hours: customParameters.today_hours,
      paramCount: Object.keys(customParameters).length,
    });

    // Generate TwiML to connect to the application's media stream WebSocket
    // The media stream handler will bridge to ElevenLabs
    const twiml = generateElevenLabsConnectTwiml({
      mediaStreamUrl,
      agentId,
      tenantId: tenant.id,
      callSid: CallSid,
      customParameters,
    });
    
    logger.info(`Twilio-ElevenLabs: Connected call ${CallSid} to ElevenLabs agent ${agentId} for tenant ${tenant.id}`);
    
    return {
      success: true,
      tenantId: tenant.id,
      agentId,
      callSid: CallSid,
      callLogId: callLog.id,
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

/**
 * Handle ElevenLabs Conversation Initiation Client Data webhook
 * This webhook is called by ElevenLabs when a new Twilio phone call or SIP trunk call
 * conversation begins. It allows us to dynamically provide conversation configuration
 * and variables based on the call data.
 * 
 * ElevenLabs sends this request to retrieve dynamic configuration for each conversation.
 * @see https://elevenlabs.io/docs/conversational-ai/customization/conversation-init-client-data
 * 
 * @param {Object} params - Webhook request body from ElevenLabs
 * @param {string} params.type - Always 'conversation_initiation_client_data'
 * @param {string} params.conversation_id - Unique identifier for the conversation
 * @param {string} params.agent_id - The ElevenLabs agent ID handling the conversation
 * @param {Object} params.dynamic_variables - Variables passed from the initial WebSocket connection
 * @returns {Promise<Object>} - Conversation configuration response
 */
const handleConversationInitiation = async (params) => {
  const {
    conversation_id: conversationId,
    agent_id: agentId,
    dynamic_variables: dynamicVariables = {},
  } = params;

  // Extract tenant ID from dynamic variables (set during Twilio connection)
  const tenantId = dynamicVariables.tenant_id;
  const callerNumber = dynamicVariables.caller_number;
  const callSid = dynamicVariables.call_sid;

  logger.info(`ElevenLabs Conversation Initiation: conversation=${conversationId}, agent=${agentId}, tenant=${tenantId}`);

  try {
    // Get lazy-loaded services
    const { tenantService } = getServices();
    
    // Fetch tenant data if tenant ID is available
    let tenant = null;
    let businessName = dynamicVariables.business_name || 'Our Business';
    let businessHours = null;
    let aiTone = null;

    if (tenantId) {
      try {
        tenant = await tenantService.getTenantById(tenantId);
        
        if (tenant) {
          businessName = tenant.name || businessName;
          businessHours = tenant.businessHours?.businessHours || getDefaultBusinessHours();
          aiTone = tenant.metadata?.aiTone;
        }
      } catch (tenantError) {
        // Tenant not found is ok - we'll use defaults
        logger.warn(`ElevenLabs Conversation Initiation: Tenant not found (${tenantId}): ${tenantError.message}`);
      }
    }

    // Build dynamic variables for the conversation
    const responseVariables = {
      tenant_id: tenantId || '',
      tenant_name: businessName,
      business_name: businessName,
      caller_number: callerNumber || '',
      call_sid: callSid || '',
      conversation_id: conversationId,
    };

    // Add business hours as a formatted string for agent context
    if (businessHours) {
      responseVariables.business_hours_summary = formatBusinessHoursResponse(businessHours);
    }

    // Build the response with conversation configuration overrides
    // NOTE: first_message cannot be overridden via this webhook or WebSocket connection.
    // It must be configured in the ElevenLabs agent dashboard, where you can use
    // dynamic variables like {{business_name}} in the greeting message.
    const response = {
      // Dynamic variables that will be available to the agent during the conversation
      dynamic_variables: responseVariables,
      
      // Conversation configuration overrides
      // CRITICAL: Audio format must be set to ulaw_8000 for Twilio compatibility
      // Twilio Media Streams use 8-bit μ-law (mu-law) encoding at 8kHz sample rate
      // Without this configuration, ElevenLabs will output audio in a higher quality format
      // (e.g., pcm_16000 or mp3_44100) which Twilio cannot process, resulting in garbled audio
      //conversation_config_override: {
      overrides: {
        agent: {
          // Audio format must be ulaw_8000 for Twilio compatibility
          agent_output_audio_format: 'ulaw_8000',
          user_input_audio_format: 'ulaw_8000',
          first_message: 'Yo, yo, yo! CP is in the house, ready to rock your world. How can I assist you today?',
          language: 'en',
          output_format: 'ulaw_8000',
        },
        tts: {
          // Ensure TTS output also uses ulaw_8000 format
          output_format: 'ulaw_8000',
        },
        asr: {
          // Ensure ASR (speech recognition) expects ulaw input
          input_format: 'ulaw_8000',
        },
      },
    };

    // NOTE: Greeting and first_message cannot be overridden at runtime.
    // The greeting must be configured in the ElevenLabs agent dashboard.
    // Dynamic variables like business_name are available for use in the dashboard configuration.

    // Add custom prompt if tone is configured
    // Note: The prompt is added as a direct property on the agent object
    //if (aiTone) {
    //  response.conversation_config_override.agent.prompt = `You are a ${aiTone} AI receptionist for ${businessName}. Help callers with booking appointments, checking availability, and answering questions about services and business hours.`;
    //}

    logger.info(`ElevenLabs Conversation Initiation response for tenant=${tenantId}: variables=${Object.keys(responseVariables).join(',')}, audioFormat=ulaw_8000`);

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    logger.error(`ElevenLabs Conversation Initiation error: ${error.message}`);
    
    // Return a minimal response even on error to avoid breaking the conversation
    return {
      success: true,
      data: {
        dynamic_variables: {
          tenant_id: tenantId || '',
          business_name: dynamicVariables.business_name || 'Our Business',
        },
        conversation_config_override: {
          agent: {
            agent_output_audio_format: 'ulaw_8000',
            user_input_audio_format: 'ulaw_8000',
          },
          tts: {
            output_format: 'ulaw_8000',
          },
          asr: {
            input_format: 'ulaw_8000',
          },
        },
      },
    };
  }
};

module.exports = {
  handleTwilioToElevenLabs,
  handleElevenLabsToolCall,
  handleConversationInitiation,
  generateElevenLabsConnectTwiml,
  generateErrorTwiml,
  findTenantByPhoneNumber,
  getAgentIdForTenant,
  buildMediaStreamUrl,
  formatAvailabilityResponse,
  formatServicesResponse,
  formatBusinessHoursResponse,
};
