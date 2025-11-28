/**
 * Intent Handler
 * Handles detected intents and executes appropriate actions
 */
const logger = require('../../utils/logger');
const { INTENT_TYPES, ACTION_TYPES } = require('./ai-provider.interface');
const { appointmentService, availabilityService } = require('../appointments');
const { serviceService } = require('../services');
const { tenantService } = require('../tenants');

/**
 * Handle detected intent and perform appropriate action
 * @param {Object} intent - Detected intent
 * @param {Object} context - Conversation context
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Action result
 */
const handleIntent = async (intent, context, tenantId) => {
  logger.info(`Handling intent: ${intent.name} for tenant: ${tenantId}`);

  try {
    switch (intent.name) {
      case INTENT_TYPES.CHECK_AVAILABILITY:
        return await handleCheckAvailability(intent.entities, tenantId);
      
      case INTENT_TYPES.BOOK_APPOINTMENT:
        return await handleBookAppointment(intent.entities, context, tenantId);
      
      case INTENT_TYPES.CANCEL_APPOINTMENT:
        return await handleCancelAppointment(intent.entities, tenantId);
      
      case INTENT_TYPES.MODIFY_APPOINTMENT:
        return await handleModifyAppointment(intent.entities, tenantId);
      
      case INTENT_TYPES.GET_SERVICES:
        return await handleGetServices(tenantId);
      
      case INTENT_TYPES.GET_HOURS:
        return await handleGetHours(tenantId);
      
      case INTENT_TYPES.HUMAN_HANDOFF:
        return handleHumanHandoff(context);
      
      case INTENT_TYPES.GREETING:
        return handleGreeting(context, tenantId);
      
      case INTENT_TYPES.GOODBYE:
        return handleGoodbye(context);
      
      case INTENT_TYPES.GENERAL_INQUIRY:
      default:
        return handleGeneralInquiry(intent, context);
    }
  } catch (error) {
    logger.error(`Intent handler error: ${error.message}`);
    return {
      success: false,
      action: ACTION_TYPES.CONTINUE_CONVERSATION,
      message: "I'm sorry, I encountered an issue processing your request. Let me try to help you another way.",
      error: error.message,
    };
  }
};

/**
 * Handle check availability intent
 * @param {Object} entities - Extracted entities (date, service, etc.)
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Availability result
 */
const handleCheckAvailability = async (entities, tenantId) => {
  try {
    // Parse date from entities or default to tomorrow
    const date = parseDate(entities.date) || getNextBusinessDay();
    
    // If serviceId is provided, get availability for that service
    if (entities.serviceId) {
      const availability = await availabilityService.getAvailabilityForDate(
        tenantId,
        date,
        entities.serviceId
      );
      
      return {
        success: true,
        action: ACTION_TYPES.QUERY_AVAILABILITY,
        data: { availability, date: date.toISOString() },
        message: formatAvailabilityResponse(availability, date),
      };
    }
    
    // Otherwise, return general message
    return {
      success: true,
      action: ACTION_TYPES.QUERY_AVAILABILITY,
      data: { date: date.toISOString() },
      message: "To check availability, I'll need to know which service you're interested in. What would you like to book?",
      needsMoreInfo: true,
      required: ['serviceId'],
    };
  } catch (error) {
    logger.error(`Check availability error: ${error.message}`);
    throw error;
  }
};

/**
 * Handle book appointment intent
 * @param {Object} entities - Extracted entities
 * @param {Object} context - Conversation context
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Booking result
 */
