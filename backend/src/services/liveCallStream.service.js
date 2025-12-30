/**
 * Live Call Stream Service
 * Provides real-time updates to connected dashboard clients via WebSocket
 * Ported from bolt-ai-node
 */
const WebSocket = require('ws');
const logger = require('../utils/logger');

/**
 * Update types for live call streaming
 */
const UPDATE_TYPES = {
  CALL_STARTED: 'call_started',
  TRANSCRIPT: 'transcript',
  CALL_ENDED: 'call_ended',
  CALL_LIST: 'call_list',
};

/**
 * Live Call Stream Service
 * Manages WebSocket clients and broadcasts call events
 */
class LiveCallStreamService {
  constructor() {
    this.clients = new Set();
    this.activeCalls = new Map();
  }

  /**
   * Add a dashboard client to receive updates
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} tenantId - Optional tenant ID to filter updates
   */
  addClient(ws, tenantId = null) {
    // Store client with optional tenant filter
    const clientInfo = { ws, tenantId };
    this.clients.add(clientInfo);
    logger.info(`[LiveStream] Client connected. Total: ${this.clients.size}${tenantId ? ` (tenant: ${tenantId})` : ''}`);

    // Send current active calls to newly connected client
    this.sendToClient(clientInfo, {
      type: UPDATE_TYPES.CALL_LIST,
      callSid: 'system',
      timestamp: new Date().toISOString(),
      data: {
        activeCalls: this.getActiveCalls(tenantId),
      },
    });

    // Handle client disconnect
    ws.on('close', () => {
      this.clients.delete(clientInfo);
      logger.info(`[LiveStream] Client disconnected. Total: ${this.clients.size}`);
    });

    ws.on('error', (error) => {
      logger.error(`[LiveStream] Client WebSocket error: ${error.message}`);
      this.clients.delete(clientInfo);
    });
  }

  /**
   * Notify clients when a call starts
   * @param {Object} session - Call session info
   */
  callStarted(session) {
    const {
      callSid,
      callerNumber,
      tenantId,
      tenantName,
      agentName,
      startTime,
    } = session;

    const summary = {
      callSid,
      callerNumber: callerNumber || 'Unknown',
      tenantId,
      tenantName: tenantName || '',
      agentName: agentName || 'AI Assistant',
      startTime: startTime instanceof Date ? startTime.toISOString() : new Date().toISOString(),
      transcriptPreview: '',
      turnCount: 0,
    };

    this.activeCalls.set(callSid, summary);

    this.broadcast({
      type: UPDATE_TYPES.CALL_STARTED,
      callSid,
      tenantId,
      timestamp: new Date().toISOString(),
      data: {
        callerNumber: summary.callerNumber,
        tenantId,
        tenantName: summary.tenantName,
        agentName: summary.agentName,
      },
    });
  }

  /**
   * Broadcast transcript update to all connected clients
   * @param {string} callSid - Call SID
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Transcript content
   */
  transcriptUpdate(callSid, role, content) {
    // Update active call summary
    const summary = this.activeCalls.get(callSid);
    if (summary) {
      summary.turnCount++;
      summary.transcriptPreview = content.length > 100
        ? content.substring(0, 100) + '...'
        : content;
    }

    this.broadcast({
      type: UPDATE_TYPES.TRANSCRIPT,
      callSid,
      tenantId: summary?.tenantId,
      timestamp: new Date().toISOString(),
      data: {
        role,
        content,
      },
    });
  }

  /**
   * Notify clients when a call ends
   * @param {string} callSid - Call SID
   * @param {number} duration - Call duration in seconds
   * @param {Object} leadInfo - Optional extracted lead info
   * @param {Object} appointmentInfo - Optional appointment info
   */
  callEnded(callSid, duration, leadInfo = null, appointmentInfo = null) {
    const summary = this.activeCalls.get(callSid);
    const tenantId = summary?.tenantId;

    this.activeCalls.delete(callSid);

    this.broadcast({
      type: UPDATE_TYPES.CALL_ENDED,
      callSid,
      tenantId,
      timestamp: new Date().toISOString(),
      data: {
        duration,
        status: 'completed',
        leadInfo,
        appointmentInfo,
      },
    });
  }

  /**
   * Get count of connected clients
   * @returns {number} - Number of connected clients
   */
  getClientCount() {
    return this.clients.size;
  }

  /**
   * Get list of active calls
   * @param {string} tenantId - Optional tenant ID filter
   * @returns {Array} - Array of active call summaries
   */
  getActiveCalls(tenantId = null) {
    const calls = Array.from(this.activeCalls.values());

    if (tenantId) {
      return calls.filter(call => call.tenantId === tenantId);
    }

    return calls;
  }

  /**
   * Check if a call is currently active
   * @param {string} callSid - Call SID
   * @returns {boolean} - True if call is active
   */
  isCallActive(callSid) {
    return this.activeCalls.has(callSid);
  }

  /**
   * Broadcast update to all connected clients
   * @param {Object} update - Update object to broadcast
   * @private
   */
  broadcast(update) {
    const message = JSON.stringify(update);
    let sentCount = 0;

    for (const clientInfo of this.clients) {
      const { ws, tenantId: clientTenantId } = clientInfo;

      // Filter by tenant if client has a tenant filter
      if (clientTenantId && update.tenantId && clientTenantId !== update.tenantId) {
        continue;
      }

      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
          sentCount++;
        } catch (error) {
          logger.error(`[LiveStream] Error sending to client: ${error.message}`);
        }
      }
    }

    if (sentCount > 0) {
      logger.debug(`[LiveStream] Broadcast ${update.type} to ${sentCount} client(s)`);
    }
  }

  /**
   * Send update to a specific client
   * @param {Object} clientInfo - Client info object
   * @param {Object} update - Update object to send
   * @private
   */
  sendToClient(clientInfo, update) {
    const { ws } = clientInfo;
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(update));
      } catch (error) {
        logger.error(`[LiveStream] Error sending to client: ${error.message}`);
      }
    }
  }

  /**
   * Close all client connections
   * Used during graceful shutdown
   */
  closeAllClients() {
    const clientCount = this.clients.size;
    for (const clientInfo of this.clients) {
      try {
        clientInfo.ws.close(1000, 'Server shutting down');
      } catch (error) {
        logger.error(`[LiveStream] Error closing client: ${error.message}`);
      }
    }
    this.clients.clear();
    this.activeCalls.clear();
    logger.info(`[LiveStream] Closed ${clientCount} client connection(s)`);
  }
}

// Singleton instance
const liveCallStream = new LiveCallStreamService();

module.exports = {
  liveCallStream,
  LiveCallStreamService,
  UPDATE_TYPES,
};
