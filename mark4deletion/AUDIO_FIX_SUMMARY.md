# Audio Format Fix for Twilio-ElevenLabs Relay

## Problem Statement

When the webhook was switched from Twilio directly to ElevenLabs to using the TONRIS API as a relay, the audio on phone calls became garbled and noisy. This issue occurred because of audio encoding and sample rate mismatches between Twilio's output format and ElevenLabs' expected input format.

## Root Causes

### 1. Audio Encoding and Sample Rate Mismatch
- **Twilio's Format**: Twilio Media Streams use 8-bit μ-law (mu-law) encoding at an 8,000 Hz (8kHz) sample rate
- **ElevenLabs Default**: ElevenLabs typically defaults to higher-quality formats like MP3 at 44.1kHz or PCM at 16k–44.1k
- **Problem**: When relaying audio through the API without explicitly specifying the format, ElevenLabs outputs audio in its default high-quality format, which Twilio cannot process correctly, resulting in garbled audio

### 2. Base64 Encoding Requirements
- **Twilio Requirement**: Twilio requires audio payloads to be Base64 encoded
- **Problem**: If the relay passes raw bytes or incorrectly formatted Base64 strings, the resulting sound will be static or white noise

### 3. Payload Header Requirements
- **Twilio Requirement**: When sending audio back to Twilio via WebSockets, the message must follow a strict JSON structure:
  ```json
  {
    "event": "media",
    "streamSid": "YOUR_STREAM_SID",
    "media": {
      "payload": "BASE64_ENCODED_ULAW_DATA"
    }
  }
  ```
- **Problem**: Omitting the event type or streamSid causes Twilio to not process the packets correctly

## Solution Implemented

### 1. Enhanced Audio Format Configuration

#### In `media-stream.handler.js`:
- **Line 62**: Added verification logging to confirm signed URL contains format parameters
- **Lines 106-127**: Enhanced the WebSocket initialization message with detailed comments explaining μ-law requirements
- **Lines 119-122**: Explicitly set audio format configuration:
  ```javascript
  const agentConfig = {
    language: 'en',
    agent_output_audio_format: 'ulaw_8000',  // Output from ElevenLabs to Twilio
    user_input_audio_format: 'ulaw_8000',    // Input from Twilio to ElevenLabs
  };
  ```
- **Lines 128-132**: Set TTS output format:
  ```javascript
  tts: {
    output_format: 'ulaw_8000',
  }
  ```
- **Line 137**: Added logging to confirm initialization message sent

#### In `elevenlabs.service.js`:
- **Lines 264-273**: Enhanced URL parameter setting with detailed comments
- **Lines 270-271**: Explicitly add format parameters to signed URL:
  ```javascript
  url.searchParams.set('output_format', 'ulaw_8000');
  url.searchParams.set('input_format', 'ulaw_8000');
  ```
- **Line 274**: Added logging to verify format parameters are set

#### In `twilio-elevenlabs.handler.js`:
- **Lines 720-732**: Enhanced conversation config override with detailed comments
- **Line 744**: Added audio format to response logging

### 2. Base64 Encoding Validation

#### In `media-stream.handler.js`:
- **Lines 223-250**: Added validation for audio payloads from ElevenLabs:
  - Verify payload is a valid string
  - Check payload length is not zero
  - Log errors if validation fails
  - Added debug logging (1% sampling) to track audio packet flow without log spam
- **Lines 317-340**: Added validation for audio payloads from Twilio:
  - Verify media.payload exists
  - Check WebSocket connection state before forwarding
  - Added detailed error logging for different failure scenarios
  - Added debug logging (1% sampling) to track audio packet flow

### 3. Payload Header Verification

#### In `media-stream.handler.js`:
- **Lines 227-233**: Verified correct message structure for Twilio:
  ```javascript
  const audioData = {
    event: 'media',           // Required: event type
    streamSid: streamSid,     // Required: stream identifier
    media: {
      payload: payload,       // Required: Base64 encoded audio data
    },
  };
  ```
- **Line 248**: Added warning if audio received before stream started

### 4. Audio Format Verification

#### In `media-stream.handler.js`:
- **Lines 189-218**: Enhanced conversation_initiation_metadata handler:
  - Added logging of conversation metadata
  - Added verification of agent_output_audio_format
  - Log error if format is not ulaw_8000
  - Log success if format is correct

## Testing Recommendations

