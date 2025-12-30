/**
 * Call Summary Service
 * Generates AI-powered summaries of call transcripts using OpenAI
 * Ported from bolt-ai-node
 */
const env = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Call summary result structure
 */
const SENTIMENT_TYPES = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
};

/**
 * Lead quality levels
 */
const LEAD_QUALITY = {
  HOT: 'hot',           // Ready to buy/book
  WARM: 'warm',         // Interested
  COLD: 'cold',         // Just browsing
  NOT_A_LEAD: 'not_a_lead', // Wrong number, spam, etc.
};

/**
 * Generate an AI summary for a call transcript
 * @param {string} transcript - The call transcript text
 * @param {Object} options - Additional options
 * @param {string} options.businessName - Name of the business
 * @param {string} options.agentName - Name of the AI agent
 * @returns {Promise<Object|null>} - Summary object or null on failure
 */
const generateCallSummary = async (transcript, options = {}) => {
  const { businessName = 'Unknown', agentName = 'AI Assistant' } = options;

  if (!env.OPENAI_API_KEY) {
    logger.warn('[CallSummary] OPENAI_API_KEY not configured');
    return null;
  }

  if (!transcript || transcript.trim().length < 50) {
    logger.debug('[CallSummary] Transcript too short to summarize');
    return null;
  }

  try {
    const prompt = `Analyze this phone call transcript and extract information.

Business: ${businessName}
Agent: ${agentName}

Transcript:
${transcript}

Extract the following information. Be very careful to distinguish between the CALLER (customer) and the ASSISTANT (AI agent). Only extract information that the CALLER explicitly stated about themselves.

Respond with a JSON object containing:
{
  "summary": "2-3 sentence summary of the call's purpose and outcome",
  "sentiment": "positive" | "neutral" | "negative" (caller's overall sentiment),
  "keyTopics": ["array of 2-4 main topics discussed"],
  "actionItems": ["array of any follow-up actions needed, or empty array"],
  "leadQuality": "hot" (ready to buy/book) | "warm" (interested) | "cold" (just browsing) | "not_a_lead" (wrong number, spam, etc),
  "appointmentBooked": true/false,
  "followUpNeeded": true/false,
  "callerName": "The caller's name if they stated it, or null if not mentioned",
  "callerEmail": "The caller's email if they provided it, or null if not mentioned",
  "callerCompany": "The caller's company/business name if mentioned, or null if not mentioned",
  "callerIntent": "Brief description of what the caller wanted (e.g., 'book appointment', 'get pricing', 'ask about services')"
}

IMPORTANT:
- Only include callerName if the CALLER explicitly said their name (e.g., "My name is John", "I'm Sarah")
- Do NOT confuse the assistant's name or business name with the caller's name
- If unsure, use null rather than guessing
- Only respond with the JSON object, no other text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error(`[CallSummary] OpenAI API error: ${response.status} - ${error}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      logger.error('[CallSummary] Unexpected response format');
      return null;
    }

    // Parse the JSON response
    const summary = JSON.parse(content);
    logger.info(`[CallSummary] Generated summary: ${summary.summary?.substring(0, 100)}...`);

    return {
      summary: summary.summary,
      sentiment: summary.sentiment,
      keyTopics: summary.keyTopics || [],
      actionItems: summary.actionItems || [],
      leadQuality: summary.leadQuality,
      appointmentBooked: summary.appointmentBooked || false,
      followUpNeeded: summary.followUpNeeded || false,
      callerName: summary.callerName || null,
      callerEmail: summary.callerEmail || null,
      callerCompany: summary.callerCompany || null,
      callerIntent: summary.callerIntent || null,
    };
  } catch (error) {
    logger.error(`[CallSummary] Error generating summary: ${error.message}`);
    return null;
  }
};

/**
 * Update a call log with summary data
 * @param {Object} CallLog - CallLog model
 * @param {string} callSid - Twilio call SID
 * @param {Object} summary - Generated summary
 * @returns {Promise<boolean>} - Success status
 */
const storeCallSummary = async (CallLog, callSid, summary) => {
  try {
    const callLog = await CallLog.findOne({
      where: { twilioCallSid: callSid },
    });

    if (!callLog) {
      logger.warn(`[CallSummary] Call log not found for ${callSid}`);
      return false;
    }

    // Store summary in metadata
    callLog.metadata = {
      ...callLog.metadata,
      aiSummary: summary.summary,
      aiSentiment: summary.sentiment,
      aiKeyTopics: summary.keyTopics,
      aiActionItems: summary.actionItems,
      aiLeadQuality: summary.leadQuality,
      aiAppointmentBooked: summary.appointmentBooked,
      aiFollowUpNeeded: summary.followUpNeeded,
      aiCallerName: summary.callerName,
      aiCallerEmail: summary.callerEmail,
      aiCallerCompany: summary.callerCompany,
      aiCallerIntent: summary.callerIntent,
      summarizedAt: new Date().toISOString(),
    };

    await callLog.save();
    logger.info(`[CallSummary] Stored summary for call ${callSid}`);
    return true;
  } catch (error) {
    logger.error(`[CallSummary] Error storing summary: ${error.message}`);
    return false;
  }
};

