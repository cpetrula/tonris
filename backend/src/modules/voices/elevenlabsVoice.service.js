/**
 * ElevenLabsVoice Service
 * Handles all voice business logic
 */
const { ElevenLabsVoice } = require('./elevenlabsVoice.model');
const { AppError } = require('../../middleware/errorHandler');

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

module.exports = {
  getAllVoices,
  getVoiceById,
};
