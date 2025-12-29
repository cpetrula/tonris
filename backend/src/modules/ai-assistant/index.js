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
  handleConversationInitiation,
  generateElevenLabsConnectTwiml,
} = require('./twilio-elevenlabs.handler');
const {
  handleMediaStreamConnection,
  getActiveStreamCount,
  getActiveStream,
  getAllActiveStreams,
  forceCloseStream,
  forceCloseAllStreams,
} = require('./media-stream.handler');
const {
  AIProviderInterface,
  INTENT_TYPES,
  ACTION_TYPES,
} = require('./ai-provider.interface');
const {
  Lead,
  LEAD_QUALITY,
  LEAD_SOURCE,
  CONTACT_PREFERENCE,
} = require('./lead.model');
const leadExtractionService = require('./leadExtraction.service');
const callSummaryService = require('./callSummary.service');

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
  handleConversationInitiation,
  generateElevenLabsConnectTwiml,
  handleMediaStreamConnection,
  getActiveStreamCount,
  getActiveStream,
  getAllActiveStreams,
  forceCloseStream,
  forceCloseAllStreams,
  AIProviderInterface,
  INTENT_TYPES,
  ACTION_TYPES,
  Lead,
  LEAD_QUALITY,
  LEAD_SOURCE,
  CONTACT_PREFERENCE,
  leadExtractionService,
  callSummaryService,
};
