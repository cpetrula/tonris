# Audio Format Fix: ASR Configuration Addition

## Date
2026-01-04

## Problem Statement
After implementing audio format fixes in a previous PR, audio was still garbled. Logs showed:
```
[WARN]: [MediaStream] ElevenLabs using incorrect output format: pcm_16000 (expected ulaw_8000). Audio may be garbled!
```

This indicated that ElevenLabs was not respecting the audio format configuration and was using `pcm_16000` instead of the required `ulaw_8000` format for Twilio compatibility.

## Root Cause Analysis
Upon investigation, it was discovered that the audio format configuration in the **Conversation Initiation webhook** (`twilio-elevenlabs.handler.js`) was incomplete compared to the **WebSocket initialization** (`media-stream.handler.js`).

### Configuration Comparison

**WebSocket Initialization** (media-stream.handler.js) - COMPLETE:
```javascript
conversation_config_override: {
  agent: {
    agent_output_audio_format: 'ulaw_8000',
    user_input_audio_format: 'ulaw_8000',
  },
  tts: {
    output_format: 'ulaw_8000',
  },
  asr: {
    input_format: 'ulaw_8000',  // ✅ Present
  },
}
```

**Conversation Initiation Webhook** (twilio-elevenlabs.handler.js) - INCOMPLETE:
```javascript
conversation_config_override: {
  agent: {
    agent_output_audio_format: 'ulaw_8000',
    user_input_audio_format: 'ulaw_8000',
  },
  tts: {
    output_format: 'ulaw_8000',
  },
  // ❌ Missing asr configuration
}
```

### Impact
The missing `asr` (Automatic Speech Recognition) configuration may have caused ElevenLabs to:
1. Not properly initialize the ASR system with the correct audio format
2. Fall back to default PCM format for speech recognition
3. Potentially cause a mismatch between output and input formats

## Solution Implemented

### Code Changes

#### 1. Updated `twilio-elevenlabs.handler.js`
Added the missing `asr` configuration to the main conversation config override:

```javascript
conversation_config_override: {
  agent: {
    agent_output_audio_format: 'ulaw_8000',
    user_input_audio_format: 'ulaw_8000',
    language: 'en',
  },
  tts: {
    output_format: 'ulaw_8000',
  },
  asr: {
    // Ensure ASR (speech recognition) expects ulaw input
    input_format: 'ulaw_8000',
  },
},
```

Also updated the error fallback case to include complete configuration:

```javascript
conversation_config_override: {
  agent: {
    agent_output_audio_format: 'ulaw_8000',
    user_input_audio_format: 'ulaw_8000',
  },
  tts: {
    output_format: 'ulaw_8000',
  },
  asr: {
    input_format: 'ulaw_8000',
  },
},
```

#### 2. Updated Tests
Enhanced test coverage in `twilio-elevenlabs.test.js`:

```javascript
// Added ASR format verification to existing tests
expect(result.data.conversation_config_override.asr.input_format).toBe('ulaw_8000');
```

#### 3. Updated Documentation
Updated the following documentation files to reflect the complete configuration:
- `docs/TWILIO_ELEVENLABS.md`
- `docs/API.md`

### Configuration Consistency
Now all three layers of audio format configuration are consistent:

1. **URL Parameters** (elevenlabs.service.js):
   - `output_format=ulaw_8000`
   - `input_format=ulaw_8000`

2. **WebSocket Initialization** (media-stream.handler.js):
   - `agent.agent_output_audio_format: 'ulaw_8000'`
   - `agent.user_input_audio_format: 'ulaw_8000'`
   - `tts.output_format: 'ulaw_8000'`
   - `asr.input_format: 'ulaw_8000'` ✅

3. **Conversation Initiation Webhook** (twilio-elevenlabs.handler.js):
   - `agent.agent_output_audio_format: 'ulaw_8000'`
   - `agent.user_input_audio_format: 'ulaw_8000'`
   - `tts.output_format: 'ulaw_8000'`
   - `asr.input_format: 'ulaw_8000'` ✅ **NOW ADDED**

## Files Modified

1. **backend/src/modules/ai-assistant/twilio-elevenlabs.handler.js**
   - Added `asr` configuration to main conversation config override
   - Added `asr` and `tts` configurations to error fallback case

2. **backend/tests/twilio-elevenlabs.test.js**
   - Updated test to verify ASR format is correctly set
   - Added ASR format check to HTTP response test

3. **docs/TWILIO_ELEVENLABS.md**
   - Updated example response to include `asr` configuration

4. **docs/API.md**
   - Updated example response to include `asr` configuration

## Testing

### Tests Passing
All tests related to audio format configuration now pass:
- ✅ `should return conversation configuration with dynamic variables`
- ✅ `should set audio format to ulaw_8000 for Twilio compatibility`

### Manual Testing Recommendations
1. Make a test call to verify audio is clear (no garbling)
2. Check logs for the warning message - it should no longer appear
3. Verify the metadata shows `agent_output_audio_format: 'ulaw_8000'` instead of `pcm_16000`
4. Test both inbound and outbound audio quality

## Expected Behavior After Fix

### Before Fix:
```
[WARN]: [MediaStream] ElevenLabs using incorrect output format: pcm_16000 (expected ulaw_8000). Audio may be garbled!
```

### After Fix:
```
[INFO]: [MediaStream] Audio format verified: ulaw_8000
```

## Rollback Plan
If this fix causes issues, revert commit `14dca7f` to restore previous behavior.

## Related Documents
- Original fix documentation: `AUDIO_FIX_SUMMARY.md`
- ElevenLabs integration: `docs/TWILIO_ELEVENLABS.md`
- API documentation: `docs/API.md`

## Success Criteria
- [ ] Audio is clear on phone calls (no garbling or distortion)
- [ ] Warning message no longer appears in logs
- [ ] Metadata confirms `ulaw_8000` format is being used
- [ ] Both speech recognition (ASR) and text-to-speech (TTS) work correctly
- [ ] Tests pass
