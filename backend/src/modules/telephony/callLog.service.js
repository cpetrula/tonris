/**
 * Call Log Service
 * Handles fetching and enriching call logs with ElevenLabs conversation data
 */
const { CallLog, CALL_DIRECTION, CALL_STATUS } = require('./callLog.model');
const { getElevenLabsService } = require('../ai-assistant/elevenlabs.service');
const logger = require('../../utils/logger');
const { Op } = require('sequelize');

/**
 * Get call logs for a tenant with optional ElevenLabs enrichment
 * @param {string} tenantId - Tenant identifier
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of logs to return (default: 50)
 * @param {number} options.offset - Number of logs to skip (default: 0)
 * @param {string} options.direction - Filter by call direction
 * @param {string} options.status - Filter by call status
 * @param {string} options.startDate - Filter by start date (ISO string)
 * @param {string} options.endDate - Filter by end date (ISO string)
 * @param {boolean} options.includeElevenLabsData - Whether to enrich with ElevenLabs data (default: true)
 * @returns {Promise<Object>} - Call logs with pagination info
 */
const getCallLogs = async (tenantId, options = {}) => {
  const {
    limit = 50,
    offset = 0,
    direction,
    status,
    startDate,
    endDate,
    includeElevenLabsData = true,
  } = options;
  
  const where = { tenantId };
  
  if (direction) {
    where.direction = direction;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      where.createdAt[Op.lte] = new Date(endDate);
    }
  }
  
  const callLogs = await CallLog.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  
  let enrichedLogs = callLogs.rows.map(log => log.toSafeObject());
  
  // Enrich with ElevenLabs data if requested
  if (includeElevenLabsData) {
    try {
      enrichedLogs = await enrichCallLogsWithElevenLabs(enrichedLogs, tenantId);
    } catch (error) {
      logger.warn(`Failed to enrich call logs with ElevenLabs data: ${error.message}`);
      // Continue with non-enriched data
    }
  }
  
  return {
    logs: enrichedLogs,
    total: callLogs.count,
    limit,
    offset,
  };
};

/**
 * Enrich call logs with ElevenLabs conversation data
 * @param {Array} callLogs - Array of call log objects
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Array>} - Enriched call logs
 */
const enrichCallLogsWithElevenLabs = async (callLogs, tenantId) => {
  if (!callLogs || callLogs.length === 0) {
    return callLogs;
  }
  
  try {
    const elevenlabsService = getElevenLabsService();
    const isAvailable = await elevenlabsService.isAvailable();
    
    if (!isAvailable) {
      logger.debug('ElevenLabs not configured, skipping enrichment');
      return callLogs;
    }
    
    // Get the date range from call logs - use startedAt if available, otherwise createdAt
    const dates = callLogs.map(log => {
      const timestamp = log.startedAt || log.createdAt;
      return new Date(timestamp).getTime() / 1000;
    });
    
    // Guard against empty dates array
    if (dates.length === 0) {
      return callLogs;
    }
    
    const startTimeUnixSecs = Math.min(...dates) - 3600; // Add 1 hour buffer
    const endTimeUnixSecs = Math.max(...dates) + 3600;
    
    // Fetch ElevenLabs conversations for this time range
    // Note: This fetches up to 100 conversations. For more, implement pagination.
    const conversationsResult = await elevenlabsService.listConversations({
      startTimeUnixSecs,
      endTimeUnixSecs,
      pageSize: 100,
    });
    
    const conversations = conversationsResult.conversations || [];
    
    // Create a map of conversations by call_sid or phone number + time range for quick lookup
    const conversationMap = new Map();
    
    conversations.forEach(conv => {
      // ElevenLabs stores metadata about the call
      const callSid = conv.metadata?.call_sid || conv.metadata?.callSid;
      const callerNumber = conv.metadata?.caller_number || conv.metadata?.from;
      
      if (callSid) {
        conversationMap.set(callSid, conv);
      }
      
      // Also map by caller number and approximate timestamp with a time window
      if (callerNumber && conv.metadata?.start_time_unix_secs) {
        // Create multiple keys for a ±30 second time window to handle timing differences
        const convTime = conv.metadata.start_time_unix_secs;
        for (let offset = -30; offset <= 30; offset += 5) {
          const key = `${callerNumber}_${convTime + offset}`;
          if (!conversationMap.has(key)) {
            conversationMap.set(key, conv);
          }
        }
      }
    });
    
    // Enrich each call log
    const enrichedLogs = callLogs.map(log => {
      let elevenLabsData = null;
      
      // Try to find matching conversation by Twilio Call SID (most reliable)
      if (log.twilioCallSid) {
        elevenLabsData = conversationMap.get(log.twilioCallSid);
      }
      
      // If not found, try matching by phone number and time with a time window
      if (!elevenLabsData && log.fromNumber) {
        // Use startedAt if available for more accurate matching
        const timestamp = log.startedAt || log.createdAt;
        const logTime = Math.floor(new Date(timestamp).getTime() / 1000);
        
        // Try to find a match within a ±30 second window
        for (let offset = -30; offset <= 30 && !elevenLabsData; offset += 5) {
          const key = `${log.fromNumber}_${logTime + offset}`;
          elevenLabsData = conversationMap.get(key);
        }
      }
      
      if (elevenLabsData) {
        return {
          ...log,
          elevenLabsConversationId: elevenLabsData.conversation_id,
          elevenLabsData: {
            conversationId: elevenLabsData.conversation_id,
            agentId: elevenLabsData.agent_id,
            status: elevenLabsData.status,
            callSuccessful: elevenLabsData.call_successful,
            callDurationSecs: elevenLabsData.call_duration_secs,
            messageCount: elevenLabsData.message_count,
            transcriptSummary: elevenLabsData.transcript_summary,
            userSatisfactionRating: elevenLabsData.user_satisfaction_rating,
            endReason: elevenLabsData.end_reason,
            startTimeUnixSecs: elevenLabsData.metadata?.start_time_unix_secs,
          },
        };
      }
      
      return log;
    });
    
    logger.info(`Enriched ${enrichedLogs.filter(log => log.elevenLabsData).length} of ${callLogs.length} call logs with ElevenLabs data`);
    
    return enrichedLogs;
  } catch (error) {
    logger.error(`Error enriching call logs with ElevenLabs: ${error.message}`);
    throw error;
  }
};