const handleBookAppointment = async (entities, context, tenantId) => {
  const required = [];
  
  if (!entities.serviceId) required.push('serviceId');
  if (!entities.employeeId) required.push('employeeId');
  if (!entities.startTime) required.push('startTime');
  if (!entities.customerName) required.push('customerName');
  if (!entities.customerPhone && !entities.customerEmail) {
    required.push('customerPhone or customerEmail');
  }
  
  if (required.length > 0) {
    return {
      success: false,
      action: ACTION_TYPES.CREATE_APPOINTMENT,
      message: generateMissingInfoMessage(required),
      needsMoreInfo: true,
      required,
      collected: entities,
    };
  }
  
  try {
    const appointment = await appointmentService.createAppointment({
      employeeId: entities.employeeId,
      serviceId: entities.serviceId,
      customerName: entities.customerName,
      customerEmail: entities.customerEmail,
      customerPhone: entities.customerPhone,
      startTime: entities.startTime,
      notes: entities.notes || `Booked via AI assistant - Session: ${context.sessionId}`,
    }, tenantId);
    
    return {
      success: true,
      action: ACTION_TYPES.CREATE_APPOINTMENT,
      data: { appointment },
      message: formatAppointmentConfirmation(appointment),
    };
  } catch (error) {
    if (error.code === 'TIME_SLOT_CONFLICT') {
      return {
        success: false,
        action: ACTION_TYPES.CREATE_APPOINTMENT,
        message: "I'm sorry, that time slot is no longer available. Would you like me to suggest some alternative times?",
        error: error.code,
      };
    }
    throw error;
  }
};

/**
 * Handle cancel appointment intent
 * @param {Object} entities - Extracted entities
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Cancellation result
 */
const handleCancelAppointment = async (entities, tenantId) => {
  if (!entities.appointmentId && !entities.customerPhone && !entities.customerEmail) {
    return {
      success: false,
      action: ACTION_TYPES.CANCEL_APPOINTMENT,
      message: "To cancel an appointment, I'll need either your appointment ID, phone number, or email address. Could you provide one of those?",
      needsMoreInfo: true,
      required: ['appointmentId or customerPhone or customerEmail'],
    };
  }
  
  try {
    // If we have appointmentId, cancel directly
    if (entities.appointmentId) {
      const result = await appointmentService.cancelAppointment(
        entities.appointmentId,
        tenantId,
        'customer_request',
        'Cancelled via AI assistant'
      );
      
      return {
        success: true,
        action: ACTION_TYPES.CANCEL_APPOINTMENT,
        data: { appointment: result },
        message: "Your appointment has been cancelled successfully. Is there anything else I can help you with?",
      };
    }
    
    // Otherwise, we need to look up the appointment first
    return {
      success: false,
      action: ACTION_TYPES.CANCEL_APPOINTMENT,
      message: "I found your information. Let me look up your upcoming appointments. One moment please.",
      needsLookup: true,
      lookupBy: entities.customerPhone ? 'phone' : 'email',
      lookupValue: entities.customerPhone || entities.customerEmail,
    };
  } catch (error) {
    if (error.code === 'APPOINTMENT_NOT_FOUND') {
      return {
        success: false,
        action: ACTION_TYPES.CANCEL_APPOINTMENT,
        message: "I couldn't find an appointment with that information. Could you double-check the details?",
        error: error.code,
      };
    }
    throw error;
  }
};

/**
 * Handle modify appointment intent
 * @param {Object} entities - Extracted entities
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Modification result
 */
const handleModifyAppointment = async (entities, tenantId) => {
  if (!entities.appointmentId) {
    return {
      success: false,
      action: ACTION_TYPES.UPDATE_APPOINTMENT,
      message: "To modify an appointment, I'll need to find it first. Could you provide your phone number or email?",
      needsMoreInfo: true,
      required: ['appointmentId or customerPhone or customerEmail'],
    };
  }
  
  const updateData = {};
  if (entities.newStartTime) updateData.startTime = entities.newStartTime;
  if (entities.newEmployeeId) updateData.employeeId = entities.newEmployeeId;
  if (entities.notes) updateData.notes = entities.notes;
  
  const appointment = await appointmentService.updateAppointment(
    entities.appointmentId,
    tenantId,
    updateData
  );
  
  return {
    success: true,
    action: ACTION_TYPES.UPDATE_APPOINTMENT,
    data: { appointment },
    message: formatAppointmentUpdateConfirmation(appointment),
  };
};

/**
 * Handle get services intent
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Services result
 */
