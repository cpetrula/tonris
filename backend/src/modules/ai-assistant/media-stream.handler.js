/**
 * Media Stream Handler
 * Handles WebSocket connection between Twilio Media Streams and ElevenLabs Conversational AI
 */
const WebSocket = require('ws');
const { URL } = require('url');
const logger = require('../../utils/logger');
const { getElevenLabsService } = require('./elevenlabs.service');
const { CallLog } = require('../telephony/callLog.model');

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
      // Verify the signed URL includes audio format parameters for Twilio compatibility
      logger.info(`[MediaStream] Connecting to ElevenLabs with URL containing format params: ${signedUrl.includes('output_format=ulaw_8000')}`);
      elevenLabsWs = new WebSocket(signedUrl);

      // Handle ElevenLabs WebSocket open
      elevenLabsWs.on('open', () => {
        logger.info(`[MediaStream] Connected to ElevenLabs for call ${callSid}`);
        
        // Build dynamic variables from custom parameters
        // Include tenant_id and tenant_name for webhook callbacks and query params
        // ElevenLabs requires 'name' as a dynamic variable
        const dynamicVariables = {};
        
        // Always include tenant_id - it should always be present
        // Use the value from customParameters if available, otherwise use the tenantId variable
        dynamicVariables.tenant_id = customParameters.tenant_id || tenantId;
        
        const tenantName = customParameters.tenant_name || customParameters.business_name;
        if (tenantName) {
          dynamicVariables.tenant_name = tenantName;
          dynamicVariables.name = tenantName;
        } else {
          // Fallback name if no tenant/business name
          dynamicVariables.name = 'Our Business';
        }
        
        // Include ALL custom parameters as dynamic variables so they're available to ElevenLabs
        // This ensures fields like business_hours, ai_greeting, call_status, etc. are sent
        // Note: tenant_id is handled above, tenant_name may be overridden if present in customParameters
        for (const [key, value] of Object.entries(customParameters)) {
          // Only add if value is not null/undefined and key doesn't already exist
          // Use != null to exclude only null and undefined, allowing 0, false, empty strings
          if (value != null && !(key in dynamicVariables)) {
            dynamicVariables[key] = value;
          }
        }
        
        logger.info(`[MediaStream] Dynamic variables being sent: ${Object.keys(dynamicVariables).join(', ')}`);
        logger.info(`[MediaStream] Tenant ID: ${dynamicVariables.tenant_id}, Call SID: ${callSid}`);
        // Note: debug logging may contain sensitive data - use only for development/troubleshooting
        if (process.env.LOG_LEVEL === 'debug') {
          logger.debug(`[MediaStream] Dynamic variables content: ${JSON.stringify(dynamicVariables)}`);
        }
        
        // Send initialization message to ElevenLabs to start the conversation
        // This is required by ElevenLabs Conversational AI WebSocket protocol
        // IMPORTANT: Audio format must be set to 'ulaw_8000' for Twilio compatibility
        // Twilio Media Streams use 8-bit μ-law (mu-law) encoding at 8kHz sample rate
        // ElevenLabs must output in this format, otherwise audio will be garbled/noisy
        // The audio format configuration must be placed under 'agent' with:
        // - agent_output_audio_format: Format for ElevenLabs output audio (sent to Twilio)
        // - user_input_audio_format: Format for Twilio input audio (sent to ElevenLabs)
        // Without correct audio format configuration, ElevenLabs outputs audio in an incompatible 
        // format (typically pcm_16000 or mp3_44100), causing immediate disconnects or garbled audio
        // 
        // NOTE: We also specify first_message as empty to let the agent use its configured greeting.
        // If no greeting is configured in the ElevenLabs dashboard, the agent will wait for user input.
        // The tts section ensures the agent uses the correct TTS output format.
        // Build agent config with audio format settings
        // NOTE: first_message cannot be overridden via WebSocket - it must be
        // configured in the ElevenLabs dashboard using {{business_name}} variable
        const agentConfig = {
          language: 'en',
          // Critical: Set output format to ulaw_8000 for Twilio compatibility
          agent_output_audio_format: 'ulaw_8000',
          // Critical: Set input format to ulaw_8000 for Twilio audio
          user_input_audio_format: 'ulaw_8000',
        };

        const initMessage = {
          type: 'conversation_initiation_client_data',
          conversation_config_override: {
            agent: agentConfig,
            tts: {
              // Ensure TTS output uses the correct format for Twilio (μ-law 8kHz)
              output_format: 'ulaw_8000',
            },
          },
          dynamic_variables: dynamicVariables,
        };
        
        logger.info(`[MediaStream] Sending initialization with audio format: ulaw_8000`);
        elevenLabsWs.send(JSON.stringify(initMessage));
        logger.info(`[MediaStream] Sent initialization message to ElevenLabs for call ${callSid}, tenant: ${tenantId}`);
      });

      // Handle messages from ElevenLabs
      elevenLabsWs.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await handleElevenLabsMessage(message);
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
  const handleElevenLabsMessage = async (message) => {
    switch (message.type) {
      case 'conversation_initiation_metadata':
        // This confirms the conversation has been initialized successfully
        // If we receive this, the audio format configuration was accepted
        {
          const conversationId = message.conversation_initiation_metadata_event?.conversation_id || 'unknown';
          logger.info(`[MediaStream] Conversation initiated for call ${callSid}, conversation_id: ${conversationId}`);
          
          // Log the accepted audio configuration if available
          const metadata = message.conversation_initiation_metadata_event;
          if (metadata && process.env.LOG_LEVEL === 'debug') {
            logger.debug(`[MediaStream] Conversation metadata: ${JSON.stringify(metadata)}`);
          }
          
          // Verify audio format if available in metadata
          if (metadata?.agent_output_audio_format) {
            if (metadata.agent_output_audio_format !== 'ulaw_8000') {
              logger.error(`[MediaStream] WARNING: ElevenLabs using incorrect output format: ${metadata.agent_output_audio_format} (expected ulaw_8000). Audio may be garbled!`);
            } else {
              logger.info(`[MediaStream] Audio format verified: ${metadata.agent_output_audio_format}`);
            }
          }
          
          // Save the conversation ID to the call log for later retrieval
          if (callSid && conversationId && conversationId !== 'unknown') {
            try {
              const callLog = await CallLog.findOne({
                where: { twilioCallSid: callSid },
              });
              
              if (callLog) {
                // Update the metadata with ElevenLabs conversation ID
                // Safely handle null/undefined metadata
                callLog.metadata = {
                  ...(callLog.metadata || {}),
                  elevenLabsConversationId: conversationId,
                  elevenLabsAgentId: agentId,
                };
                await callLog.save();
                logger.info(`[MediaStream] Saved conversation ID ${conversationId} to call log ${callLog.id}`);
              } else {
                logger.warn(`[MediaStream] Call log not found for CallSid: ${callSid}`);
              }
            } catch (error) {
              logger.error(`[MediaStream] Failed to save conversation ID to call log: ${error.message}`);
            }
          }
        }
        break;

      case 'audio':
        // Forward audio from ElevenLabs to Twilio
        // IMPORTANT: Audio must be Base64 encoded μ-law data at 8kHz
        // Twilio expects messages in the format:
        // {
        //   "event": "media",
        //   "streamSid": "YOUR_STREAM_SID",
        //   "media": { "payload": "BASE64_ENCODED_ULAW_DATA" }
        // }
        // Only send if streamSid is defined (start event has been processed)
        if (streamSid && message.audio_event?.audio_base_64 && twilioWs.readyState === WebSocket.OPEN) {
          // Verify the payload is valid Base64 (basic check)
          const payload = message.audio_event.audio_base_64;
          if (typeof payload !== 'string' || payload.length === 0) {
            logger.error(`[MediaStream] Invalid audio payload from ElevenLabs: not a valid string`);
            break;
          }
          
          const audioData = {
            event: 'media',
            streamSid: streamSid,
            media: {
              payload: payload,
            },
          };
          
          twilioWs.send(JSON.stringify(audioData));
          
          // Debug logging for audio format verification (only in debug mode)
          if (process.env.LOG_LEVEL === 'debug' && Math.random() < 0.01) {
            // Sample 1% of audio packets to avoid log spam
            logger.debug(`[MediaStream] Forwarded audio to Twilio: streamSid=${streamSid}, payloadLength=${payload.length}`);
          }
        } else if (!streamSid) {
          logger.warn(`[MediaStream] Received audio before stream started for call ${callSid}`);
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
          // Twilio sends μ-law encoded audio at 8kHz as Base64
          // ElevenLabs expects it in the format: { "user_audio_chunk": "BASE64_DATA" }
          if (elevenLabsWs && elevenLabsWs.readyState === WebSocket.OPEN) {
            // Verify we have a valid payload
            if (!data.media?.payload) {
              logger.error(`[MediaStream] Invalid media event from Twilio: missing payload`);
              break;
            }
            
            const audioMessage = {
              user_audio_chunk: data.media.payload,
            };
            elevenLabsWs.send(JSON.stringify(audioMessage));
            
            // Debug logging for audio format verification (only in debug mode)
            if (process.env.LOG_LEVEL === 'debug' && Math.random() < 0.01) {
              // Sample 1% of audio packets to avoid log spam
              logger.debug(`[MediaStream] Forwarded audio to ElevenLabs: payloadLength=${data.media.payload.length}`);
            }
          } else if (!elevenLabsWs) {
            logger.error(`[MediaStream] Cannot forward audio: ElevenLabs WebSocket not initialized`);
          } else if (elevenLabsWs.readyState !== WebSocket.OPEN) {
            logger.warn(`[MediaStream] Cannot forward audio: ElevenLabs WebSocket not open (state: ${elevenLabsWs.readyState})`);
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
