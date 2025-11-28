/**
 * OpenAI Service
 * Handles integration with OpenAI for LLM and NLU capabilities
 */
const crypto = require('crypto');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { AIProviderInterface, INTENT_TYPES, ACTION_TYPES } = require('./ai-provider.interface');

/**
 * OpenAI AI Provider implementation
 * Handles natural language understanding and text generation via OpenAI API
 */
class OpenAIService extends AIProviderInterface {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || env.OPENAI_API_KEY;
    this.model = config.model || env.OPENAI_MODEL || 'gpt-4';
    this.baseUrl = 'https://api.openai.com/v1';
    this.sessions = new Map();
  }

  /**
   * Get provider name
   * @returns {string} - Provider name
   */
  getName() {
    return 'openai';
  }

  /**
   * Check if OpenAI is properly configured
   * @returns {Promise<boolean>} - True if configured
   */
  async isAvailable() {
    return !!this.apiKey;
  }

  /**
   * Start a conversation session
   * @param {string} tenantId - Tenant identifier
   * @param {Object} options - Session options
   * @returns {Promise<Object>} - Conversation context
   */
  async startSession(tenantId, options = {}) {
    const sessionId = crypto.randomUUID();
    
    const systemPrompt = options.systemPrompt || this._buildSystemPrompt(options.tenantConfig);
    
    const context = {
      sessionId,
      tenantId,
      history: [
        { role: 'system', content: systemPrompt },
      ],
      metadata: {
        startTime: new Date().toISOString(),
        model: this.model,
        ...options.metadata,
      },
    };

    this.sessions.set(sessionId, context);
    
    logger.info(`OpenAI session started: ${sessionId} for tenant: ${tenantId}`);
    
    return context;
  }

  /**
   * End a conversation session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<void>}
   */
  async endSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      logger.info(`OpenAI session ended: ${sessionId}`);
    }
  }

  /**
   * Process user input through OpenAI
   * @param {string} input - User input text
   * @param {Object} context - Conversation context
   * @returns {Promise<Object>} - AI response
   */
  async processInput(input, context) {
    if (!await this.isAvailable()) {
      logger.warn('OpenAI is not configured, returning default response');
      return this._getDefaultResponse(input, context);
    }

    try {
      // Add user message to history
      context.history.push({ role: 'user', content: input });

      // Detect intent
      const intent = await this.detectIntent(input, context);
      
      // Generate response
      const responseText = await this._generateResponse(context);
      
      // Add assistant response to history
      context.history.push({ role: 'assistant', content: responseText });

      const response = {
        text: responseText,
        intent,
        action: this._mapIntentToAction(intent),
        shouldHandoff: intent.name === INTENT_TYPES.HUMAN_HANDOFF,
      };

      logger.info(`OpenAI processed input for session: ${context.sessionId}, intent: ${intent.name}`);
      
      return response;
    } catch (error) {
      logger.error(`OpenAI processInput error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect intent from user input using OpenAI
   * @param {string} input - User input text
   * @param {Object} _context - Conversation context (unused in current implementation)
   * @returns {Promise<Object>} - Detected intent
   */
  async detectIntent(input, _context) {
    // Use pattern matching for now (in production, could use OpenAI function calling)
    const normalizedInput = input.toLowerCase().trim();
    
    const intentPatterns = [
      { pattern: /book|schedule|appointment|make.*appointment/i, intent: INTENT_TYPES.BOOK_APPOINTMENT },
      { pattern: /available|availability|when.*open|free.*time|slot/i, intent: INTENT_TYPES.CHECK_AVAILABILITY },
      { pattern: /cancel|remove.*appointment/i, intent: INTENT_TYPES.CANCEL_APPOINTMENT },
      { pattern: /reschedule|change.*appointment|modify.*appointment/i, intent: INTENT_TYPES.MODIFY_APPOINTMENT },
      { pattern: /service|services|offer|menu|price|pricing/i, intent: INTENT_TYPES.GET_SERVICES },
      { pattern: /hours|open|close|business hours|working hours/i, intent: INTENT_TYPES.GET_HOURS },
      { pattern: /speak.*human|real.*person|transfer|agent/i, intent: INTENT_TYPES.HUMAN_HANDOFF },
      { pattern: /hello|hi|hey|good morning|good afternoon/i, intent: INTENT_TYPES.GREETING },
      { pattern: /bye|goodbye|thank|thanks/i, intent: INTENT_TYPES.GOODBYE },
    ];

    for (const { pattern, intent } of intentPatterns) {
      if (pattern.test(normalizedInput)) {
        return {
          name: intent,
          confidence: 0.9,
          entities: this._extractEntities(normalizedInput, intent),
        };
      }
    }

    return {
      name: INTENT_TYPES.GENERAL_INQUIRY,
      confidence: 0.6,
      entities: {},
    };
  }

  /**
   * Generate response using OpenAI (placeholder - requires API integration)
   * @param {Object} context - Conversation context
   * @returns {Promise<string>} - Generated response
   * @note In production, this would call OpenAI API:
   *       POST https://api.openai.com/v1/chat/completions
   */
  async _generateResponse(context) {
    // PLACEHOLDER: Actual implementation would make OpenAI API call
    // For now, use local intent detection to generate appropriate responses
    
    const lastMessage = context.history[context.history.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const intent = await this.detectIntent(lastMessage.content, context);
      return this._generateResponseText(intent, context);
    }
    
    return "I'm here to help. How can I assist you today?";
  }

  /**
   * Generate text-to-speech audio using OpenAI TTS (placeholder - requires API integration)
   * @param {string} text - Text to convert
   * @param {Object} options - TTS options
   * @returns {Promise<Buffer|null>} - Audio buffer or null if not available
   * @note In production, this would call OpenAI TTS API:
   *       POST https://api.openai.com/v1/audio/speech
   */
  async textToSpeech(text, options = {}) {
    if (!await this.isAvailable()) {
      logger.warn('OpenAI TTS not available - API key not configured');
      return null;
    }

    const voice = options.voice || 'alloy';
    const model = options.model || 'tts-1';
    
    logger.info(`OpenAI TTS placeholder: voice=${voice}, model=${model}, text length=${text.length}`);
    
    // PLACEHOLDER: Return null to indicate TTS is not yet implemented
    // In production, this would return actual audio data from OpenAI
    return null;
  }

  /**
   * Transcribe speech to text using OpenAI Whisper (placeholder - requires API integration)
   * @param {Buffer} _audio - Audio buffer (unused in placeholder)
   * @param {Object} _options - Transcription options (unused in placeholder)
   * @returns {Promise<string>} - Transcribed text (empty string if not available)
   * @note In production, this would call OpenAI Whisper API:
   *       POST https://api.openai.com/v1/audio/transcriptions
   */
  async speechToText(_audio, _options = {}) {
    if (!await this.isAvailable()) {
      logger.warn('OpenAI Whisper not available - API key not configured');
      return '';
    }

    const model = _options.model || 'whisper-1';
    
    logger.info(`OpenAI Whisper placeholder: model=${model}`);
    
    // PLACEHOLDER: Return empty string to indicate STT is not yet implemented
    // In production, this would return transcribed text from OpenAI Whisper
    return '';
  }

  /**
   * Build system prompt for the AI assistant
   * @param {Object} tenantConfig - Tenant configuration
   * @returns {string} - System prompt
   */
  _buildSystemPrompt(tenantConfig = {}) {
    const businessName = tenantConfig.businessName || 'the business';
    const greeting = tenantConfig.greeting || 'Hello! Thank you for calling.';
    const tone = tenantConfig.tone || 'professional and friendly';
    
    return `You are an AI assistant for ${businessName}. Your tone should be ${tone}.
    
Your primary responsibilities:
1. Help customers book, modify, or cancel appointments
2. Provide information about available services and pricing
3. Answer questions about business hours
4. Handle general inquiries professionally

Guidelines:
- Be concise and helpful
- Always confirm appointment details before booking
- If you cannot help with a request, offer to transfer to a human agent
- ${greeting}`;
  }

  /**
   * Extract entities from input based on intent
   * @param {string} input - User input
   * @param {string} _intent - Detected intent (unused in current implementation)
   * @returns {Object} - Extracted entities
   */
  _extractEntities(input, _intent) {
    const entities = {};

    // Extract date patterns
    const dateMatch = input.match(/\b(\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}|tomorrow|today|next\s+\w+day)\b/i);
    if (dateMatch) {
      entities.date = dateMatch[1];
    }

    // Extract time patterns
    const timeMatch = input.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}\s*o'?clock)\b/i);
    if (timeMatch) {
      entities.time = timeMatch[1];
    }

    // Extract phone number
    const phoneMatch = input.match(/\b(\+?1?\d{10,}|\(\d{3}\)\s*\d{3}-?\d{4})\b/);
    if (phoneMatch) {
      entities.phone = phoneMatch[1];
    }

    // Extract email
    const emailMatch = input.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
    if (emailMatch) {
      entities.email = emailMatch[1];
    }

    return entities;
  }

  /**
   * Generate response text based on intent
   * @param {Object} intent - Detected intent
   * @param {Object} _context - Conversation context (unused in current implementation)
   * @returns {string} - Response text
   */
  _generateResponseText(intent, _context) {
    const responses = {
      [INTENT_TYPES.BOOK_APPOINTMENT]: "I'd be happy to help you book an appointment. What service would you like, and when would you prefer to come in?",
      [INTENT_TYPES.CHECK_AVAILABILITY]: "I can check our availability for you. What date and service are you interested in?",
      [INTENT_TYPES.CANCEL_APPOINTMENT]: "I can help you cancel your appointment. Could you please provide your name or the phone number the appointment was booked under?",
      [INTENT_TYPES.MODIFY_APPOINTMENT]: "I can help you modify your appointment. What would you like to change - the date, time, or service?",
      [INTENT_TYPES.GET_SERVICES]: "We offer a variety of services. Let me pull up our menu for you.",
      [INTENT_TYPES.GET_HOURS]: "I'll get our business hours for you right away.",
      [INTENT_TYPES.HUMAN_HANDOFF]: "I'll connect you with a team member. Please hold for a moment.",
      [INTENT_TYPES.GREETING]: "Hello! Welcome! How may I assist you today?",
      [INTENT_TYPES.GOODBYE]: "Thank you for calling! Have a wonderful day!",
      [INTENT_TYPES.GENERAL_INQUIRY]: "I'd be happy to help. Could you tell me more about what you're looking for?",
      [INTENT_TYPES.UNKNOWN]: "I apologize, I didn't quite understand that. Could you please rephrase your question?",
    };

    return responses[intent.name] || responses[INTENT_TYPES.UNKNOWN];
  }

  /**
   * Map intent to action type
   * @param {Object} intent - Detected intent
   * @returns {Object} - Action to perform
   */
  _mapIntentToAction(intent) {
    const actionMap = {
      [INTENT_TYPES.BOOK_APPOINTMENT]: { type: ACTION_TYPES.CREATE_APPOINTMENT, data: intent.entities },
      [INTENT_TYPES.CHECK_AVAILABILITY]: { type: ACTION_TYPES.QUERY_AVAILABILITY, data: intent.entities },
      [INTENT_TYPES.CANCEL_APPOINTMENT]: { type: ACTION_TYPES.CANCEL_APPOINTMENT, data: intent.entities },
      [INTENT_TYPES.MODIFY_APPOINTMENT]: { type: ACTION_TYPES.UPDATE_APPOINTMENT, data: intent.entities },
      [INTENT_TYPES.GET_SERVICES]: { type: ACTION_TYPES.GET_SERVICES, data: {} },
      [INTENT_TYPES.GET_HOURS]: { type: ACTION_TYPES.GET_BUSINESS_HOURS, data: {} },
      [INTENT_TYPES.HUMAN_HANDOFF]: { type: ACTION_TYPES.TRANSFER_TO_HUMAN, data: {} },
      [INTENT_TYPES.GOODBYE]: { type: ACTION_TYPES.END_CONVERSATION, data: {} },
    };

    return actionMap[intent.name] || { type: ACTION_TYPES.CONTINUE_CONVERSATION, data: {} };
  }

  /**
   * Get default response when OpenAI is not configured
   * @param {string} _input - User input (unused)
   * @param {Object} _context - Conversation context (unused)
   * @returns {Object} - Default response
   */
  _getDefaultResponse(_input, _context) {
    return {
      text: "Our AI assistant is temporarily unavailable. Please try again later or leave a message.",
      intent: { name: INTENT_TYPES.UNKNOWN, confidence: 0, entities: {} },
      action: { type: ACTION_TYPES.TRANSFER_TO_HUMAN, data: {} },
      shouldHandoff: true,
    };
  }
}

// Singleton instance
let instance = null;

/**
 * Get or create OpenAI service instance
 * @param {Object} config - Optional configuration
 * @returns {OpenAIService} - Service instance
 */
const getOpenAIService = (config = {}) => {
  if (!instance) {
    instance = new OpenAIService(config);
  }
  return instance;
};

module.exports = {
  OpenAIService,
  getOpenAIService,
};
