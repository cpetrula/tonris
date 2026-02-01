/**
 * AI Controller
 * Handles HTTP requests for AI assistant endpoints
 */
const crypto = require('crypto');
const { Op } = require('sequelize');
const { AppError } = require('../../middleware/errorHandler');
const env = require('../../config/env');
const db = require('../../config/db');
const logger = require('../../utils/logger');
const { getElevenLabsService } = require('./elevenlabs.service');
const { getOpenAIService } = require('./openai.service');
const { handleIntent } = require('./intent.handler');
const { handleTwilioToElevenLabs, handleElevenLabsToolCall: handleToolCall, handleConversationInitiation } = require('./twilio-elevenlabs.handler');
const { availabilityService } = require('../appointments');
const { appointmentService, CANCELLATION_REASONS, Appointment, APPOINTMENT_STATUS } = require('../appointments');
const { serviceService, Service } = require('../services');
const { tenantService } = require('../tenants');
const { employeeService, Employee } = require('../employees');
const { CallLog } = require('../telephony/callLog.model');

/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  console.log('ElevenLabs webhook payload:', req.body);
  try {
    // get "name" from "tenant" table where "twilio_phone_number" = req.body.called_number
    const {called_number} = req.body;
    const tenant = await tenantService.getTenantByPhoneNumber(called_number);
    console.log('ElevenLabs webhook tenant:', tenant);
    if (tenant) {
      return res.status(200).json({ 
        "dynamic_variables": {
          "tenant_id": tenant.id,
          "business_name": tenant.name,
        }
      });// Handle different webhook events
    }
    else return res.status(400).json({ success: false, message: 'Tenant not found for called number' });  
  } catch (error) {
    logger.error(`ElevenLabs webhook error: ${error.message}`);
    next(error);
  }
};

