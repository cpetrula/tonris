/**
 * SMS Message Model
 * Stores sent and received SMS messages for audit trail
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Message direction
 */
const MESSAGE_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
};

/**
 * Message status values (from Twilio)
 */
const MESSAGE_STATUS = {
  QUEUED: 'queued',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  UNDELIVERED: 'undelivered',
  RECEIVED: 'received',
};

/**
 * Parsed intent from incoming messages
 */
const MESSAGE_INTENT = {
  STOP: 'stop',
  START: 'start',
  HELP: 'help',
  CONFIRM: 'confirm',
  CANCEL: 'cancel',
  YES: 'yes',
  NO: 'no',
  OTHER: 'other',
};

const SmsMessage = sequelize.define('SmsMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id',
    },
  },
  twilioMessageSid: {
    type: DataTypes.STRING(64),
    allowNull: true,
    unique: true,
    field: 'twilio_message_sid',
  },
  direction: {
    type: DataTypes.ENUM(...Object.values(MESSAGE_DIRECTION)),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(...Object.values(MESSAGE_STATUS)),
    defaultValue: MESSAGE_STATUS.QUEUED,
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
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  messageType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'message_type',
    comment: 'Type of message (appointment_reminder, confirmation, etc.)',
  },
  parsedIntent: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'parsed_intent',
    comment: 'Detected intent for inbound messages',
  },
  errorCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'error_code',
    comment: 'Twilio error code if failed',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message',
    comment: 'Error message if failed',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional context (appointment_id, etc.)',
  },
}, {
  tableName: 'sms_messages',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['twilio_message_sid'],
    },
    {
      fields: ['from_number'],
    },
    {
      fields: ['to_number'],
    },
    {
      fields: ['direction'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

/**
 * Log an outbound message
 * @param {Object} params - Message parameters
 * @returns {Promise<SmsMessage>} - Created message record
 */
SmsMessage.logOutbound = async function({ tenantId, from, to, body, type, twilioSid, metadata }) {
  return this.create({
    tenantId,
    twilioMessageSid: twilioSid,
    direction: MESSAGE_DIRECTION.OUTBOUND,
    status: twilioSid ? MESSAGE_STATUS.SENT : MESSAGE_STATUS.QUEUED,
    fromNumber: from,
    toNumber: to,
    body,
    messageType: type,
    metadata,
  });
};

/**
 * Log an inbound message
 * @param {Object} params - Message parameters
 * @returns {Promise<SmsMessage>} - Created message record
 */
SmsMessage.logInbound = async function({ tenantId, from, to, body, twilioSid, parsedIntent, metadata }) {
  return this.create({
    tenantId,
    twilioMessageSid: twilioSid,
    direction: MESSAGE_DIRECTION.INBOUND,
    status: MESSAGE_STATUS.RECEIVED,
    fromNumber: from,
    toNumber: to,
    body,
    parsedIntent,
    metadata,
  });
};

/**
 * Update message status from Twilio webhook
 * @param {string} twilioSid - Twilio message SID
 * @param {Object} statusData - Status update data
 * @returns {Promise<SmsMessage|null>} - Updated message or null
 */
SmsMessage.updateStatus = async function(twilioSid, { status, errorCode, errorMessage }) {
  const message = await this.findOne({
    where: { twilioMessageSid: twilioSid },
  });

  if (message) {
    message.status = status;
    if (errorCode) message.errorCode = errorCode;
    if (errorMessage) message.errorMessage = errorMessage;
    await message.save();
  }

  return message;
};

/**
 * Get message history for a phone number
 * @param {string} phoneNumber - Phone number (from or to)
 * @param {string} tenantId - Tenant ID
 * @param {number} limit - Max messages to return
 * @returns {Promise<SmsMessage[]>} - Message history
 */
SmsMessage.getConversation = async function(phoneNumber, tenantId, limit = 100) {
  const { Op } = require('sequelize');
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  return this.findAll({
    where: {
      tenantId,
      [Op.or]: [
        { fromNumber: normalizedPhone },
        { toNumber: normalizedPhone },
      ],
    },
    order: [['createdAt', 'ASC']],
    limit,
  });
};

/**
 * Normalize phone number
 * @param {string} phoneNumber - Phone number
 * @returns {string} - Normalized phone number
 */
function normalizePhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  return cleaned;
}

module.exports = {
  SmsMessage,
  MESSAGE_DIRECTION,
  MESSAGE_STATUS,
  MESSAGE_INTENT,
};
