/**
 * AI Controller
 * Handles HTTP requests for AI assistant endpoints
 */
const crypto = require('crypto');
const { AppError } = require('../../middleware/errorHandler');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { getElevenLabsService } = require('./elevenlabs.service');
const { getOpenAIService } = require('./openai.service');
const { handleIntent } = require('./intent.handler');
const { handleTwilioToElevenLabs, handleElevenLabsToolCall: handleToolCall, handleConversationInitiation } = require('./twilio-elevenlabs.handler');
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
        query: {
          type: startDate && endDate ? 'range' : 'single',
          date: date || null,
          startDate: startDate || null,
          endDate: endDate || null,
        },
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
        // Handle tool calls from ElevenLabs Agent using the new handler
        const toolResult = await handleToolCall(data, req.tenantId);
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
 * POST /api/webhooks/twilio/elevenlabs
 * Handle incoming Twilio voice call and connect to ElevenLabs Conversational AI
 */
const handleTwilioElevenLabsWebhook = async (req, res, next) => {
  try {
    // Build the host URL from the request for WebSocket connection
    const protocol = req.protocol;
    const host = req.get('host');
    const hostUrl = `${protocol}://${host}`;
    
    const result = await handleTwilioToElevenLabs(req.body, hostUrl);
    
    // Return TwiML response
    res.type('text/xml');
    res.send(result.twiml);
  } catch (error) {
    logger.error(`Twilio-ElevenLabs webhook error: ${error.message}`);
    next(error);
  }
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

/**
 * Verify ElevenLabs webhook signature
 * @param {string} payload - Raw request body as string
 * @param {string} signature - Signature from X-ElevenLabs-Signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} - True if signature is valid
 */
const verifyElevenLabsSignature = (payload, signature, secret) => {
  if (!secret || !signature) {
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
};

/**
 * POST /api/webhooks/elevenlabs/conversation-initiation
 * Handle ElevenLabs Conversation Initiation Client Data webhook
 * 
 * This webhook is called by ElevenLabs when a new Twilio phone call or SIP trunk
 * call conversation begins. It allows providing dynamic conversation configuration
 * and variables based on the call data.
 * 
 * Headers:
 * - X-ElevenLabs-Signature: HMAC-SHA256 signature of the request body (required in production)
 * 
 * Request body (from ElevenLabs):
 * {
 *   "type": "conversation_initiation_client_data",
 *   "conversation_id": "unique-conversation-id",
 *   "agent_id": "elevenlabs-agent-id",
 *   "dynamic_variables": {
 *     "tenant_id": "tenant-id",
 *     "caller_number": "+15551234567",
 *     "call_sid": "CA12345...",
 *     "business_name": "My Business"
 *   }
 * }
 * 
 * Response:
 * {
 *   "dynamic_variables": {
 *     "tenant_id": "...",
 *     "business_name": "...",
 *     ...
 *   },
 *   "conversation_config_override": {
 *     "agent": {
 *       "agent_output_audio_format": "ulaw_8000",
 *       "user_input_audio_format": "ulaw_8000",
 *       ...
 *     }
 *   }
 * }
 */
const handleConversationInitiationWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature in production
    const signature = req.headers['x-elevenlabs-signature'];
    const webhookSecret = env.ELEVENLABS_WEBHOOK_SECRET;
    
    if (env.isProduction() && webhookSecret) {
      // Need to use raw body for signature verification
      const rawBody = req.rawBody || JSON.stringify(req.body);
      
      if (!verifyElevenLabsSignature(rawBody, signature, webhookSecret)) {
        logger.warn('ElevenLabs Conversation Initiation: Invalid signature');
        throw new AppError('Invalid webhook signature', 401, 'UNAUTHORIZED');
      }
    } else if (env.isProduction() && !webhookSecret) {
      logger.warn('ElevenLabs Conversation Initiation: Webhook secret not configured');
    }
    
    // Validate request type
    if (req.body.type && req.body.type !== 'conversation_initiation_client_data') {
      logger.warn(`ElevenLabs Conversation Initiation: Unexpected type ${req.body.type}`);
      return res.status(200).json({
        dynamic_variables: {},
        conversation_config_override: {},
      });
    }
    
    // Process the conversation initiation request
    const result = await handleConversationInitiation(req.body);
    
    // Return the configuration directly (not wrapped in success/data)
    // ElevenLabs expects the response format: { dynamic_variables, conversation_config_override }
    res.status(200).json(result.data);
  } catch (error) {
    logger.error(`ElevenLabs Conversation Initiation webhook error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  queryAvailability,
  manageAppointment,
  getServices,
  getBusinessHours,
  processConversation,
  handleElevenLabsWebhook,
  handleTwilioElevenLabsWebhook,
  handleConversationInitiationWebhook,
  getAIConfig,
};
