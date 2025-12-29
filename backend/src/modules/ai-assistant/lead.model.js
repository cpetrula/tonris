/**
 * Lead Model
 * Stores lead information extracted from AI conversations
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

/**
 * Lead quality score
 */
const LEAD_QUALITY = {
  HOT: 'hot',           // Ready to book/buy
  WARM: 'warm',         // Interested but needs nurturing
  COLD: 'cold',         // Low intent
  NOT_A_LEAD: 'not_a_lead', // Just asking questions
};

/**
 * Lead source
 */
const LEAD_SOURCE = {
  INBOUND_CALL: 'inbound_call',
  OUTBOUND_CALL: 'outbound_call',
  SMS: 'sms',
  WEB_FORM: 'web_form',
  CHAT: 'chat',
};

/**
 * Contact preference
 */
const CONTACT_PREFERENCE = {
  CALL: 'call',
  EMAIL: 'email',
  SMS: 'sms',
  ANY: 'any',
};

const Lead = sequelize.define('Lead', {
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
  callLogId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'call_log_id',
    references: {
      model: 'call_logs',
      key: 'id',
    },
    comment: 'Associated call log if from a call',
  },
  // Customer information
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'customer_name',
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'customer_email',
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'customer_phone',
  },
  // Business information
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'company_name',
  },
  businessType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'business_type',
  },
  // Lead metadata
  source: {
    type: DataTypes.ENUM(...Object.values(LEAD_SOURCE)),
    allowNull: false,
    defaultValue: LEAD_SOURCE.INBOUND_CALL,
  },
  quality: {
    type: DataTypes.ENUM(...Object.values(LEAD_QUALITY)),
    allowNull: true,
    comment: 'Lead quality score from AI analysis',
  },
  contactPreference: {
    type: DataTypes.ENUM(...Object.values(CONTACT_PREFERENCE)),
    allowNull: true,
    field: 'contact_preference',
  },
  // SMS consent
  smsConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'sms_consent',
  },
  smsConsentConfirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'sms_consent_confirmed',
    defaultValue: false,
  },
  // Appointment info
  appointmentBooked: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'appointment_booked',
    defaultValue: false,
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'appointment_id',
    references: {
      model: 'appointments',
      key: 'id',
    },
  },
  // Notes and context
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Free-form notes about the lead',
  },
  conversationSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'conversation_summary',
    comment: 'AI-generated summary of the conversation',
  },
  topicsDiscussed: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'topics_discussed',
    defaultValue: [],
  },
  // Follow-up
  needsFollowUp: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'needs_follow_up',
    defaultValue: false,
  },
  followUpNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'follow_up_notes',
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'follow_up_date',
  },
  // Raw extraction data
  extractionData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'extraction_data',
    comment: 'Raw data from lead extraction process',
  },
}, {
  tableName: 'leads',
  timestamps: true,
  indexes: [
    {
      fields: ['tenant_id'],
    },
    {
      fields: ['call_log_id'],
    },
    {
      fields: ['customer_email'],
    },
    {
      fields: ['customer_phone'],
    },
    {
      fields: ['quality'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['needs_follow_up'],
    },
  ],
});

/**
 * Create lead from extracted data
 * @param {Object} data - Lead data
 * @returns {Promise<Lead>} - Created lead
 */
Lead.createFromExtraction = async function(data) {
  const {
    tenantId,
    callLogId,
    customerName,
    customerEmail,
    customerPhone,
    companyName,
    businessType,
    source = LEAD_SOURCE.INBOUND_CALL,
    contactPreference,
    smsConsent,
    smsConsentConfirmed,
    extractionData,
  } = data;

  return this.create({
    tenantId,
    callLogId,
    customerName,
    customerEmail,
    customerPhone,
    companyName,
    businessType,
    source,
    contactPreference,
    smsConsent,
    smsConsentConfirmed,
    extractionData,
  });
};

/**
 * Update lead quality from AI analysis
 * @param {string} leadId - Lead ID
 * @param {Object} analysisData - AI analysis result
 * @returns {Promise<Lead>} - Updated lead
 */
Lead.updateFromAnalysis = async function(leadId, analysisData) {
  const lead = await this.findByPk(leadId);
  if (!lead) return null;

  const {
    quality,
    conversationSummary,
    topicsDiscussed,
    needsFollowUp,
    followUpNotes,
    sentiment,
  } = analysisData;

  if (quality) lead.quality = quality;
  if (conversationSummary) lead.conversationSummary = conversationSummary;
  if (topicsDiscussed) lead.topicsDiscussed = topicsDiscussed;
  if (needsFollowUp !== undefined) lead.needsFollowUp = needsFollowUp;
  if (followUpNotes) lead.followUpNotes = followUpNotes;

  // Store sentiment in extraction data
  if (sentiment) {
    lead.extractionData = {
      ...lead.extractionData,
      sentiment,
    };
  }

  await lead.save();
  return lead;
};

/**
 * Get leads needing follow-up
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Lead[]>} - Leads needing follow-up
 */
Lead.getLeadsNeedingFollowUp = async function(tenantId) {
  const { Op } = require('sequelize');

  return this.findAll({
    where: {
      tenantId,
      needsFollowUp: true,
      [Op.or]: [
        { followUpDate: null },
        { followUpDate: { [Op.lte]: new Date() } },
      ],
    },
    order: [['createdAt', 'DESC']],
  });
};

module.exports = {
  Lead,
  LEAD_QUALITY,
  LEAD_SOURCE,
  CONTACT_PREFERENCE,
};