/**
 * Update a Lead record with summary analysis
 * @param {Object} Lead - Lead model
 * @param {string} leadId - Lead ID
 * @param {Object} summary - Generated summary
 * @returns {Promise<boolean>} - Success status
 */
const updateLeadFromSummary = async (Lead, leadId, summary) => {
  try {
    const lead = await Lead.findByPk(leadId);

    if (!lead) {
      logger.warn(`[CallSummary] Lead not found: ${leadId}`);
      return false;
    }

    // Update lead with AI analysis
    if (summary.callerName && !lead.customerName) {
      lead.customerName = summary.callerName;
    }
    if (summary.callerEmail && !lead.customerEmail) {
      lead.customerEmail = summary.callerEmail;
    }
    if (summary.callerCompany && !lead.companyName) {
      lead.companyName = summary.callerCompany;
    }
    if (summary.leadQuality) {
      lead.quality = summary.leadQuality;
    }
    if (summary.appointmentBooked !== undefined) {
      lead.appointmentBooked = summary.appointmentBooked;
    }
    if (summary.followUpNeeded !== undefined) {
      lead.needsFollowUp = summary.followUpNeeded;
    }
    if (summary.summary) {
      lead.conversationSummary = summary.summary;
    }
    if (summary.keyTopics) {
      lead.topicsDiscussed = summary.keyTopics;
    }
    if (summary.actionItems?.length > 0) {
      lead.followUpNotes = summary.actionItems.join('; ');
    }

    // Store full analysis in extraction data
    lead.extractionData = {
      ...lead.extractionData,
      aiAnalysis: {
        sentiment: summary.sentiment,
        callerIntent: summary.callerIntent,
        actionItems: summary.actionItems,
        analyzedAt: new Date().toISOString(),
      },
    };

    await lead.save();
    logger.info(`[CallSummary] Updated lead ${leadId} from summary`);
    return true;
  } catch (error) {
    logger.error(`[CallSummary] Error updating lead: ${error.message}`);
    return false;
  }
};

/**
 * Process a completed call - generate summary and update records
 * @param {Object} params - Processing parameters
 * @param {string} params.callSid - Twilio call SID
 * @param {string} params.transcript - Call transcript
 * @param {string} params.businessName - Business name
 * @param {string} params.agentName - Agent name
 * @param {Object} params.CallLog - CallLog model
 * @param {Object} params.Lead - Lead model (optional)
 * @param {string} params.leadId - Lead ID (optional)
 * @returns {Promise<Object|null>} - Generated summary or null
 */
const processCallForSummary = async (params) => {
  const {
    callSid,
    transcript,
    businessName,
    agentName,
    CallLog,
    Lead,
    leadId,
  } = params;

  // Generate the summary
  const summary = await generateCallSummary(transcript, {
    businessName,
    agentName,
  });

  if (!summary) {
    return null;
  }

  // Store in call log
  if (CallLog && callSid) {
    await storeCallSummary(CallLog, callSid, summary);
  }

  // Update lead if provided
  if (Lead && leadId) {
    await updateLeadFromSummary(Lead, leadId, summary);
  }

  return summary;
};

/**
 * Format a transcript array into readable text
 * @param {Array} transcriptArray - Array of {role, content} objects
 * @returns {string} - Formatted transcript
 */
const formatTranscript = (transcriptArray) => {
  if (!Array.isArray(transcriptArray)) {
    return String(transcriptArray);
  }

  return transcriptArray
    .map(turn => {
      const speaker = turn.role === 'user' ? 'Caller' : 'Assistant';
      return `${speaker}: ${turn.content}`;
    })
    .join('\n\n');
};

/**
 * Check if call summary service is available
 * @returns {boolean} - True if OpenAI is configured
 */
const isAvailable = () => {
  return !!env.OPENAI_API_KEY;
};

module.exports = {
  generateCallSummary,
  storeCallSummary,
  updateLeadFromSummary,
  processCallForSummary,
  formatTranscript,
  isAvailable,
  SENTIMENT_TYPES,
  LEAD_QUALITY,
};
