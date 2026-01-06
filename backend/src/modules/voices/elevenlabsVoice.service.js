/**
 * ElevenLabsVoice Service
 * Handles all voice business logic
 */
const { ElevenLabsVoice } = require('./elevenlabsVoice.model');
const { AppError } = require('../../middleware/errorHandler');
const { getElevenLabsService } = require('../ai-assistant/elevenlabs.service');
const logger = require('../../utils/logger');

/**
 * Get all voices
 * @returns {Promise<Array>} - List of all voices
 */
const getAllVoices = async () => {
  const voices = await ElevenLabsVoice.findAll({
    order: [['label', 'ASC']],
  });

  return voices.map(voice => voice.toSafeObject());
};

/**
 * Get voice by ID
 * @param {string} id - Voice ID
 * @returns {Promise<Object>} - Voice data
 */
const getVoiceById = async (id) => {
  const voice = await ElevenLabsVoice.findByPk(id);
  
  if (!voice) {
    throw new AppError('Voice not found', 404, 'VOICE_NOT_FOUND');
  }

  return voice.toSafeObject();
};

/**
 * Generate text-to-speech audio for a given text and voice
 * @param {string} voiceId - Voice ID from database
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Buffer>} - Audio buffer
 */
const generateTextToSpeech = async (voiceId, text) => {
  // Get voice from database to retrieve elevenlabsVoiceId
  const voice = await ElevenLabsVoice.findByPk(voiceId);
  
  if (!voice) {
    throw new AppError('Voice not found', 404, 'VOICE_NOT_FOUND');
  }

  // Get ElevenLabs service
  const elevenLabsService = getElevenLabsService();
  
  if (!await elevenLabsService.isAvailable()) {
    throw new AppError('ElevenLabs service is not configured', 503, 'SERVICE_UNAVAILABLE');
  }

  const client = elevenLabsService.getClient();
  if (!client) {
    throw new AppError('ElevenLabs client is not initialized', 503, 'SERVICE_UNAVAILABLE');
  }

  try {
    logger.info(`Generating TTS for voice: ${voice.label} (${voice.elevenlabsVoiceId}), text length: ${text.length}`);
    
    // Use the ElevenLabs SDK to generate speech
    const audioStream = await client.textToSpeech.convert(voice.elevenlabsVoiceId, {
      text,
      model_id: 'eleven_turbo_v2_5',
      output_format: 'mp3_44100_128',
    });

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    logger.info(`TTS audio generated successfully, size: ${audioBuffer.length} bytes`);
    
    return audioBuffer;
  } catch (error) {
    logger.error(`Failed to generate TTS: ${error.message}`);
    throw new AppError('Failed to generate speech', 500, 'TTS_GENERATION_FAILED');
  }
};

module.exports = {
  getAllVoices,
  getVoiceById,
  generateTextToSpeech,
};