const handleGetServices = async (tenantId) => {
  try {
    const result = await serviceService.getServices(tenantId, { status: 'active' });
    
    return {
      success: true,
      action: ACTION_TYPES.GET_SERVICES,
      data: { services: result.services, total: result.total },
      message: formatServicesResponse(result.services),
    };
  } catch (error) {
    logger.error(`Get services error: ${error.message}`);
    throw error;
  }
};

/**
 * Handle get business hours intent
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Business hours result
 */
const handleGetHours = async (tenantId) => {
  try {
    const tenant = await tenantService.getTenantById(tenantId);
    const hours = tenant?.settings?.businessHours || getDefaultBusinessHours();
    
    return {
      success: true,
      action: ACTION_TYPES.GET_BUSINESS_HOURS,
      data: { hours },
      message: formatBusinessHoursResponse(hours),
    };
  } catch (error) {
    logger.error(`Get hours error: ${error.message}`);
    // Return default hours if tenant lookup fails
    const hours = getDefaultBusinessHours();
    return {
      success: true,
      action: ACTION_TYPES.GET_BUSINESS_HOURS,
      data: { hours },
      message: formatBusinessHoursResponse(hours),
    };
  }
};

/**
 * Handle human handoff intent
 * @param {Object} context - Conversation context
 * @returns {Object} - Handoff result
 */
const handleHumanHandoff = (context) => {
  return {
    success: true,
    action: ACTION_TYPES.TRANSFER_TO_HUMAN,
    message: "I'll connect you with a team member right away. Please hold while I transfer your call.",
    shouldHandoff: true,
    sessionId: context.sessionId,
  };
};

/**
 * Handle greeting intent
 * @param {Object} _context - Conversation context (unused)
 * @param {string} _tenantId - Tenant identifier (unused)
 * @returns {Object} - Greeting result
 */
const handleGreeting = (_context, _tenantId) => {
  return {
    success: true,
    action: ACTION_TYPES.CONTINUE_CONVERSATION,
    message: "Hello! Thank you for calling. How can I help you today? I can assist with booking appointments, checking availability, or answering questions about our services.",
  };
};

/**
 * Handle goodbye intent
 * @param {Object} context - Conversation context
 * @returns {Object} - Goodbye result
 */
const handleGoodbye = (context) => {
  return {
    success: true,
    action: ACTION_TYPES.END_CONVERSATION,
    message: "Thank you for calling! Have a great day. Goodbye!",
    shouldEndConversation: true,
    sessionId: context.sessionId,
  };
};

/**
 * Handle general inquiry intent
 * @param {Object} _intent - Detected intent (unused)
 * @param {Object} _context - Conversation context (unused)
 * @returns {Object} - Inquiry result
 */
const handleGeneralInquiry = (_intent, _context) => {
  return {
    success: true,
    action: ACTION_TYPES.CONTINUE_CONVERSATION,
    message: "I'm here to help! I can assist you with booking appointments, checking availability, getting information about our services, or answering questions about business hours. What would you like to do?",
  };
};

// Helper functions

/**
 * Parse date string to Date object
 * @param {string} dateStr - Date string
 * @returns {Date|null} - Parsed date or null
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  const normalized = dateStr.toLowerCase();
  const now = new Date();
  
  if (normalized === 'today') {
    return now;
  }
  
  if (normalized === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // Handle "next monday", "next tuesday", etc.
  const dayMatch = normalized.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (dayMatch) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayMatch[1].toLowerCase());
    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + daysToAdd);
    return nextDay;
  }
  
  // Try to parse standard date formats
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  return null;
};

/**
 * Get next business day
 * @returns {Date} - Next business day
 */
const getNextBusinessDay = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  
  // Skip weekends
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
 * Generate message for missing information
 * @param {Array} required - Required fields
 * @returns {string} - Message
 */
const generateMissingInfoMessage = (required) => {
  if (required.includes('serviceId')) {
    return "To book an appointment, I'll need to know which service you're interested in. What service would you like?";
  }
  if (required.includes('startTime')) {
    return "Great! What date and time would work best for you?";
  }
  if (required.includes('customerName')) {
    return "Could you please provide your name for the booking?";
  }
  if (required.includes('customerPhone or customerEmail')) {
    return "And finally, what's the best phone number or email to reach you at?";
  }
  return "I need a bit more information to complete your booking. Could you provide more details?";
};