const handleElevenLabsWebhook2 = async (req, res, next) => {
  console.log('ElevenLabs webhook payload:', req);
  try {
    // ElevenLabs webhooks use 'type' for event type and nest agent_id inside 'data'
    // Support both 'type' (ElevenLabs standard) and 'event' (legacy/custom) for flexibility
    const { type, event, data = {}, agentId, sessionId, conversation_id: conversationId } = req.body;
    
    // Use 'type' if available (ElevenLabs standard), fall back to 'event' for compatibility
    const eventType = type || event;
    // Agent ID can be at root level or inside data object
    const resolvedAgentId = agentId || data.agent_id;
    // Session/conversation ID can be at root level or inside data object
    const resolvedSessionId = sessionId || conversationId || data.conversation_id;

    logger.info(`ElevenLabs webhook received: event=${eventType}, agentId=${resolvedAgentId}`);

    // Handle different webhook events
    switch (eventType) {
      case 'conversation_started':
        logger.info(`ElevenLabs conversation started: ${resolvedSessionId}`);
        break;
      
      case 'conversation_ended':
        logger.info(`ElevenLabs conversation ended: ${resolvedSessionId}`);
        break;
      
      case 'post_call_transcription':
        logger.info(`ElevenLabs post-call transcription received: ${resolvedSessionId}, status=${data.status}`);
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
        if (eventType) {
          logger.info(`Unhandled ElevenLabs event: ${eventType}`);
        } else {
          logger.warn('ElevenLabs webhook received with no event type');
        }
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
    logger.debug('Signature verification failed: missing secret or signature');
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  logger.debug('Signature verification:', {
    providedSignature: signature.substring(0, 10) + '...',
    expectedSignature: expectedSignature.substring(0, 10) + '...',
    payloadLength: payload.length
  });
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    logger.debug('Signature verification result:', isValid);
    return isValid;
  } catch (error) {
    logger.debug('Signature verification error:', error.message);
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
      // Require raw body for signature verification
      if (!req.rawBody) {
        logger.warn('ElevenLabs Conversation Initiation: Missing raw body for signature verification');
        throw new AppError('Invalid request: missing body', 400, 'INVALID_REQUEST');
      }
      
      if (!verifyElevenLabsSignature(req.rawBody, signature, webhookSecret)) {
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

/**
 * GET /api/webhooks/elevenlabs/services
 * Handle ElevenLabs Client Data webhook to fetch services for a tenant
 * 
 * This endpoint is called by ElevenLabs when it needs to retrieve services
 * for a tenant. It does not require Bearer token authentication since
 * ElevenLabs webhooks don't send authentication headers.
 * 
 * Query Parameters:
 * - tenantId: The tenant identifier (required)
 * 
 * Headers (required in production when webhook secret is configured):
 * - X-ElevenLabs-Signature: HMAC-SHA256 signature of the request
 */
const handleElevenLabsServicesWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature in production
    const signature = req.headers['x-elevenlabs-signature'];
    const webhookSecret = env.ELEVENLABS_WEBHOOK_SECRET;
    
    if (env.isProduction() && webhookSecret && signature) {
      // For GET requests, we need to verify using query string
      const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';

      // Verify signature if provided
      if (!verifyElevenLabsSignature(queryString, signature, webhookSecret)) {
        logger.warn('ElevenLabs Services webhook: Invalid signature');
        throw new AppError('Invalid webhook signature', 401, 'UNAUTHORIZED');
      }
    } else if (env.isProduction() && webhookSecret && !signature) {
      // Log warning but allow request - ElevenLabs data webhooks may not send signatures
      logger.warn('ElevenLabs Services webhook: No signature provided (allowing request)');
    }

    // Get tenant ID from query parameter only (explicit requirement)
    const tenantId = req.query.tenantId;
    
    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400, 'VALIDATION_ERROR');
    }
    
    // Validate tenant ID format
    if (!isValidUUID(tenantId)) {
      throw new AppError('Invalid tenant ID format', 400, 'VALIDATION_ERROR');
    }
    
    logger.info(`ElevenLabs Services webhook: Fetching services for tenant ${tenantId}`);
    
    // Fetch services for the tenant
    const result = await serviceService.getServices(tenantId, {
      status: 'active',
      limit: 100,
    });
    console.log('Fetched services result:', result);

    const data = result.services.map(service => 
      service.toSafeObject ? service.toSafeObject() : {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
      }
    );
    console.log('Fetched services data:', data);
    
    // Return services in the format expected by ElevenLabs
    // Use toSafeObject() if available for consistency
    res.status(200).json({
      success: true,
      data: {
        services_offered: result.services.map(service => 
          service.toSafeObject ? service.toSafeObject() : {
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            category: service.category,
          }
        ),
        message: 'Here are the current services available',
        total: result.total,
        tenantId,
      },
    });
  } catch (error) {
    logger.error(`ElevenLabs Services webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/webhooks/elevenlabs/employees
 * Handle ElevenLabs Client Data webhook to fetch employees for a tenant
 * 
 * This endpoint is called by ElevenLabs when it needs to retrieve employees
 * for a tenant. It does not require Bearer token authentication since
 * ElevenLabs webhooks don't send authentication headers.
 * 
 * Query Parameters:
 * - tenantId: The tenant identifier (required)
 * 
 * Headers (required in production when webhook secret is configured):
 * - X-ElevenLabs-Signature: HMAC-SHA256 signature of the request
 */
const handleElevenLabsEmployeesWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature in production
    const signature = req.headers['x-elevenlabs-signature'];
    const webhookSecret = env.ELEVENLABS_WEBHOOK_SECRET;
    
    if (env.isProduction() && webhookSecret && signature) {
      // For GET requests, we need to verify using query string
      const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';

      // Verify signature if provided
      if (!verifyElevenLabsSignature(queryString, signature, webhookSecret)) {
        logger.warn('ElevenLabs Employees webhook: Invalid signature');
        throw new AppError('Invalid webhook signature', 401, 'UNAUTHORIZED');
      }
    } else if (env.isProduction() && webhookSecret && !signature) {
      // Log warning but allow request - ElevenLabs data webhooks may not send signatures
      logger.warn('ElevenLabs Employees webhook: No signature provided (allowing request)');
    }

    // Get tenant ID from query parameter only (explicit requirement)
    const tenantId = req.query.tenantId;
    
    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400, 'VALIDATION_ERROR');
    }
    
    // Validate tenant ID format
    if (!isValidUUID(tenantId)) {
      throw new AppError('Invalid tenant ID format', 400, 'VALIDATION_ERROR');
    }
    
    logger.info(`ElevenLabs Employees webhook: Fetching employees for tenant ${tenantId}`);
    
    // Fetch employees for the tenant
    const result = await employeeService.getEmployees(tenantId, {
      status: 'active',
      limit: 100,
    });
    
    // Return employees in the format expected by ElevenLabs
    res.status(200).json({
      success: true,
      data: {
        employees: result.employees,
        message: 'Here are the current employees available',
        total: result.total,
        tenantId,
      },
    });
  } catch (error) {
    logger.error(`ElevenLabs Employees webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/webhooks/elevenlabs/check-caller
 * Check if caller is a known client (with appointments) or employee
 *
 * This endpoint is called by the AI after greeting to identify the caller.
 * It combines both client appointment lookup and employee identification
 * into a single call for efficiency.
 *
 * Query Parameters:
 * - tenantId: The tenant identifier (required)
 * - callerPhone: The caller's phone number (required)
 */
const handleCheckCallerWebhook = async (req, res, next) => {
  try {
    const { tenantId, callerPhone } = req.query;

    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400, 'VALIDATION_ERROR');
    }

    if (!callerPhone) {
      throw new AppError('Caller phone is required', 400, 'VALIDATION_ERROR');
    }

    if (!isValidUUID(tenantId)) {
      throw new AppError('Invalid tenant ID format', 400, 'VALIDATION_ERROR');
    }

    logger.info(`Check caller webhook: tenantId=${tenantId}, phone=${callerPhone}`);

    // Get tenant for timezone
    const tenant = await tenantService.getTenantById(tenantId);
    const timezone = tenant?.settings?.timezone || 'America/Los_Angeles';

    // Initialize result
    const result = {
      isEmployee: false,
      employeeInfo: null,
      hasAppointment: false,
      appointments: [],
      callerName: '',
    };

    // Check if caller is an employee
    const employee = await employeeService.findEmployeeByPhone(callerPhone, tenantId);
    if (employee) {
      let schedule = employee.schedule;
      if (typeof schedule === 'string') {
        try {
          schedule = JSON.parse(schedule);
        } catch (e) {
          logger.error('Failed to parse employee schedule:', e);
        }
      }

      result.isEmployee = true;
      result.employeeInfo = {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        firstName: employee.firstName,
        schedule,
      };
      result.callerName = employee.firstName;
    }

    // Check for upcoming appointments (next 7 days)
    const normalizedPhone = callerPhone.replace(/[^0-9+]/g, '');
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { timeZone: timezone });
    const rangeStart = new Date(todayStr);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 7);

    const appointments = await Appointment.findAll({
      where: {
        tenantId,
        customerPhone: {
          [Op.or]: [
            normalizedPhone,
            callerPhone,
            normalizedPhone.replace(/^\+1/, ''),
            normalizedPhone.replace(/^\+/, ''),
          ],
        },
        startTime: {
          [Op.gte]: rangeStart,
          [Op.lt]: rangeEnd,
        },
        status: {
          [Op.in]: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED],
        },
      },
      include: [
        { model: Employee, as: 'employee', attributes: ['firstName', 'lastName'] },
        { model: Service, as: 'service', attributes: ['name'] },
      ],
      order: [['startTime', 'ASC']],
    });

    if (appointments.length > 0) {
      result.hasAppointment = true;
      result.callerName = result.callerName || appointments[0].customerName || '';

      result.appointments = appointments.map(apt => ({
        id: apt.id,
        dateTime: new Date(apt.startTime).toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: timezone,
        }),
        service: apt.service?.name || 'Service',
        stylist: apt.employee ? `${apt.employee.firstName} ${apt.employee.lastName}` : 'Staff',
        customerName: apt.customerName,
        status: apt.status,
      }));
    }

    logger.info(`Check caller result: isEmployee=${result.isEmployee}, hasAppointment=${result.hasAppointment}, name=${result.callerName}`);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Check caller webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/webhooks/elevenlabs/appointments
 * Handle ElevenLabs Client Data webhook to fetch appointments for a tenant
 * 
 * This endpoint is called by ElevenLabs when it needs to retrieve appointments
 * for a tenant. It does not require Bearer token authentication since
 * ElevenLabs webhooks don't send authentication headers.
 * 
 * Query Parameters:
 * - tenantId: The tenant identifier (required)
 * - status: Optional filter by appointment status
 * - employeeId: Optional filter by employee ID
 * - startDate: Optional filter by start date (ISO 8601)
 * - endDate: Optional filter by end date (ISO 8601)
 * 
 * Headers (required in production when webhook secret is configured):
 * - X-ElevenLabs-Signature: HMAC-SHA256 signature of the request
 */
const handleElevenLabsAppointmentsWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature in production
    const signature = req.headers['x-elevenlabs-signature'];
    const webhookSecret = env.ELEVENLABS_WEBHOOK_SECRET;
    
    if (env.isProduction() && webhookSecret && signature) {
      // For GET requests, we need to verify using query string
      const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';

      // Verify signature if provided
      if (!verifyElevenLabsSignature(queryString, signature, webhookSecret)) {
        logger.warn('ElevenLabs Appointments webhook: Invalid signature');
        throw new AppError('Invalid webhook signature', 401, 'UNAUTHORIZED');
      }
    } else if (env.isProduction() && webhookSecret && !signature) {
      // Log warning but allow request - ElevenLabs data webhooks may not send signatures
      logger.warn('ElevenLabs Appointments webhook: No signature provided (allowing request)');
    }

    // Get tenant ID from query parameter only (explicit requirement)
    const tenantId = req.query.tenantId;
    
    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400, 'VALIDATION_ERROR');
    }
    
    // Validate tenant ID format
    if (!isValidUUID(tenantId)) {
      throw new AppError('Invalid tenant ID format', 400, 'VALIDATION_ERROR');
    }
    
    // Get optional filter parameters
    const { status, employeeId, startDate, endDate } = req.query;
    
    // Validate optional employeeId format if provided
    if (employeeId && !isValidUUID(employeeId)) {
      throw new AppError('Invalid employee ID format', 400, 'VALIDATION_ERROR');
    }
    
    logger.info(`ElevenLabs Appointments webhook: Fetching appointments for tenant ${tenantId}`);
    
    // Fetch appointments for the tenant
    const result = await appointmentService.getAppointments(tenantId, {
      status,
      employeeId,
      startDate,
      endDate,
      limit: 100,
    });

    // Fetch tenant to get timezone for human-readable time conversion
    const tenant = await tenantService.getTenantById(tenantId);
    const timezone = tenant?.settings?.timezone || 'America/Los_Angeles';

    // Transform appointments to add human-readable local times
    // This helps the AI speak appointment times correctly instead of reading UTC literally
    const appointmentsWithLocalTimes = result.appointments.map(apt => {
      const aptObj = apt.toJSON ? apt.toJSON() : apt;
      const startDate = new Date(aptObj.startTime);
      const endDate = new Date(aptObj.endTime);

      return {
        ...aptObj,
        // Human-readable local time for AI to speak
        startTimeLocal: startDate.toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: timezone,
        }),
        endTimeLocal: endDate.toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: timezone,
        }),
      };
    });

    // Return appointments in the format expected by ElevenLabs
    res.status(200).json({
      success: true,
      data: {
        appointments: appointmentsWithLocalTimes,
        message: 'Here are the current appointments',
        total: result.total,
        tenantId,
      },
    });
  } catch (error) {
    logger.error(`ElevenLabs Appointments webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/webhooks/elevenlabs/appointments
 * Handle ElevenLabs Client Data webhook to create appointments
 * 
 * This endpoint is called by ElevenLabs Custom Actions when creating an appointment.
 * It does not require Bearer token authentication since ElevenLabs webhooks/custom actions
 * don't send authentication headers.
 * 
 * Request body:
 * {
 *   "tenantId": "tenant-uuid",
 *   "employeeId": "employee-uuid",
 *   "serviceId": "service-uuid",
 *   "customerName": "John Doe",
 *   "customerEmail": "john@example.com",
 *   "customerPhone": "+15551234567",
 *   "startTime": "2024-01-15T10:00:00Z",
 *   "addOns": [],
 *   "notes": "Created via AI"
 * }
 * 
 * Query Parameters (alternative):
 * - tenantId: The tenant identifier (can be in body or query)
 * 
 * Headers (required in production when webhook secret is configured):
 * - X-ElevenLabs-Signature: HMAC-SHA256 signature of the request body
 */
const handleElevenLabsCreateAppointmentWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature in production
    const signature = req.headers['x-elevenlabs-signature'];
    const webhookSecret = env.ELEVENLABS_WEBHOOK_SECRET;
    
    if (env.isProduction() && webhookSecret && signature) {
      // Verify signature if provided
      if (!req.rawBody) {
        logger.warn('ElevenLabs Create Appointment: Missing raw body for signature verification');
        throw new AppError('Invalid request: missing body', 400, 'INVALID_REQUEST');
      }

      if (!verifyElevenLabsSignature(req.rawBody, signature, webhookSecret)) {
        logger.warn('ElevenLabs Create Appointment: Invalid signature');
        throw new AppError('Invalid webhook signature', 401, 'UNAUTHORIZED');
      }
    } else if (env.isProduction() && webhookSecret && !signature) {
      // Log warning but allow request - ElevenLabs tool calls don't send signatures
      logger.warn('ElevenLabs Create Appointment: No signature provided (allowing request from tool call)');
    }
    
    // Get tenant ID from query parameter or request body
    const tenantId = req.query.tenantId || req.body.tenantId;
    
    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400, 'VALIDATION_ERROR');
    }
    
    // Validate tenant ID format
    if (!isValidUUID(tenantId)) {
      throw new AppError('Invalid tenant ID format', 400, 'VALIDATION_ERROR');
    }
    
    const {
      employeeId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      startTime,
      addOns,
      notes,
    } = req.body;
    
    // Validate required fields
    if (!employeeId || !serviceId || !customerName || !startTime) {
      throw new AppError(
        'employeeId, serviceId, customerName, and startTime are required',
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
    
    // Validate UUID formats
    if (!isValidUUID(employeeId)) {
      throw new AppError('Invalid employee ID format', 400, 'VALIDATION_ERROR');
    }
    
    if (!isValidUUID(serviceId)) {
      throw new AppError('Invalid service ID format', 400, 'VALIDATION_ERROR');
    }
    
    // Validate email format if provided
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      throw new AppError('Invalid email format', 400, 'VALIDATION_ERROR');
    }

    // Validate startTime format (basic check - detailed timezone handling is in createAppointment)
    const parsedStartTime = new Date(startTime);
    if (isNaN(parsedStartTime.getTime())) {
      throw new AppError('Invalid startTime format', 400, 'VALIDATION_ERROR');
    }

    // Note: We pass the original startTime string to createAppointment, which handles
    // timezone conversion via parseDateTimeInTimezone(). Do NOT pre-convert here
    // to avoid double conversion.

    logger.info(`ElevenLabs Create Appointment webhook: Creating appointment for tenant ${tenantId}, startTime=${startTime}`);

    // Create appointment using the internal service
    // Timezone conversion is handled by appointmentService.createAppointment
    const appointment = await appointmentService.createAppointment({
      employeeId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      startTime,  // Pass original string - createAppointment handles timezone
      addOns,
      notes: notes || 'Created via ElevenLabs AI',
    }, tenantId);
    
    // Return appointment in the format expected by ElevenLabs
    res.status(201).json({
      success: true,
      data: {
        appointment,
        message: 'Appointment created successfully',
      },
    });
  } catch (error) {
    logger.error(`ElevenLabs Create Appointment webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/webhooks/elevenlabs/conversation-end
 * Handle ElevenLabs Conversation End webhook
 * 
 * This webhook is called by ElevenLabs when a conversation ends.
 * It provides comprehensive data about the call including:
 * - Call status
 * - How the call ended (end_reason)
 * - Call duration
 * - Transcript summary
 * - Full transcript
 * 
 * Headers (required in production when webhook secret is configured):
 * - X-ElevenLabs-Signature: HMAC-SHA256 signature of the request body
 * 
 * Request body (from ElevenLabs):
 * {
 *   "type": "conversation_ended",
 *   "conversation_id": "unique-conversation-id",
 *   "agent_id": "elevenlabs-agent-id",
 *   "status": "done" | "failed",
 *   "call_successful": true | false,
 *   "call_duration_secs": 123.45,
 *   "end_reason": "user_hangup" | "agent_hangup" | "error" | "timeout",
 *   "transcript_summary": "Summary of the conversation",
 *   "transcript": [
 *     { "role": "agent", "message": "Hello..." },
 *     { "role": "user", "message": "Hi..." }
 *   ],
 *   "metadata": {
 *     "call_sid": "CA12345...",
 *     "caller_number": "+15551234567",
 *     "tenant_id": "tenant-uuid"
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Call log updated successfully"
 * }
 */
const handleConversationEndWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature in production
    const signature = req.headers['x-elevenlabs-signature'];
    const webhookSecret = env.ELEVENLABS_WEBHOOK_SECRET;
    
    logger.info('ElevenLabs Conversation End webhook received', {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret,
      hasRawBody: !!req.rawBody,
      isProduction: env.isProduction()
    });
    
    if (env.isProduction() && webhookSecret && signature) {
      // Verify signature if both secret and signature are present
      if (!req.rawBody) {
        logger.warn('ElevenLabs Conversation End: Missing raw body for signature verification');
        throw new AppError('Invalid request: missing body', 400, 'INVALID_REQUEST');
      }
      
      if (!verifyElevenLabsSignature(req.rawBody, signature, webhookSecret)) {
        logger.error('ElevenLabs Conversation End: Invalid signature', {
          signatureProvided: signature?.substring(0, 10) + '...',
          rawBodyLength: req.rawBody?.length,
          secretLength: webhookSecret?.length
        });
        throw new AppError('Invalid webhook signature', 401, 'UNAUTHORIZED');
      }
      
      logger.info('ElevenLabs Conversation End: Signature verified successfully');
    } else if (env.isProduction() && webhookSecret && !signature) {
      logger.warn('ElevenLabs Conversation End: Webhook secret configured but no signature provided by ElevenLabs');
    } else if (env.isProduction() && !webhookSecret) {
      logger.warn('ElevenLabs Conversation End: Webhook secret not configured');
    }
    
    const { type, event_timestamp, data: payloadData } = req.body;
    
    // Log the full payload for debugging
    logger.info('ElevenLabs Conversation End payload:', {
      type,
      event_timestamp,
      hasData: !!payloadData,
      dataKeys: payloadData ? Object.keys(payloadData) : [],
      bodyKeys: Object.keys(req.body)
    });
    
    // Validate webhook type - ElevenLabs sends either 'conversation_ended' or 'post_call_transcription'
    if (type && type !== 'conversation_ended' && type !== 'post_call_transcription') {
      logger.warn(`ElevenLabs Conversation End: Unexpected type ${type}`);
      return res.status(200).json({
        success: true,
        message: 'Event type not handled by this endpoint',
      });
    }
    
    // Extract data from the nested structure
    // For post_call_transcription, data is nested in a 'data' field
    const eventData = payloadData || req.body;
    
    // Handle different payload structures
    const conversation_id = eventData.conversation_id || eventData.conversationId;
    const agent_id = eventData.agent_id || eventData.agentId;
    const status = eventData.status;
    const call_successful = eventData.call_successful ?? eventData.callSuccessful;
    
    // Call duration can be in metadata or at top level
    const call_duration_secs = eventData.call_duration_secs 
      || eventData.callDurationSecs 
      || eventData.duration
      || eventData.metadata?.call_duration_secs;
    
    const end_reason = eventData.end_reason || eventData.endReason;
    
    // Transcript can be in different locations
    const transcript = eventData.transcript || eventData.transcription;
    
    // Summary can be nested in analysis object or at top level
    const transcript_summary = eventData.analysis?.transcript_summary 
      || eventData.transcript_summary 
      || eventData.analysis?.transcriptSummary
      || eventData.transcriptSummary
      || eventData.summary;
    
    const metadata = eventData.metadata || {};
    const end_timestamp = eventData.end_timestamp || eventData.ended_at || eventData.endTimestamp || eventData.endedAt;
    const user_satisfaction_rating = eventData.user_satisfaction_rating || eventData.userSatisfactionRating;
    
    // Check conversation_initiation_client_data for call SID
    const initiationData = eventData.conversation_initiation_client_data || {};
    
    // Extract dynamic_variables from initiation data (this is where we store call_sid)
    const dynamicVariables = initiationData.dynamic_variables || {};
    
    logger.info('Extracted call data:', {
      conversation_id,
      call_duration_secs,
      hasTranscript: !!transcript,
      hasTranscriptSummary: !!transcript_summary,
      transcriptType: Array.isArray(transcript) ? 'array' : typeof transcript,
      hasInitiationData: !!eventData.conversation_initiation_client_data,
      initiationDataKeys: Object.keys(initiationData),
      dynamicVariablesKeys: Object.keys(dynamicVariables)
    });
    
    // Get call SID from multiple possible locations
    // Priority: dynamic_variables (where we set it) > metadata > initiationData
    const callSid = dynamicVariables.call_sid 
      || dynamicVariables.callSid
      || metadata.call_sid 
      || metadata.callSid 
      || initiationData.call_sid 
      || initiationData.callSid
      || initiationData.twilioCallSid;
    
    logger.info(`ElevenLabs Conversation End: Looking up call log`, {
      conversation_id,
      callSid,
      hasCallSid: !!callSid
    });
    
    // Find the call log by Twilio call SID or conversation ID
    let callLog;
    
    if (callSid) {
      callLog = await CallLog.findOne({
        where: { twilioCallSid: callSid },
      });
      logger.info(`Lookup by call SID ${callSid}:`, { found: !!callLog });
    }
    
    // If not found by call SID, try to find by conversation ID in metadata
    if (!callLog && conversation_id) {
      callLog = await CallLog.findOne({
        where: {
          metadata: {
            [Op.contains]: { elevenLabsConversationId: conversation_id }
          }
        }
      });
      logger.info(`Lookup by conversation ID ${conversation_id}:`, { found: !!callLog });
    }
    
    if (!callLog) {
      logger.warn(`ElevenLabs Conversation End: Call log not found`, {
        callSid,
        conversation_id,
        triedCallSid: !!callSid
      });
      // Still return success to avoid webhook retries
      return res.status(200).json({
        success: true,
        message: 'Call log not found, may have been deleted',
      });
    }
    
    // Prepare data for update
    const updateData = {
      conversation_id,
      agent_id,
      status,
      call_successful,
      call_duration_secs,
      end_reason,
      transcript_summary,
      transcript,
      end_timestamp,
      user_satisfaction_rating,
    };
    
    logger.info('Data being passed to updateFromElevenLabs:', {
      conversation_id,
      call_duration_secs,
      transcript_summary_length: transcript_summary?.length || 0,
      transcript_length: Array.isArray(transcript) ? transcript.length : (transcript?.length || 0),
      transcript_type: Array.isArray(transcript) ? 'array' : typeof transcript,
      hasTranscript: !!transcript,
      hasTranscriptSummary: !!transcript_summary,
      status,
      call_successful
    });
    
    // Update call log with ElevenLabs data
    await callLog.updateFromElevenLabs(updateData);
    
    logger.info(`ElevenLabs Conversation End: Updated call log ${callLog.id}`, {
      duration: callLog.duration,
      hasSummary: !!callLog.callSummary,
      hasTranscription: !!callLog.transcription,
      summaryLength: callLog.callSummary?.length || 0,
      transcriptionLength: callLog.transcription?.length || 0
    });
    
    // Record usage for billing (new hybrid pricing model)
    if (callLog.duration && callLog.duration > 0 && callLog.tenantId) {
      try {
        const { recordCallUsage } = require('../billing/usage.service');
        const usageResult = await recordCallUsage({
          tenantId: callLog.tenantId,
          durationSeconds: callLog.duration,
          callLogId: callLog.id,
          metadata: {
            conversationId: conversation_id,
            callSid,
            callSuccessful: call_successful,
            endReason: end_reason,
          },
        });
        
        if (usageResult) {
          logger.info(`Recorded ${Math.ceil(callLog.duration / 60)} minutes usage for tenant ${callLog.tenantId}`, {
            totalMinutes: usageResult.currentUsage.totalMinutes,
            remainingMinutes: usageResult.currentUsage.remainingMinutes,
            usagePercentage: usageResult.currentUsage.usagePercentage,
          });
        }
      } catch (usageError) {
        // Log but don't fail the webhook - usage recording is secondary
        logger.error(`Failed to record call usage: ${usageError.message}`, {
          tenantId: callLog.tenantId,
          callLogId: callLog.id,
          duration: callLog.duration,
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Call log updated successfully',
      data: {
        callLogId: callLog.id,
        conversationId: conversation_id,
      },
    });
  } catch (error) {
    logger.error(`ElevenLabs Conversation End webhook error: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/webhooks/elevenlabs/agents
 * List all ElevenLabs agents (no auth required - webhook endpoint)
 */
const handleListAgentsWebhook = async (req, res, next) => {
  try {
    const elevenlabsService = getElevenLabsService();

    if (!await elevenlabsService.isAvailable()) {
      throw new AppError('ElevenLabs is not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const { pageSize, cursor } = req.query;

    const result = await elevenlabsService.listAgents({
      pageSize: pageSize ? parseInt(pageSize, 10) : 30,
      cursor,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error listing agents (webhook): ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/webhooks/elevenlabs/agents/:agentId
 * Get a specific ElevenLabs agent's details (no auth required - webhook endpoint)
 */
const handleGetAgentWebhook = async (req, res, next) => {
  try {
    const elevenlabsService = getElevenLabsService();

    if (!await elevenlabsService.isAvailable()) {
      throw new AppError('ElevenLabs is not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const { agentId } = req.params;

    if (!agentId) {
      throw new AppError('Agent ID is required', 400, 'VALIDATION_ERROR');
    }

    const agent = await elevenlabsService.getAgent(agentId);

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    logger.error(`Error getting agent (webhook): ${error.message}`);
    next(error);
  }
};

/**
 * PATCH /api/webhooks/elevenlabs/agents/:agentId
 * Update an ElevenLabs agent's configuration (no auth required - webhook endpoint)
 *
 * Request body:
 * {
 *   "systemPrompt": "You are a helpful assistant...",
 *   "firstMessage": "Hello! Thank you for calling...",
 *   "name": "My Agent",
 *   "voiceId": "voice-uuid",
 *   "language": "en",
 *   "llm": { "model": "gpt-4" },
 *   "dynamicVariables": { "var1": "default1", "var2": "default2" }
 * }
 */
const handleUpdateAgentWebhook = async (req, res, next) => {
  try {
    const elevenlabsService = getElevenLabsService();

    if (!await elevenlabsService.isAvailable()) {
      throw new AppError('ElevenLabs is not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const { agentId } = req.params;
    const { systemPrompt, firstMessage, name, voiceId, language, llm, dynamicVariables } = req.body;

    if (!agentId) {
      throw new AppError('Agent ID is required', 400, 'VALIDATION_ERROR');
    }

    // At least one field must be provided
    if (!systemPrompt && !firstMessage && !name && !voiceId && !language && !llm && !dynamicVariables) {
      throw new AppError('At least one configuration field is required', 400, 'VALIDATION_ERROR');
    }

    const updatedAgent = await elevenlabsService.updateAgent(agentId, {
      systemPrompt,
      firstMessage,
      name,
      voiceId,
      language,
      llm,
      dynamicVariables,
    });

    logger.info(`Agent ${agentId} updated successfully (webhook)`);

    res.status(200).json({
      success: true,
      data: updatedAgent,
      message: 'Agent updated successfully',
    });
  } catch (error) {
    logger.error(`Error updating agent (webhook): ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/ai/agents
 * List all ElevenLabs agents
 */
const listAgents = async (req, res, next) => {
  try {
    const elevenlabsService = getElevenLabsService();

    if (!await elevenlabsService.isAvailable()) {
      throw new AppError('ElevenLabs is not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const { pageSize, cursor } = req.query;

    const result = await elevenlabsService.listAgents({
      pageSize: pageSize ? parseInt(pageSize, 10) : 30,
      cursor,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error listing agents: ${error.message}`);
    next(error);
  }
};

/**
 * GET /api/ai/agents/:agentId
 * Get a specific ElevenLabs agent's details
 */
const getAgent = async (req, res, next) => {
  try {
    const elevenlabsService = getElevenLabsService();

    if (!await elevenlabsService.isAvailable()) {
      throw new AppError('ElevenLabs is not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const { agentId } = req.params;

    if (!agentId) {
      throw new AppError('Agent ID is required', 400, 'VALIDATION_ERROR');
    }

    const agent = await elevenlabsService.getAgent(agentId);

    res.status(200).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    logger.error(`Error getting agent: ${error.message}`);
    next(error);
  }
};

/**
 * PATCH /api/ai/agents/:agentId
 * Update an ElevenLabs agent's configuration
 *
 * Request body:
 * {
 *   "systemPrompt": "You are a helpful assistant...",
 *   "firstMessage": "Hello! Thank you for calling...",
 *   "name": "My Agent",
 *   "voiceId": "voice-uuid",
 *   "language": "en",
 *   "llm": { "model": "gpt-4" }
 * }
 */
const updateAgent = async (req, res, next) => {
  try {
    const elevenlabsService = getElevenLabsService();

    if (!await elevenlabsService.isAvailable()) {
      throw new AppError('ElevenLabs is not configured', 503, 'SERVICE_UNAVAILABLE');
    }

    const { agentId } = req.params;
    const { systemPrompt, firstMessage, name, voiceId, language, llm } = req.body;

    if (!agentId) {
      throw new AppError('Agent ID is required', 400, 'VALIDATION_ERROR');
    }

    // At least one field must be provided
    if (!systemPrompt && !firstMessage && !name && !voiceId && !language && !llm) {
      throw new AppError('At least one configuration field is required', 400, 'VALIDATION_ERROR');
    }

    const updatedAgent = await elevenlabsService.updateAgent(agentId, {
      systemPrompt,
      firstMessage,
      name,
      voiceId,
      language,
      llm,
    });

    logger.info(`Agent ${agentId} updated successfully`);

    res.status(200).json({
      success: true,
      data: updatedAgent,
      message: 'Agent updated successfully',
    });
  } catch (error) {
    logger.error(`Error updating agent: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/webhooks/elevenlabs/employee-schedule
 * Handle ElevenLabs tool calls for employee self-service schedule management
 *
 * Allows employees to update their own schedule by phone.
 * Authentication is based on matching caller phone number to employee phone.
 */
const handleEmployeeScheduleWebhook = async (req, res, next) => {
  try {
    const { tenantId, action } = req.query;
    const { callerPhone, employeeId, date, enabled, blocks } = req.body;

    if (!tenantId) {
      throw new AppError('Tenant ID is required', 400, 'VALIDATION_ERROR');
    }

    logger.info(`Employee schedule webhook: action=${action}, tenantId=${tenantId}`);

    let result;

    switch (action) {
      case 'identify': {
        // Find employee by phone number
        const employee = await employeeService.findEmployeeByPhone(callerPhone, tenantId);

        if (employee) {
          // Parse schedule if needed
          let schedule = employee.schedule;
          if (typeof schedule === 'string') {
            try {
              schedule = JSON.parse(schedule);
            } catch (e) {
              logger.error('Failed to parse employee schedule:', e);
            }
          }

          result = {
            isEmployee: true,
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            firstName: employee.firstName,
            currentSchedule: schedule,
          };
        } else {
          result = {
            isEmployee: false,
          };
        }
        break;
      }

      case 'get_schedule': {
        // Get employee's current schedule
        const employee = await employeeService.findEmployeeByPhone(callerPhone, tenantId);

        if (!employee) {
          return res.status(404).json({
            success: false,
            error: 'Employee not found',
          });
        }

        // Parse schedule if needed
        let schedule = employee.schedule;
        if (typeof schedule === 'string') {
          try {
            schedule = JSON.parse(schedule);
          } catch (e) {
            logger.error('Failed to parse employee schedule:', e);
          }
        }

        result = {
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          schedule,
        };
        break;
      }

      case 'update_schedule': {
        // Verify employee owns this schedule (phone match)
        const employee = await employeeService.findEmployeeByPhone(callerPhone, tenantId);

        if (!employee) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized - phone number not recognized',
          });
        }

        if (employeeId && employee.id !== employeeId) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized - cannot modify another employee\'s schedule',
          });
        }

        // Parse blocks if it's a string (ElevenLabs sometimes sends nested JSON as strings)
        let parsedBlocks = blocks;
        if (typeof blocks === 'string') {
          try {
            parsedBlocks = JSON.parse(blocks);
            logger.info('Parsed blocks from string:', parsedBlocks);
          } catch (e) {
            logger.error('Failed to parse blocks string:', blocks, e);
            return res.status(400).json({
              success: false,
              error: 'Invalid blocks format - must be valid JSON array',
            });
          }
        }

        // Validate date is within current week
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid date format',
          });
        }

        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        if (targetDate < weekStart || targetDate > weekEnd) {
          return res.status(400).json({
            success: false,
            error: 'Can only update schedule for the current week',
          });
        }

        // Get day name from date
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[targetDate.getDay()];

        // Parse current schedule
        let currentSchedule = employee.schedule;
        if (typeof currentSchedule === 'string') {
          try {
            currentSchedule = JSON.parse(currentSchedule);
          } catch (e) {
            currentSchedule = {};
          }
        }

        // Build new schedule for that day
        const newDaySchedule = {
          enabled: enabled !== false,
          blocks: parsedBlocks || [],
        };

        // Validate blocks format
        if (newDaySchedule.blocks && newDaySchedule.blocks.length > 0) {
          for (const block of newDaySchedule.blocks) {
            if (!block.start || !block.end) {
              return res.status(400).json({
                success: false,
                error: 'Each block must have start and end times',
              });
            }
            // Validate time format (HH:MM)
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(block.start) || !timeRegex.test(block.end)) {
              return res.status(400).json({
                success: false,
                error: 'Time must be in HH:MM format',
              });
            }
          }
        }

        // Update employee schedule
        const updatedSchedule = { ...currentSchedule, [dayName]: newDaySchedule };

        await employee.update({ schedule: updatedSchedule });

        logger.info(`Employee ${employee.id} updated their ${dayName} schedule via voice`);

        result = {
          message: `Schedule updated for ${dayName}`,
          updatedDay: dayName,
          date: date,
          newSchedule: newDaySchedule,
          employeeName: `${employee.firstName} ${employee.lastName}`,
        };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Invalid action: ${action}`,
        });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Employee schedule webhook error: ${error.message}`);
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
  handleElevenLabsServicesWebhook,
  handleElevenLabsEmployeesWebhook,
  handleCheckCallerWebhook,
  handleElevenLabsAppointmentsWebhook,
  handleElevenLabsCreateAppointmentWebhook,
  handleConversationEndWebhook,
  handleEmployeeScheduleWebhook,
  getAIConfig,
  listAgents,
  getAgent,
  updateAgent,
  // Webhook endpoints (no auth required)
  handleListAgentsWebhook,
  handleGetAgentWebhook,
  handleUpdateAgentWebhook,
};
