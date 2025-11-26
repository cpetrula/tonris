/**
 * Call Log Model
 * Defines the CallLog schema for storing call metadata
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Valid call directions
 */
const CALL_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
};

/**
 * Valid call statuses
 */
const CALL_STATUS = {
  INITIATED: 'initiated',
  RINGING: 'ringing',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  BUSY: 'busy',
  NO_ANSWER: 'no-answer',
  CANCELED: 'canceled',
  FAILED: 'failed',
};

const CallLog = sequelize.define('CallLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.STRING(64),
    allowNull: false,
    field: 'tenant_id',
    validate: {
      is: /^[a-zA-Z0-9_-]+$/,
      len: [1, 64],
    },
  },
  twilioCallSid: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    field: 'twilio_call_sid',
  },
  direction: {
    type: DataTypes.ENUM(...Object.values(CALL_DIRECTION)),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(CALL_STATUS)),
    defaultValue: CALL_STATUS.INITIATED,
    allowNull: false,
  },
  fromNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'from_number',
  },
  toNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'to_number',
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Call duration in seconds',
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'started_at',
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'ended_at',
  },
  recordingUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'recording_url',
  },
  transcription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'call_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['twilio_call_sid'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

/**
 * Get call log data safe for API response
 * @returns {Object} - Call log data
 */
CallLog.prototype.toSafeObject = function() {
  return this.toJSON();
};

/**
 * Update call log from Twilio webhook data
 * @param {Object} twilioData - Data from Twilio webhook
 * @returns {Promise<CallLog>} - Updated call log
 */
CallLog.prototype.updateFromTwilio = async function(twilioData) {
  if (twilioData.CallStatus) {
    this.status = twilioData.CallStatus;
  }
  if (twilioData.CallDuration) {
    this.duration = parseInt(twilioData.CallDuration, 10);
  }
  if (twilioData.RecordingUrl) {
    this.recordingUrl = twilioData.RecordingUrl;
  }
  await this.save();
  return this;
};

module.exports = {
  CallLog,
  CALL_DIRECTION,
  CALL_STATUS,
};