/**
 * Get detailed conversation data for a specific call log
 * @param {string} callLogId - Call log ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Call log with detailed ElevenLabs conversation
 */
const getCallLogWithDetails = async (callLogId, tenantId) => {
  const callLog = await CallLog.findOne({
    where: {
      id: callLogId,
      tenantId,
    },
  });
  
  if (!callLog) {
    throw new Error('Call log not found');
  }
  
  const logData = callLog.toSafeObject();
  
  // Check if we have an ElevenLabs conversation ID in metadata
  const conversationId = callLog.metadata?.elevenLabsConversationId;
  
  if (conversationId) {
    try {
      const elevenlabsService = getElevenLabsService();
      const conversationDetails = await elevenlabsService.getConversationDetails(conversationId);
      
      logData.elevenLabsConversation = {
        conversationId: conversationDetails.conversation_id,
        agentId: conversationDetails.agent_id,
        status: conversationDetails.status,
        transcript: conversationDetails.transcript,
        metadata: conversationDetails.metadata,
        hasAudio: conversationDetails.has_audio,
      };
    } catch (error) {
      logger.error(`Failed to fetch ElevenLabs conversation details: ${error.message}`);
    }
  }
  
  return logData;
};

/**
 * Sync call logs with ElevenLabs conversations
 * Updates existing call logs with ElevenLabs conversation IDs
 * @param {string} tenantId - Tenant identifier
 * @param {Object} options - Sync options
 * @returns {Promise<Object>} - Sync results
 */
const syncWithElevenLabs = async (tenantId, options = {}) => {
  const { daysBack = 7 } = options;
  
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    // Get call logs from the past N days
    const callLogs = await CallLog.findAll({
      where: {
        tenantId,
        createdAt: {
          [Op.gte]: startDate,
        },
      },
      order: [['createdAt', 'DESC']],
    });
    
    if (callLogs.length === 0) {
      return { synced: 0, total: 0, message: 'No call logs to sync' };
    }
    
    const elevenlabsService = getElevenLabsService();
    const isAvailable = await elevenlabsService.isAvailable();
    
    if (!isAvailable) {
      throw new Error('ElevenLabs not configured');
    }
    
    // Fetch ElevenLabs conversations
    const startTimeUnixSecs = Math.floor(startDate.getTime() / 1000);
    const conversationsResult = await elevenlabsService.listConversations({
      startTimeUnixSecs,
      pageSize: 100,
    });
    
    const conversations = conversationsResult.conversations || [];
    
    // Create lookup map
    const conversationMap = new Map();
    conversations.forEach(conv => {
      const callSid = conv.metadata?.call_sid || conv.metadata?.callSid;
      if (callSid) {
        conversationMap.set(callSid, conv);
      }
    });
    
    // Update call logs with conversation IDs
    let syncedCount = 0;
    
    for (const callLog of callLogs) {
      const conversation = conversationMap.get(callLog.twilioCallSid);
      
      if (conversation && !callLog.metadata?.elevenLabsConversationId) {
        callLog.metadata = {
          ...callLog.metadata,
          elevenLabsConversationId: conversation.conversation_id,
          elevenLabsAgentId: conversation.agent_id,
        };
        
        await callLog.save();
        syncedCount++;
      }
    }
    
    logger.info(`Synced ${syncedCount} of ${callLogs.length} call logs with ElevenLabs`);
    
    return {
      synced: syncedCount,
      total: callLogs.length,
      message: `Successfully synced ${syncedCount} call logs`,
    };
  } catch (error) {
    logger.error(`Error syncing call logs with ElevenLabs: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getCallLogs,
  enrichCallLogsWithElevenLabs,
  getCallLogWithDetails,
  syncWithElevenLabs,
};
