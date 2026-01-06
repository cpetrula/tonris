/**
 * ElevenLabsVoice Controller
 * Handles HTTP requests for voice endpoints
 */
const voiceService = require('./elevenlabsVoice.service');
const logger = require('../../utils/logger');

/**
 * Get all voices
 * GET /api/voices
 */
const getAllVoices = async (req, res, next) => {
  try {
    const voices = await voiceService.getAllVoices();
    
    res.status(200).json({
      success: true,
      data: {
        voices,
      },
    });
  } catch (error) {
    logger.error(`Failed to get voices: ${error.message}`);
    next(error);
  }
};

/**
 * Get voice by ID
 * GET /api/voices/:id
 */
const getVoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voice = await voiceService.getVoiceById(id);
    
    res.status(200).json({
      success: true,
      data: {
        voice,
      },
    });
  } catch (error) {
    logger.error(`Failed to get voice: ${error.message}`);
    next(error);
  }
};

/**
 * Generate text-to-speech audio
 * POST /api/voices/:id/test
 * Body: { text: string }
 */
const testVoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required',
        code: 'MISSING_TEXT',
      });
    }

    // Limit text length for safety
    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long (max 500 characters)',
        code: 'TEXT_TOO_LONG',
      });
    }

    const audioBuffer = await voiceService.generateTextToSpeech(id, text);
    
    // Return audio as binary data
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'no-cache',
    });
    
    res.send(audioBuffer);
  } catch (error) {
    logger.error(`Failed to test voice: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllVoices,
  getVoiceById,
  testVoice,
};
