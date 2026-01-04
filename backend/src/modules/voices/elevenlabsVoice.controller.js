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

module.exports = {
  getAllVoices,
  getVoiceById,
};