/**
 * Format availability response
 * @param {Array} availability - Availability data
 * @param {Date} date - Date
 * @returns {string} - Formatted response
 */
const formatAvailabilityResponse = (availability, date) => {
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const availableEmployees = availability.filter(a => a.isAvailable);
  if (availableEmployees.length === 0) {
    return `Unfortunately, we don't have any availability on ${dateStr}. Would you like me to check another day?`;
  }
  
  const slotCount = availableEmployees.reduce((sum, a) => sum + a.availableSlots.length, 0);
  return `We have ${slotCount} time slots available on ${dateStr}. Would you like me to list them for you?`;
};

/**
 * Format appointment confirmation
 * @param {Object} appointment - Appointment data
 * @returns {string} - Formatted confirmation
 */
const formatAppointmentConfirmation = (appointment) => {
  const date = new Date(appointment.startTime);
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  return `Your appointment has been confirmed for ${dateStr} at ${timeStr}. You'll receive a confirmation message shortly. Is there anything else I can help you with?`;
};

/**
 * Format appointment update confirmation
 * @param {Object} appointment - Updated appointment
 * @returns {string} - Formatted confirmation
 */
const formatAppointmentUpdateConfirmation = (appointment) => {
  const date = new Date(appointment.startTime);
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  return `Your appointment has been updated to ${dateStr} at ${timeStr}. Is there anything else I can help you with?`;
};

/**
 * Format services response
 * @param {Array} services - Services list
 * @returns {string} - Formatted response
 */
const formatServicesResponse = (services) => {
  if (!services || services.length === 0) {
    return "I don't have our service menu available right now. Would you like me to transfer you to someone who can help?";
  }
  
  const serviceList = services.slice(0, 5).map(s => 
    `${s.name} - $${s.price} (${s.duration} minutes)`
  ).join(', ');
  
  if (services.length > 5) {
    return `Here are some of our services: ${serviceList}, and more. Which one interests you?`;
  }
  
  return `Here are our services: ${serviceList}. Which one would you like to book?`;
};

/**
 * Format business hours response
 * @param {Object} hours - Business hours
 * @returns {string} - Formatted response
 */
const formatBusinessHoursResponse = (hours) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const openDays = days.filter(day => hours[day]?.enabled);
  
  if (openDays.length === 0) {
    return "I don't have our hours available right now. Would you like me to transfer you to someone who can help?";
  }
  
  // Check if weekdays have same hours
  const weekdayHours = days.slice(0, 5)
    .filter(day => hours[day]?.enabled)
    .map(day => `${hours[day].open}-${hours[day].close}`)
    .join(',');
  
  const uniqueWeekdayHours = [...new Set(weekdayHours.split(','))];
  
  if (uniqueWeekdayHours.length === 1) {
    const [open, close] = uniqueWeekdayHours[0].split('-');
    let response = `We're open Monday through Friday from ${formatTime(open)} to ${formatTime(close)}`;
    
    if (hours.saturday?.enabled) {
      response += `, and Saturday from ${formatTime(hours.saturday.open)} to ${formatTime(hours.saturday.close)}`;
    }
    
    return response + '. How can I help you?';
  }
  
  return "Our hours vary by day. Would you like me to give you the details for a specific day?";
};

/**
 * Format time string
 * @param {string} time - Time in HH:MM format
 * @returns {string} - Formatted time
 */
const formatTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return minutes > 0 ? `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}` : `${displayHours} ${period}`;
};

module.exports = {
  handleIntent,
  handleCheckAvailability,
  handleBookAppointment,
  handleCancelAppointment,
  handleModifyAppointment,
  handleGetServices,
  handleGetHours,
  handleHumanHandoff,
  handleGreeting,
  handleGoodbye,
  handleGeneralInquiry,
  parseDate,
  getNextBusinessDay,
  formatAvailabilityResponse,
  formatServicesResponse,
  formatBusinessHoursResponse,
};
