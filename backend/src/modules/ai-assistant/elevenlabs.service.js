/**
 * ElevenLabs Service
 * Handles integration with ElevenLabs for voice AI and call orchestration
 */
const crypto = require('crypto');
const { URL } = require('url');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { AIProviderInterface, INTENT_TYPES, ACTION_TYPES } = require('./ai-provider.interface');

/**
 * ElevenLabs AI Provider implementation
 * Handles voice synthesis and conversation orchestration via ElevenLabs Agent API
 */
class ElevenLabsService extends AIProviderInterface {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || env.ELEVENLABS_API_KEY;
    // Agent ID should be passed explicitly or retrieved from business type
    // env.ELEVENLABS_AGENT_ID is deprecated but kept for backward compatibility
    this.agentId = config.agentId || env.ELEVENLABS_AGENT_ID || null;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.sessions = new Map();
    
    // Initialize ElevenLabs client if API key is available
    this.client = this.apiKey ? new ElevenLabsClient({ apiKey: this.apiKey }) : null;
  }

  /**
   * Get provider name
   * @returns {string} - Provider name
   */
  getName() {
    return 'elevenlabs';
  }

  /**
   * Check if ElevenLabs is properly configured
   * @returns {Promise<boolean>} - True if configured
   */
  async isAvailable() {
    // Only require API key; agent ID is now determined dynamically per tenant
    return !!this.apiKey;
  }

  /**
   * Start a conversation session with ElevenLabs Agent
   * @param {string} tenantId - Tenant identifier
   * @param {Object} options - Session options
   * @returns {Promise<Object>} - Conversation context
   */
  async startSession(tenantId, options = {}) {
    const sessionId = crypto.randomUUID();
    
    const context = {
      sessionId,
      tenantId,
      history: [],
      metadata: {
        startTime: new Date().toISOString(),
        agentId: this.agentId,
        voice: options.voice || env.ELEVENLABS_VOICE_ID || 'default',
        ...options.metadata,
      },
    };

    this.sessions.set(sessionId, context);
    
    logger.info(`ElevenLabs session started: ${sessionId} for tenant: ${tenantId}`);
    
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
      logger.info(`ElevenLabs session ended: ${sessionId}`);
    }
  }

  /**
   * Process user input through ElevenLabs Agent
   * @param {string} input - User input text
   * @param {Object} context - Conversation context
   * @returns {Promise<Object>} - AI response
   */
  async processInput(input, context) {
    if (!await this.isAvailable()) {
      logger.warn('ElevenLabs is not configured, returning default response');
      return this._getDefaultResponse(input, context);
    }

    try {
      // Add input to conversation history
      if (context.history) {
        context.history.push({ role: 'user', content: input, timestamp: new Date().toISOString() });
      }

      // For now, return a structured response that will be handled by intent handler
      // In production, this would make an API call to ElevenLabs Agent
      const intent = await this.detectIntent(input, context);
      
      const response = {
        text: this._generateResponseText(intent, context),
        intent,
        action: this._mapIntentToAction(intent),
        shouldHandoff: intent.name === INTENT_TYPES.HUMAN_HANDOFF,
      };

      // Add response to history
      if (context.history) {
        context.history.push({ role: 'assistant', content: response.text, timestamp: new Date().toISOString() });
      }

      logger.info(`ElevenLabs processed input for session: ${context.sessionId}, intent: ${intent.name}`);
      
      return response;
    } catch (error) {
      logger.error(`ElevenLabs processInput error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect intent from user input
   * @param {string} input - User input text
   * @param {Object} _context - Conversation context (unused in current implementation)
   * @returns {Promise<Object>} - Detected intent
   */
  async detectIntent(input, _context) {
    const normalizedInput = input.toLowerCase().trim();
    
    // Simple intent detection (in production, this would use ElevenLabs or OpenAI NLU)
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
          confidence: 0.85,
          entities: this._extractEntities(normalizedInput, intent),
        };
      }
    }

    return {
      name: INTENT_TYPES.GENERAL_INQUIRY,
      confidence: 0.5,
      entities: {},
    };
  }

  /**
   * Generate text-to-speech audio using ElevenLabs
   * @param {string} text - Text to convert
   * @param {Object} options - TTS options
   * @returns {Promise<Buffer>} - Audio buffer (placeholder)
   */
  async textToSpeech(text, options = {}) {
    if (!await this.isAvailable()) {
      logger.warn('ElevenLabs TTS not available');
      return null;
    }

    const voiceId = options.voice || env.ELEVENLABS_VOICE_ID || 'default';
    
    logger.info(`ElevenLabs TTS requested for voice: ${voiceId}, text length: ${text.length}`);
    
    // In production, this would make an API call to ElevenLabs TTS endpoint
    // POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
    return Buffer.from('audio-placeholder');
  }

  /**
   * Transcribe speech to text (placeholder)
   * @param {Buffer} _audio - Audio buffer (unused - use OpenAI Whisper)
   * @param {Object} _options - Transcription options (unused)
   * @returns {Promise<string>} - Transcribed text
   */
  async speechToText(_audio, _options = {}) {
    logger.info('ElevenLabs STT not directly supported, use OpenAI Whisper');
    return '';
  }

  /**
   * Generate a signed URL for WebSocket connection to ElevenLabs Agent
   * @param {string} agentId - Agent ID
   * @param {Object} _options - Connection options (unused in current implementation)
   * @returns {Promise<Object>} - Connection details with signed URL
   */
  async getAgentSignedUrl(agentId, _options = {}) {
    if (!await this.isAvailable()) {
      throw new Error('ElevenLabs is not configured');
    }

    const effectiveAgentId = agentId || this.agentId;
    
    logger.info(`Generating signed URL for agent: ${effectiveAgentId}`);
    
    try {
      // Use the ElevenLabs client to get a signed URL for the conversation
      const response = await this.client.conversationalAi.conversations.getSignedUrl({
        agentId: effectiveAgentId,
      });
      
      return {
        signedUrl: response.signedUrl,
        agentId: effectiveAgentId,
        expiresIn: 3600,
      };
    } catch (error) {
      logger.error(`Failed to get signed URL: ${error.message}`);
      // Fallback to constructing URL directly if API call fails
      const encodedAgentId = encodeURIComponent(effectiveAgentId);
      return {
        signedUrl: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${encodedAgentId}`,
        agentId: effectiveAgentId,
        expiresIn: 3600,
      };
    }
  }

  /**
   * Get a signed URL specifically for Twilio integration
   * This creates a connection URL that can be used in TwiML <Connect><Stream>
   * @param {string} agentId - Agent ID (optional, uses default if not provided)
   * @param {Object} options - Connection options
   * @param {string} options.tenantId - Tenant identifier for context
   * @param {string} options.callSid - Twilio call SID for tracking
   * @returns {Promise<Object>} - Connection details with signed URL
   */
  async getTwilioSignedUrl(agentId, options = {}) {
    if (!await this.isAvailable()) {
      throw new Error('ElevenLabs is not configured');
    }

    const effectiveAgentId = agentId || this.agentId;
    const { tenantId, callSid } = options;
    
    logger.info(`Generating Twilio signed URL for agent: ${effectiveAgentId}, tenant: ${tenantId}, call: ${callSid}`);
    
    try {
      // Use the ElevenLabs client to get a signed URL
      const response = await this.client.conversationalAi.conversations.getSignedUrl({
        agentId: effectiveAgentId,
      });
      
      // Append audio format query parameters to the signed URL for Twilio compatibility
      // This ensures ElevenLabs uses μ-law encoding at 8kHz which is required for Twilio
      // Some ElevenLabs agent configurations may not respect the conversation_config_override
      // so we also add the format parameters to the URL as a fallback
      // Use URL class for safer parameter handling
      const url = new URL(response.signedUrl);
      url.searchParams.set('output_format', 'ulaw_8000');
      url.searchParams.set('input_format', 'ulaw_8000');
      const signedUrl = url.toString();
      
      return {
        signedUrl,
        agentId: effectiveAgentId,
        tenantId,
        callSid,
      };
    } catch (error) {
      logger.error(`Failed to get Twilio signed URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the ElevenLabs client instance
   * @returns {ElevenLabsClient|null} - The ElevenLabs client or null if not configured
   */
  getClient() {
    return this.client;
  }

  /**
   * Import a Twilio phone number into ElevenLabs
   * @param {Object} params - Import parameters
   * @param {string} params.phoneNumber - The phone number to import (E.164 format)
   * @param {string} params.label - Label for the phone number (business name)
   * @param {string} params.agentId - ElevenLabs agent ID to assign
   * @param {string} params.twilioAccountSid - Twilio Account SID
   * @param {string} params.twilioAuthToken - Twilio Auth Token
   * @returns {Promise<Object>} - Import result with phone number ID
   */
  async importPhoneNumber({ phoneNumber, label, agentId, twilioAccountSid, twilioAuthToken }) {
    if (!await this.isAvailable()) {
      throw new Error('ElevenLabs is not configured');
    }

    if (!this.client) {
      throw new Error('ElevenLabs client is not initialized');
    }

    try {
      logger.info(`Importing phone number ${phoneNumber} to ElevenLabs with agent ${agentId || 'none'}`);
      
      // Import phone number via ElevenLabs API
      // Note: Twilio credentials (sid and token) are required by ElevenLabs to manage the phone number
      const response = await this.client.conversationalAi.phoneNumbers.create({
        provider: 'twilio',
        phoneNumber,
        label,
        sid: twilioAccountSid,
        token: twilioAuthToken,
        supportsInbound: true,
        supportsOutbound: false,
      });

      logger.info(`Phone number ${phoneNumber} imported to ElevenLabs with ID: ${response.phoneNumberId}`);

      // Assign the agent to the phone number if provided
      if (agentId) {
        try {
          await this.client.conversationalAi.phoneNumbers.update(response.phoneNumberId, {
            agentId,
          });
          logger.info(`Agent ${agentId} assigned to phone number ${phoneNumber}`);
        } catch (agentError) {
          // Log the error but don't fail the import - phone number is imported successfully
          logger.error(`Failed to assign agent ${agentId} to phone number ${phoneNumber}: ${agentError.message}`);
          logger.warn('Phone number imported but agent assignment failed. Agent can be assigned later.');
        }
      }

      return {
        phoneNumberId: response.phoneNumberId,
        phoneNumber,
        agentId,
      };
    } catch (error) {
      logger.error(`Failed to import phone number to ElevenLabs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get configuration for ElevenLabs agent
   * @returns {Object} - Agent configuration
   */
  getAgentConfig() {
    return {
      agentId: this.agentId,
      apiKey: this.apiKey ? '****' + this.apiKey.slice(-4) : null,
      baseUrl: this.baseUrl,
      isConfigured: !!(this.apiKey && this.agentId),
    };
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

    // Extract service mentions
    const servicePatterns = ['haircut', 'massage', 'manicure', 'pedicure', 'facial', 'styling', 'color', 'trim'];
    for (const service of servicePatterns) {
      if (input.includes(service)) {
        entities.service = service;
        break;
      }
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
      [INTENT_TYPES.BOOK_APPOINTMENT]: "I'd be happy to help you book an appointment. What service are you interested in?",
      [INTENT_TYPES.CHECK_AVAILABILITY]: "Let me check our availability for you. What date and service were you thinking about?",
      [INTENT_TYPES.CANCEL_APPOINTMENT]: "I can help you cancel your appointment. Could you provide your appointment details or the phone number it was booked under?",
      [INTENT_TYPES.MODIFY_APPOINTMENT]: "I can help you reschedule your appointment. What changes would you like to make?",
      [INTENT_TYPES.GET_SERVICES]: "We offer a variety of services. Would you like me to list them for you?",
      [INTENT_TYPES.GET_HOURS]: "Let me get our business hours for you.",
      [INTENT_TYPES.HUMAN_HANDOFF]: "I'll connect you with a team member right away. Please hold.",
      [INTENT_TYPES.GREETING]: "Hello! Thank you for calling. How can I assist you today?",
      [INTENT_TYPES.GOODBYE]: "Thank you for calling! Have a great day!",
      [INTENT_TYPES.GENERAL_INQUIRY]: "I'm here to help. Could you tell me more about what you need?",
      [INTENT_TYPES.UNKNOWN]: "I'm sorry, I didn't quite catch that. Could you please rephrase?",
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
   * Get default response when ElevenLabs is not configured
   * @param {string} _input - User input (unused)
   * @param {Object} _context - Conversation context (unused)
   * @returns {Object} - Default response
   */
  _getDefaultResponse(_input, _context) {
    return {
      text: "Thank you for calling. Our AI assistant is temporarily unavailable. Please call back later or leave a message.",
      intent: { name: INTENT_TYPES.UNKNOWN, confidence: 0, entities: {} },
      action: { type: ACTION_TYPES.TRANSFER_TO_HUMAN, data: {} },
      shouldHandoff: true,
    };
  }
}

// Singleton instance
let instance = null;

/**
 * Get or create ElevenLabs service instance
 * @param {Object} config - Optional configuration
 * @returns {ElevenLabsService} - Service instance
 */
const getElevenLabsService = (config = {}) => {
  if (!instance) {
    instance = new ElevenLabsService(config);
  }
  return instance;
};

module.exports = {
  ElevenLabsService,
  getElevenLabsService,
};
