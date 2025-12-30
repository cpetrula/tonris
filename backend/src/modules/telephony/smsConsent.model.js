/**
 * SMS Consent Model
 * Tracks SMS opt-in/opt-out status per phone number per tenant
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Consent status values
 */
const CONSENT_STATUS = {
  OPTED_IN: 'opted_in',
  OPTED_OUT: 'opted_out',
  PENDING: 'pending',
};

const SmsConsent = sequelize.define('SmsConsent', {
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
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'phone_number',
  },
  status: {
    type: DataTypes.ENUM(...Object.values(CONSENT_STATUS)),
    defaultValue: CONSENT_STATUS.PENDING,
    allowNull: false,
  },
  consentedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'consented_at',
    comment: 'When the user opted in',
  },
  optedOutAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'opted_out_at',
    comment: 'When the user opted out',
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Source of consent (voice_call, sms_reply, web_form, etc.)',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional context (call_sid, etc.)',
  },
}, {
  tableName: 'sms_consent',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['tenant_id', 'phone_number'],
      name: 'sms_consent_tenant_phone_unique',
    },
    {
      fields: ['phone_number'],
    },
    {
      fields: ['status'],
    },
  ],
});

/**
 * Check if a phone number has SMS consent for a tenant
 * @param {string} phoneNumber - Phone number to check
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<boolean>} - True if opted in
 */
SmsConsent.hasConsent = async function(phoneNumber, tenantId) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const consent = await this.findOne({
    where: {
      phoneNumber: normalizedPhone,
      tenantId,
    },
  });
  return consent?.status === CONSENT_STATUS.OPTED_IN;
};

/**
 * Record consent status
 * @param {Object} params - Consent parameters
 * @returns {Promise<SmsConsent>} - Created or updated consent record
 */
SmsConsent.recordConsent = async function({ phoneNumber, tenantId, consented, source, metadata }) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  const [consent, created] = await this.findOrCreate({
    where: {
      phoneNumber: normalizedPhone,
      tenantId,
    },
    defaults: {
      phoneNumber: normalizedPhone,
      tenantId,
      status: consented ? CONSENT_STATUS.OPTED_IN : CONSENT_STATUS.OPTED_OUT,
      consentedAt: consented ? new Date() : null,
      optedOutAt: consented ? null : new Date(),
      source,
      metadata,
    },
  });

  if (!created) {
    // Update existing record
    consent.status = consented ? CONSENT_STATUS.OPTED_IN : CONSENT_STATUS.OPTED_OUT;
    if (consented) {
      consent.consentedAt = new Date();
    } else {
      consent.optedOutAt = new Date();
    }
    consent.source = source;
    consent.metadata = { ...consent.metadata, ...metadata };
    await consent.save();
  }

  return consent;
};

/**
 * Get consent record for a phone number
 * @param {string} phoneNumber - Phone number
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<SmsConsent|null>} - Consent record or null
 */
SmsConsent.getConsent = async function(phoneNumber, tenantId) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  return this.findOne({
    where: {
      phoneNumber: normalizedPhone,
      tenantId,
    },
  });
};

/**
 * Normalize phone number for consistent storage
 * @param {string} phoneNumber - Phone number
 * @returns {string} - Normalized phone number
 */
function normalizePhoneNumber(phoneNumber) {
  // Remove all non-digit characters except leading +
  const cleaned = phoneNumber.replace(/[^0-9+]/g, '');

  // Ensure E.164 format for US numbers
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
  SmsConsent,
  CONSENT_STATUS,
};
