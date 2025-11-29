/**
 * AI Assistant Module Index
 * Central export for AI assistant module
 */
const aiRoutes = require('./ai.routes');
const aiController = require('./ai.controller');
const { ElevenLabsService, getElevenLabsService } = require('./elevenlabs.service');
const { OpenAIService, getOpenAIService } = require('./openai.service');
const { handleIntent } = require('./intent.handler');
const {
  handleTwilioToElevenLabs,
  handleElevenLabsToolCall,
  generateElevenLabsConnectTwiml,
} = require('./twilio-elevenlabs.handler');
const {
  AIProviderInterface,
  INTENT_TYPES,
  ACTION_TYPES,
} = require('./ai-provider.interface');

module.exports = {
  aiRoutes,
  aiController,
  ElevenLabsService,
  getElevenLabsService,
  OpenAIService,
  getOpenAIService,
  handleIntent,
  handleTwilioToElevenLabs,
  handleElevenLabsToolCall,
  generateElevenLabsConnectTwiml,
  AIProviderInterface,
  INTENT_TYPES,
  ACTION_TYPES,
};
