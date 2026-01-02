/**
 * Media Stream Handler
 * Handles WebSocket connection between Twilio Media Streams and ElevenLabs Conversational AI
 */
const WebSocket = require('ws');
const { URL } = require('url');
const logger = require('../../utils/logger');
const { getElevenLabsService } = require('./elevenlabs.service');

/**
 * Active stream connections map
 * Key: Twilio streamSid, Value: { twilioWs, callSid, tenantId, startTime }
 * Note: elevenLabsWs is not stored here as it's managed within the connection scope
 */
const activeStreams = new Map();

/**
 * Handle incoming WebSocket connection from Twilio Media Stream
 * @param {WebSocket} twilioWs - WebSocket connection from Twilio
 * @param {Object} req - Express request object
 */
const handleMediaStreamConnection = async (twilioWs, req) => {
  logger.info('[MediaStream] Twilio connected to media stream');

  let streamSid = null;
  let callSid = null;
  let elevenLabsWs = null;
  let tenantId = null;
  let agentId = null;
  let customParameters = {};

  // Extract query parameters if present
  const url = new URL(req.url, `http://${req.headers.host}`);
  tenantId = url.searchParams.get('tenant_id');
  agentId = url.searchParams.get('agent_id');
  callSid = url.searchParams.get('call_sid');

  /**
   * Initialize ElevenLabs WebSocket connection
   */
  const initializeElevenLabs = async () => {
    try {
      const elevenlabsService = getElevenLabsService();
      const isAvailable = await elevenlabsService.isAvailable();

      if (!isAvailable) {
        logger.error('[MediaStream] ElevenLabs service not available');
        twilioWs.close();
        return;
      }

      // Get signed URL for ElevenLabs
      const { signedUrl } = await elevenlabsService.getTwilioSignedUrl(agentId, {
        tenantId,
        callSid,
      });

      logger.info(`[MediaStream] Connecting to ElevenLabs for call ${callSid}`);

      // Connect to ElevenLabs
      elevenLabsWs = new WebSocket(signedUrl);

      // Handle ElevenLabs WebSocket open
      elevenLabsWs.on('open', () => {
        logger.info(`[MediaStream] Connected to ElevenLabs for call ${callSid}`);
        
        // Build dynamic variables from custom parameters
        // Include tenant_id and tenant_name for webhook callbacks and query params
        // ElevenLabs requires 'name' as a dynamic variable
        const dynamicVariables = {
          tenant_id: tenantId,
          tenant_name: customParameters.tenant_name || customParameters.business_name || '',
          name: customParameters.tenant_name || customParameters.business_name || 'Our Business',
        };
        if (customParameters.business_name) {
          dynamicVariables.business_name = customParameters.business_name;
        }
        if (customParameters.caller_number) {
          dynamicVariables.caller_number = customParameters.caller_number;
        }
        if (customParameters.call_sid) {
          dynamicVariables.call_sid = customParameters.call_sid;
        }
        
        // Send initialization message to ElevenLabs to start the conversation
        // This is required by ElevenLabs Conversational AI WebSocket protocol
        // IMPORTANT: Audio format must be set to 'ulaw_8000' for Twilio compatibility
        // The audio format configuration must be placed under 'agent' with:
        // - agent_output_audio_format: Format for ElevenLabs output audio (sent to Twilio)
        // - user_input_audio_format: Format for Twilio input audio (sent to ElevenLabs)
        // Without correct audio format configuration, ElevenLabs outputs audio in an incompatible 
        // format (typically pcm_16000), causing immediate disconnects when Twilio receives it
        // 
        // NOTE: We also specify first_message as empty to let the agent use its configured greeting.
        // If no greeting is configured in the ElevenLabs dashboard, the agent will wait for user input.
        // The tts section ensures the agent uses the correct TTS output format.
        // Build agent config with audio format settings
        // NOTE: first_message cannot be overridden via WebSocket - it must be
        // configured in the ElevenLabs dashboard using {{business_name}} variable
        const agentConfig = {
          language: 'en',
          agent_output_audio_format: 'ulaw_8000',
          user_input_audio_format: 'ulaw_8000',
        };

        const initMessage = {
          type: 'conversation_initiation_client_data',
          conversation_config_override: {
            agent: agentConfig,
            tts: {
              // Ensure TTS output uses the correct format for Twilio
              output_format: 'ulaw_8000',
            },
          },
          dynamic_variables: dynamicVariables,
        };
        
        elevenLabsWs.send(JSON.stringify(initMessage));
        logger.info(`[MediaStream] Sent initialization message to ElevenLabs for call ${callSid}, tenant: ${tenantId}`);
      });

      // Handle messages from ElevenLabs
      elevenLabsWs.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          handleElevenLabsMessage(message);
        } catch (error) {
          logger.error(`[MediaStream] Error parsing ElevenLabs message: ${error.message}`);
        }
      });

      // Handle ElevenLabs WebSocket errors
      elevenLabsWs.on('error', (error) => {
        logger.error(`[MediaStream] ElevenLabs WebSocket error: ${error.message}`);
      });

      // Handle ElevenLabs WebSocket close
      // Common close codes:
      // - 1000: Normal closure
      // - 1006: Abnormal closure (connection lost)
      // - 1011: Unexpected condition (server error)
      // - 4000-4999: Application-specific errors from ElevenLabs
      elevenLabsWs.on('close', (code, reason) => {
        const reasonStr = reason ? reason.toString() : 'No reason provided';
        if (code === 1000) {
          logger.info(`[MediaStream] ElevenLabs disconnected normally: code=${code}`);
        } else if (code === 1006) {
          logger.warn(`[MediaStream] ElevenLabs connection lost abnormally: code=${code}, reason=${reasonStr}`);
        } else {
          logger.warn(`[MediaStream] ElevenLabs disconnected: code=${code}, reason=${reasonStr}`);
        }
        // Close Twilio connection when ElevenLabs disconnects
        if (twilioWs.readyState === WebSocket.OPEN) {
          twilioWs.close();
        }
      });

    } catch (error) {
      logger.error(`[MediaStream] Error initializing ElevenLabs: ${error.message}`);
      twilioWs.close();
    }
  };

  /**
   * Handle messages from ElevenLabs
   * @param {Object} message - Parsed message from ElevenLabs
   */
  const handleElevenLabsMessage = (message) => {
    switch (message.type) {
      case 'conversation_initiation_metadata':
        // This confirms the conversation has been initialized successfully
        // If we receive this, the audio format configuration was accepted
        {
          const conversationId = message.conversation_initiation_metadata_event?.conversation_id || 'unknown';
          logger.info(`[MediaStream] Conversation initiated for call ${callSid}, conversation_id: ${conversationId}`);
        }
        break;

      case 'audio':
        // Forward audio from ElevenLabs to Twilio
        // Only send if streamSid is defined (start event has been processed)
        if (streamSid && message.audio_event?.audio_base_64 && twilioWs.readyState === WebSocket.OPEN) {
          const audioData = {
            event: 'media',
            streamSid,
            media: {
              payload: message.audio_event.audio_base_64,
            },
          };
          twilioWs.send(JSON.stringify(audioData));
        }
        break;

      case 'interruption':
        // Clear Twilio's audio buffer on interruption
        // Only send if streamSid is defined
        if (streamSid && twilioWs.readyState === WebSocket.OPEN) {
          twilioWs.send(JSON.stringify({ event: 'clear', streamSid }));
        }
        break;

      case 'ping':
        // Respond to ping with pong - this is critical for keeping the connection alive
        // ElevenLabs sends periodic pings and expects pong responses
        // Failure to respond will cause the connection to be closed
        if (message.ping_event?.event_id && elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
          const pongResponse = {
            type: 'pong',
            event_id: message.ping_event.event_id,
          };
          elevenLabsWs.send(JSON.stringify(pongResponse));
          logger.debug(`[MediaStream] Responded to ping for call ${callSid}`);
        }
        break;

      case 'agent_response':
        logger.debug(`[MediaStream] Agent response for call ${callSid}`);
        break;

      case 'user_transcript':
        logger.debug(`[MediaStream] User transcript for call ${callSid}`);
        break;
      
      case 'error':
        // Handle error messages from ElevenLabs
        // This can indicate configuration issues, API errors, or other problems
        logger.error(`[MediaStream] ElevenLabs error for call ${callSid}: ${JSON.stringify(message)}`);
        break;

      default:
        logger.debug(`[MediaStream] Unhandled ElevenLabs message type: ${message.type}`);
    }
  };

  /**
   * Handle messages from Twilio Media Stream
   */
  twilioWs.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.event) {
        case 'connected':
          logger.info(`[MediaStream] Twilio stream connected for protocol: ${data.protocol}`);
          break;

        case 'start':
          streamSid = data.start.streamSid;
          callSid = data.start.callSid || callSid;

          // Extract custom parameters if present
          if (data.start.customParameters) {
            tenantId = tenantId || data.start.customParameters.tenant_id;
            agentId = agentId || data.start.customParameters.agent_id;
            // Store all custom parameters for passing to ElevenLabs
            customParameters = { ...data.start.customParameters };
          }

          logger.info(`[MediaStream] Stream started: ${streamSid}, call: ${callSid}`);

          // Store the active stream
          activeStreams.set(streamSid, {
            twilioWs,
            callSid,
            tenantId,
            startTime: new Date(),
          });

          // Initialize ElevenLabs connection when stream starts
          await initializeElevenLabs();
          break;

        case 'media':
          // Forward audio from Twilio to ElevenLabs
          if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
            const audioMessage = {
              user_audio_chunk: data.media.payload,
            };
            elevenLabsWs.send(JSON.stringify(audioMessage));
          }
          break;

        case 'stop':
          logger.info(`[MediaStream] Stream stopped: ${streamSid}`);
          // Clean up ElevenLabs connection
          if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
            elevenLabsWs.close();
          }
          // Remove from active streams
          if (streamSid) {
            activeStreams.delete(streamSid);
          }
          break;

        case 'mark':
          logger.debug(`[MediaStream] Mark event received: ${data.mark?.name}`);
          break;

        default:
          logger.debug(`[MediaStream] Unhandled Twilio event: ${data.event}`);
      }
    } catch (error) {
      logger.error(`[MediaStream] Error processing Twilio message: ${error.message}`);
    }
  });

  /**
   * Handle Twilio WebSocket close
   */
  twilioWs.on('close', (code, reason) => {
    logger.info(`[MediaStream] Twilio disconnected: code=${code}, reason=${reason}`);

    // Clean up ElevenLabs connection
    if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
      elevenLabsWs.close();
    }

    // Remove from active streams
    if (streamSid) {
      activeStreams.delete(streamSid);
    }
  });

  /**
   * Handle Twilio WebSocket errors
   */
  twilioWs.on('error', (error) => {
    logger.error(`[MediaStream] Twilio WebSocket error: ${error.message}`);

    // Clean up ElevenLabs connection
    if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
      elevenLabsWs.close();
    }
  });
};

/**
 * Get active stream count
 * @returns {number} - Number of active streams
 */
const getActiveStreamCount = () => {
  return activeStreams.size;
};

/**
 * Get active stream info
 * @param {string} streamSid - Stream SID
 * @returns {Object|null} - Stream info or null
 */
const getActiveStream = (streamSid) => {
  return activeStreams.get(streamSid) || null;
};

module.exports = {
  handleMediaStreamConnection,
  getActiveStreamCount,
  getActiveStream,
};
