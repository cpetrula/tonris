/**
 * ElevenLabsVoice Model
 * Defines the ElevenLabsVoice schema for voice configurations
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const ElevenLabsVoice = sequelize.define('ElevenLabsVoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  elevenlabsVoiceId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'elevenlabs_voice_id',
    validate: {
      len: [1, 50],
    },
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'elevenlabs_voices',
  timestamps: true,
});

/**
 * Get voice data safe for API response
 * @returns {Object} - Voice data
 */
ElevenLabsVoice.prototype.toSafeObject = function() {
  return this.toJSON();
};

module.exports = {
  ElevenLabsVoice,
};
