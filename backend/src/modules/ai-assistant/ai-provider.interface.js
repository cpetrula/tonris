/**
 * AI Provider Interface
 * Defines the contract for AI provider implementations
 * This allows swapping different AI providers (ElevenLabs, OpenAI, etc.)
 */

/**
 * @typedef {Object} AIProviderConfig
 * @property {string} apiKey - API key for the provider
 * @property {Object} [options] - Additional provider-specific options
 */

/**
 * @typedef {Object} ConversationContext
 * @property {string} sessionId - Unique session identifier
 * @property {string} tenantId - Tenant identifier
 * @property {Array} history - Conversation history
 * @property {Object} metadata - Additional context metadata
 */

/**
 * @typedef {Object} Intent
 * @property {string} name - Intent name (e.g., 'book_appointment', 'check_availability')
 * @property {number} confidence - Confidence score (0-1)
 * @property {Object} entities - Extracted entities
 */

/**
 * @typedef {Object} AIResponse
 * @property {string} text - Response text
 * @property {Intent} intent - Detected intent
 * @property {Object} [action] - Action to perform
 * @property {boolean} [shouldHandoff] - Whether to handoff to human
 */

/**
 * AI Provider interface
 * All AI providers should implement these methods
 */
class AIProviderInterface {
  /**
   * Initialize the provider
   * @param {AIProviderConfig} config - Provider configuration
   */
  constructor(config) {
    if (this.constructor === AIProviderInterface) {
      throw new Error('AIProviderInterface is an abstract class and cannot be instantiated directly');
    }
    this.config = config;
  }

  /**
   * Process user input and generate a response
   * @param {string} _input - User input text
   * @param {ConversationContext} _context - Conversation context
   * @returns {Promise<AIResponse>} - AI response
   */
  async processInput(_input, _context) {
    throw new Error('Method processInput() must be implemented');
  }

  /**
   * Detect intent from user input
   * @param {string} _input - User input text
   * @param {ConversationContext} _context - Conversation context
   * @returns {Promise<Intent>} - Detected intent
   */
  async detectIntent(_input, _context) {
    throw new Error('Method detectIntent() must be implemented');
  }

  /**
   * Generate text-to-speech audio
   * @param {string} _text - Text to convert to speech
   * @param {Object} _options - TTS options (voice, speed, etc.)
   * @returns {Promise<Buffer>} - Audio buffer
   */
  async textToSpeech(_text, _options) {
    throw new Error('Method textToSpeech() must be implemented');
  }

  /**
   * Transcribe speech to text
   * @param {Buffer} _audio - Audio buffer
   * @param {Object} _options - Transcription options
   * @returns {Promise<string>} - Transcribed text
   */
  async speechToText(_audio, _options) {
    throw new Error('Method speechToText() must be implemented');
  }

  /**
   * Start a conversation session
   * @param {string} _tenantId - Tenant identifier
   * @param {Object} _options - Session options
   * @returns {Promise<ConversationContext>} - New conversation context
   */
  async startSession(_tenantId, _options) {
    throw new Error('Method startSession() must be implemented');
  }

  /**
   * End a conversation session
   * @param {string} _sessionId - Session identifier
   * @returns {Promise<void>}
   */
  async endSession(_sessionId) {
    throw new Error('Method endSession() must be implemented');
  }

  /**
   * Check if the provider is properly configured and available
   * @returns {Promise<boolean>} - True if provider is available
   */
  async isAvailable() {
    throw new Error('Method isAvailable() must be implemented');
  }

  /**
   * Get provider name
   * @returns {string} - Provider name
   */
  getName() {
    throw new Error('Method getName() must be implemented');
  }
}

/**
 * Intent types supported by the AI assistant
 */
const INTENT_TYPES = {
  BOOK_APPOINTMENT: 'book_appointment',
  CHECK_AVAILABILITY: 'check_availability',
  CANCEL_APPOINTMENT: 'cancel_appointment',
  MODIFY_APPOINTMENT: 'modify_appointment',
  GET_SERVICES: 'get_services',
  GET_HOURS: 'get_hours',
  GENERAL_INQUIRY: 'general_inquiry',
  HUMAN_HANDOFF: 'human_handoff',
  GREETING: 'greeting',
  GOODBYE: 'goodbye',
  UNKNOWN: 'unknown',
};

/**
 * Action types that can be performed by the AI assistant
 */
const ACTION_TYPES = {
  QUERY_AVAILABILITY: 'query_availability',
  CREATE_APPOINTMENT: 'create_appointment',
  UPDATE_APPOINTMENT: 'update_appointment',
  CANCEL_APPOINTMENT: 'cancel_appointment',
  GET_SERVICES: 'get_services',
  GET_BUSINESS_HOURS: 'get_business_hours',
  TRANSFER_TO_HUMAN: 'transfer_to_human',
  END_CONVERSATION: 'end_conversation',
  CONTINUE_CONVERSATION: 'continue_conversation',
};

module.exports = {
  AIProviderInterface,
  INTENT_TYPES,
  ACTION_TYPES,
};
