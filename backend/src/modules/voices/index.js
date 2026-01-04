/**
 * Voice Module
 * Exports voice-related services and models
 */
const { ElevenLabsVoice } = require('./elevenlabsVoice.model');
const voiceService = require('./elevenlabsVoice.service');
const voiceRoutes = require('./elevenlabsVoice.routes');

module.exports = {
  ElevenLabsVoice,
  voiceService,
  voiceRoutes,
};
