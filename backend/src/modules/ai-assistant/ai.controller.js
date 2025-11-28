/**
 * AI Controller
 * Handles HTTP requests for AI assistant endpoints
 */
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const { getElevenLabsService } = require('./elevenlabs.service');
const { getOpenAIService } = require('./openai.service');
const { handleIntent } = require('./intent.handler');
const { availabilityService } = require('../appointments');
const { appointmentService, CANCELLATION_REASONS } = require('../appointments');
const { serviceService } = require('../services');
const { tenantService } = require('../tenants');

/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid UUID
 */
const isValidUUID = (id) => UUID_REGEX.test(id);

/**
 * POST /api/ai/availability
 * Query availability for AI assistant
 */
const queryAvailability = async (req, res, next) => {
  try {
    const { serviceId, date, startDate, endDate, employeeId } = req.body;

    // Validate required fields
    if (!serviceId) {
      throw new AppError('Service ID is required', 400, 'VALIDATION_ERROR');
    }

    if (!isValidUUID(serviceId)) {
      throw new AppError('Invalid service ID format', 400, 'VALIDATION_ERROR');
    }

    if (employeeId && !isValidUUID(employeeId)) {
      throw new AppError('Invalid employee ID format', 400, 'VALIDATION_ERROR');
    }

    let availability;

    if (startDate && endDate) {
      // Date range query
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError('Invalid date format', 400, 'VALIDATION_ERROR');
      }

      if (start > end) {
        throw new AppError('Start date must be before end date', 400, 'VALIDATION_ERROR');
      }

      availability = await availabilityService.getAvailabilityForDateRange(
        req.tenantId,
        start,
        end,
        serviceId,
        employeeId
      );
    } else {
      // Single date query (default to tomorrow if not specified)
      const queryDate = date ? new Date(date) : getNextBusinessDay();
      
      if (isNaN(queryDate.getTime())) {
        throw new AppError('Invalid date format', 400, 'VALIDATION_ERROR');
      }

      const employeeIds = employeeId ? [employeeId] : null;
      availability = await availabilityService.getAvailabilityForDate(
        req.tenantId,
        queryDate,
        serviceId,
        employeeIds
      );
    }

    res.status(200).json({
      success: true,
      data: {
        availability,
        serviceId,
        queryDate: date || (startDate && endDate ? { startDate, endDate } : new Date().toISOString()),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/appointments
 * Create, update, or cancel appointments via AI
 */
const manageAppointment = async (req, res, next) => {
  try {
    const {
      action,
      appointmentId,
      employeeId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      startTime,
      addOns,
      notes,
      cancellationReason,
    } = req.body;

    // Validate action
    const validActions = ['create', 'update', 'cancel', 'get'];
    if (!action || !validActions.includes(action)) {
      throw new AppError(
        `Invalid action. Must be one of: ${validActions.join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
    }

    let result;

    switch (action) {
      case 'create': {
        // Validate required fields for creation
        if (!employeeId || !serviceId || !customerName || !startTime) {
          throw new AppError(
            'employeeId, serviceId, customerName, and startTime are required for appointment creation',
            400,
            'VALIDATION_ERROR'
          );
        }

        if (!customerEmail && !customerPhone) {
          throw new AppError(
            'Either customerEmail or customerPhone is required',
            400,
            'VALIDATION_ERROR'
          );
        }

        if (!isValidUUID(employeeId)) {
          throw new AppError('Invalid employee ID format', 400, 'VALIDATION_ERROR');
        }

        if (!isValidUUID(serviceId)) {
          throw new AppError('Invalid service ID format', 400, 'VALIDATION_ERROR');
        }

        // Validate start time is in the future
        const appointmentStart = new Date(startTime);
        if (isNaN(appointmentStart.getTime())) {
          throw new AppError('Invalid startTime format', 400, 'VALIDATION_ERROR');
        }

        if (appointmentStart <= new Date()) {
          throw new AppError('Appointment time must be in the future', 400, 'VALIDATION_ERROR');
        }

        // Validate email format if provided
        if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
          throw new AppError('Invalid email format', 400, 'VALIDATION_ERROR');
        }

        result = await appointmentService.createAppointment({
          employeeId,
          serviceId,
          customerName,
          customerEmail,
          customerPhone,
          startTime,
          addOns,
          notes: notes || 'Created via AI assistant',
        }, req.tenantId);

        logger.info(`AI created appointment: ${result.id} for tenant: ${req.tenantId}`);
        
        return res.status(201).json({
          success: true,
          data: {
            appointment: result,
            action: 'create',
          },
          message: 'Appointment created successfully',
        });
      }

      case 'update': {
        if (!appointmentId) {
          throw new AppError('appointmentId is required for update', 400, 'VALIDATION_ERROR');
        }

        if (!isValidUUID(appointmentId)) {
          throw new AppError('Invalid appointment ID format', 400, 'VALIDATION_ERROR');
        }

        const updateData = {};
        if (employeeId) {
          if (!isValidUUID(employeeId)) {
            throw new AppError('Invalid employee ID format', 400, 'VALIDATION_ERROR');
          }
          updateData.employeeId = employeeId;
        }
        if (startTime) {
          const newStart = new Date(startTime);
          if (isNaN(newStart.getTime())) {
            throw new AppError('Invalid startTime format', 400, 'VALIDATION_ERROR');
          }
          if (newStart <= new Date()) {
            throw new AppError('Appointment time must be in the future', 400, 'VALIDATION_ERROR');
          }
          updateData.startTime = startTime;
        }
        if (addOns) updateData.addOns = addOns;
        if (notes) updateData.notes = notes;
        if (customerName) updateData.customerName = customerName;
        if (customerEmail) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
            throw new AppError('Invalid email format', 400, 'VALIDATION_ERROR');
          }
          updateData.customerEmail = customerEmail;
        }
        if (customerPhone) updateData.customerPhone = customerPhone;

        result = await appointmentService.updateAppointment(
          appointmentId,
          req.tenantId,
          updateData
        );

        logger.info(`AI updated appointment: ${appointmentId} for tenant: ${req.tenantId}`);
        
        return res.status(200).json({
          success: true,
          data: {
            appointment: result,
            action: 'update',
          },
          message: 'Appointment updated successfully',
        });
      }

      case 'cancel': {
        if (!appointmentId) {
          throw new AppError('appointmentId is required for cancellation', 400, 'VALIDATION_ERROR');
        }

        if (!isValidUUID(appointmentId)) {
          throw new AppError('Invalid appointment ID format', 400, 'VALIDATION_ERROR');
        }

        const reason = cancellationReason || CANCELLATION_REASONS.CUSTOMER_REQUEST;
        if (!Object.values(CANCELLATION_REASONS).includes(reason)) {
          throw new AppError(
            `Invalid cancellation reason. Must be one of: ${Object.values(CANCELLATION_REASONS).join(', ')}`,
            400,
            'VALIDATION_ERROR'
          );
        }

        result = await appointmentService.cancelAppointment(
          appointmentId,
          req.tenantId,
          reason,
          notes || 'Cancelled via AI assistant'
        );

        logger.info(`AI cancelled appointment: ${appointmentId} for tenant: ${req.tenantId}`);
        
        return res.status(200).json({
          success: true,
          data: {
            appointment: result,
            action: 'cancel',
          },
          message: 'Appointment cancelled successfully',
        });
      }

      case 'get': {
        if (!appointmentId) {
          throw new AppError('appointmentId is required', 400, 'VALIDATION_ERROR');
        }

        if (!isValidUUID(appointmentId)) {
          throw new AppError('Invalid appointment ID format', 400, 'VALIDATION_ERROR');
        }

        result = await appointmentService.getAppointmentById(appointmentId, req.tenantId);
        
        return res.status(200).json({
          success: true,
          data: {
            appointment: result,
            action: 'get',
          },
        });
      }

      default:
        throw new AppError('Invalid action', 400, 'VALIDATION_ERROR');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/services
 * Get services information for AI assistant
 */
const getServices = async (req, res, next) => {
  try {
    const { category, status, serviceId, limit, offset } = req.body;

    // If specific service requested
    if (serviceId) {
      if (!isValidUUID(serviceId)) {
        throw new AppError('Invalid service ID format', 400, 'VALIDATION_ERROR');
      }

      const service = await serviceService.getServiceById(serviceId, req.tenantId);
      
      return res.status(200).json({
        success: true,
        data: {
          service,
          total: 1,
        },
      });
    }

    // Get all services with optional filters
    const result = await serviceService.getServices(req.tenantId, {
      status: status || 'active',
      category,
      limit: limit || 100,
      offset: offset || 0,
    });

    res.status(200).json({
      success: true,
      data: {
        services: result.services,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/hours
 * Get business hours for AI assistant
 */
const getBusinessHours = async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.tenantId);
    
    const hours = tenant?.settings?.businessHours || {
      monday: { open: '09:00', close: '17:00', enabled: true },
      tuesday: { open: '09:00', close: '17:00', enabled: true },
      wednesday: { open: '09:00', close: '17:00', enabled: true },
      thursday: { open: '09:00', close: '17:00', enabled: true },
      friday: { open: '09:00', close: '17:00', enabled: true },
      saturday: { open: '10:00', close: '14:00', enabled: false },
      sunday: { open: '10:00', close: '14:00', enabled: false },
    };

    res.status(200).json({
      success: true,
      data: {
        businessHours: hours,
        timezone: tenant?.settings?.timezone || 'UTC',
        businessName: tenant?.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/conversation
 * Process conversation input through AI
 */
const processConversation = async (req, res, next) => {
  try {
    const { input, sessionId, provider, tenantConfig } = req.body;

    if (!input) {
      throw new AppError('Input is required', 400, 'VALIDATION_ERROR');
    }

    // Select AI provider
    const aiProvider = provider === 'openai' 
      ? getOpenAIService()
      : getElevenLabsService();

    // Check if provider is available
    const isAvailable = await aiProvider.isAvailable();
    if (!isAvailable) {
      logger.warn(`AI provider ${aiProvider.getName()} is not configured`);
    }

    // Start or continue session
    let context;
    if (sessionId && aiProvider.sessions?.has(sessionId)) {
      context = aiProvider.sessions.get(sessionId);
    } else {
      context = await aiProvider.startSession(req.tenantId, { tenantConfig });
    }

    // Process input
    const aiResponse = await aiProvider.processInput(input, context);

    // Handle the detected intent
    const intentResult = await handleIntent(aiResponse.intent, context, req.tenantId);

    res.status(200).json({
      success: true,
      data: {
        sessionId: context.sessionId,
        response: aiResponse.text,
        intent: aiResponse.intent,
        action: aiResponse.action,
        intentResult,
        shouldHandoff: aiResponse.shouldHandoff,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/webhook/elevenlabs
 * Handle ElevenLabs Agent webhooks
 */
const handleElevenLabsWebhook = async (req, res, next) => {
  try {
    const { event, data, agentId, sessionId } = req.body;

    logger.info(`ElevenLabs webhook received: event=${event}, agentId=${agentId}`);

    // Handle different webhook events
    switch (event) {
      case 'conversation_started':
        logger.info(`ElevenLabs conversation started: ${sessionId}`);
        break;
      
      case 'conversation_ended':
        logger.info(`ElevenLabs conversation ended: ${sessionId}`);
        break;
      
      case 'tool_call': {
        // Handle tool calls from ElevenLabs Agent
        const toolResult = await handleElevenLabsToolCall(data, req.tenantId);
        return res.status(200).json({
          success: true,
          data: toolResult,
        });
      }
      
      default:
        logger.info(`Unhandled ElevenLabs event: ${event}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`ElevenLabs webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * Handle tool calls from ElevenLabs Agent
 * @param {Object} toolData - Tool call data
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} - Tool result
 */
const handleElevenLabsToolCall = async (toolData, tenantId) => {
  const { tool_name, parameters } = toolData;

  if (tool_name === 'check_availability') {
    const availability = await availabilityService.getAvailabilityForDate(
      tenantId,
      new Date(parameters.date || Date.now()),
      parameters.serviceId
    );
    return { availability };
  }
  
  if (tool_name === 'book_appointment') {
    const appointment = await appointmentService.createAppointment(parameters, tenantId);
    return { appointment };
  }
  
  if (tool_name === 'get_services') {
    const services = await serviceService.getServices(tenantId, { status: 'active' });
    return { services: services.services };
  }
  
  if (tool_name === 'get_hours') {
    const tenant = await tenantService.getTenantById(tenantId);
    return { hours: tenant?.settings?.businessHours };
  }

  return { error: `Unknown tool: ${tool_name}` };
};

/**
 * GET /api/ai/config
 * Get AI configuration for tenant
 */
const getAIConfig = async (req, res, next) => {
  try {
    const tenant = await tenantService.getTenantById(req.tenantId);
    
    const elevenlabsService = getElevenLabsService();
    const openaiService = getOpenAIService();

    res.status(200).json({
      success: true,
      data: {
        providers: {
          elevenlabs: {
            available: await elevenlabsService.isAvailable(),
            name: elevenlabsService.getName(),
          },
          openai: {
            available: await openaiService.isAvailable(),
            name: openaiService.getName(),
          },
        },
        tenantConfig: {
          businessName: tenant?.name,
          greeting: tenant?.settings?.aiGreeting || 'Hello! Thank you for calling.',
          tone: tenant?.settings?.aiTone || 'professional and friendly',
          businessHours: tenant?.settings?.businessHours,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions

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

module.exports = {
  queryAvailability,
  manageAppointment,
  getServices,
  getBusinessHours,
  processConversation,
  handleElevenLabsWebhook,
  getAIConfig,
};