### 1. Manual Testing
1. Make a test call to a Twilio number configured to use the ElevenLabs relay
2. Listen for clear audio without noise or garbling
3. Verify the AI assistant responds appropriately
4. Check logs for confirmation messages:
   - "Connecting to ElevenLabs with URL containing format params: true"
   - "Sending initialization with audio format: ulaw_8000"
   - "Twilio signed URL generated with audio format parameters: output_format=ulaw_8000"
   - "Audio format verified: ulaw_8000"

### 2. Log Analysis
Enable debug logging (`LOG_LEVEL=debug`) and verify:
1. Format parameters are included in the signed URL
2. Initialization message includes correct audio configuration
3. Audio format is verified in the conversation_initiation_metadata event
4. No warnings about incorrect audio format
5. Audio packets are being forwarded (check sampled debug logs)

### 3. Edge Cases to Test
1. Call during peak load (multiple concurrent calls)
2. Long duration calls (>10 minutes)
3. Calls with interruptions (customer speaking while AI is speaking)
4. Calls with silence periods

## Files Modified

1. **backend/src/modules/ai-assistant/media-stream.handler.js**
   - Enhanced audio format configuration in WebSocket initialization
   - Added Base64 payload validation
   - Added audio format verification
   - Added comprehensive debug logging

2. **backend/src/modules/ai-assistant/elevenlabs.service.js**
   - Enhanced URL parameter setting with detailed comments
   - Added logging to verify format parameters

3. **backend/src/modules/ai-assistant/twilio-elevenlabs.handler.js**
   - Enhanced conversation config override with detailed comments
   - Added audio format to response logging

## Key Implementation Details

### Audio Format: μ-law (u-law) 8kHz
- **Format**: G.711 μ-law (mu-law)
- **Sample Rate**: 8,000 Hz (8 kHz)
- **Encoding**: 8-bit
- **Codec**: PCMU (ulaw_8000)
- **Why**: This is the standard format for telephony systems, including Twilio

### Triple-Layer Format Configuration
The fix implements audio format configuration at three layers for maximum compatibility:

1. **URL Parameters** (in `elevenlabs.service.js`):
   - Added to signed URL as query parameters
   - Fallback for agents that don't respect conversation_config_override

2. **WebSocket Initialization** (in `media-stream.handler.js`):
   - Sent in the conversation_initiation_client_data message
   - Sets agent_output_audio_format and user_input_audio_format

3. **Conversation Initiation Webhook** (in `twilio-elevenlabs.handler.js`):
   - Returns configuration in the conversation_config_override
   - Ensures format is set even if WebSocket initialization is missed

### Validation and Error Detection
- Base64 payload validation prevents passing invalid audio data
- Audio format verification in conversation_initiation_metadata detects format mismatches early
- Comprehensive logging helps diagnose issues quickly
- Debug logging (with sampling) helps track audio flow without overwhelming logs

## Potential Issues and Mitigation

### Issue 1: ElevenLabs Agent Overrides Disabled
**Symptom**: Audio still garbled despite correct configuration
**Cause**: Agent doesn't have "Allow overrides from client" enabled
**Solution**: Enable in ElevenLabs dashboard: Agent Settings > Advanced > Allow overrides

### Issue 2: Signed URL Already Has Parameters
**Symptom**: Format parameters not properly added to signed URL
**Cause**: URL class may not handle existing query parameters correctly
**Mitigation**: We use the URL class's searchParams.set() which properly handles existing parameters

### Issue 3: Late Initialization
**Symptom**: First few seconds of audio are garbled
**Cause**: Audio format configured after audio starts flowing
**Mitigation**: Format is set in three places (URL, initialization message, webhook) to ensure it's configured before audio flows

## References

- [Twilio Media Streams Documentation](https://www.twilio.com/docs/voice/media-streams)
- [ElevenLabs Conversational AI Documentation](https://elevenlabs.io/docs/conversational-ai)
- [G.711 μ-law Codec Specification](https://en.wikipedia.org/wiki/G.711)
- Original Issue: Garbled and noisy audio in relay setup

## Rollback Plan

If this fix causes issues:
1. Revert to commit `7c77d30` (before audio format enhancements)
2. The system will still work but may have garbled audio in relay mode
3. Users can switch back to direct Twilio-to-ElevenLabs webhooks as a workaround

## Success Criteria

The fix is successful if:
- [ ] Audio is clear on phone calls (no garbling or noise)
- [ ] AI assistant can understand caller speech correctly
- [ ] Caller can understand AI assistant speech correctly
- [ ] Logs show "Audio format verified: ulaw_8000" message
- [ ] No errors in WebSocket communication
- [ ] No audio disconnects or immediate call drops
