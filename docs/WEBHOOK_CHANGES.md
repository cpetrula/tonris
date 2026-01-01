# Webhook Configuration Changes Summary

## Overview

This document summarizes the changes made to update the Twilio to ElevenLabs integration workflow to ensure all calls are routed through the TONRIS backend first.

## What Changed

### Before (Mixed Architecture)
Previously, the system supported two different connection paths:
1. **Direct Import**: Phone numbers were imported to ElevenLabs during tenant signup, potentially creating a direct Twilio → ElevenLabs connection
2. **Backend Routing**: Calls could also route through `/api/webhooks/twilio/elevenlabs` which bridges through the backend

This mixed architecture created confusion and reduced security/monitoring capabilities.

### After (Unified Backend-First Architecture)
Now all calls follow a single, secure path:
1. **Twilio** receives call and sends webhook to TONRIS backend
2. **TONRIS Backend** validates tenant, generates TwiML with WebSocket URL
3. **Twilio** establishes WebSocket to backend at `/media-stream`
4. **TONRIS Backend** bridges audio between Twilio and ElevenLabs
5. **ElevenLabs** processes conversation and calls back to backend for data

## Code Changes

### 1. `backend/src/modules/auth/auth.service.js`

**Removed**: Direct phone number import to ElevenLabs during signup
```javascript
// REMOVED: This code is no longer executed
const importResult = await elevenlabsService.importPhoneNumber({
  phoneNumber: twilioPhoneNumber,
  label: businessName,
  agentId: agentId,
  twilioAccountSid: env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: env.TWILIO_AUTH_TOKEN,
});
```

**Added**: Store agent ID in tenant settings for webhook routing
```javascript
// Store agent_id in tenant settings for webhook routing
if (agentId) {
  updateData.settings = {
    elevenLabsAgentId: agentId,
  };
}
```

**Impact**: 
- Phone numbers are no longer imported to ElevenLabs
- Agent configuration is stored locally in tenant settings
- All calls now route through backend webhooks

### 2. `backend/src/modules/ai-assistant/elevenlabs.service.js`

**Marked as Deprecated**: The `importPhoneNumber` method
```javascript
/**
 * @deprecated This method is deprecated. Use backend webhook routing instead.
 * Importing phone numbers directly to ElevenLabs creates a direct Twilio → ElevenLabs
 * connection which bypasses our backend. The preferred method is to configure Twilio
 * webhooks to point to our backend...
 */
async importPhoneNumber({ ... }) { ... }
```

**Impact**:
- Method remains for backwards compatibility but is not used
- Clear deprecation notice guides developers away from this approach

## Documentation Updates

### 1. `docs/TWILIO_ELEVENLABS.md` (Updated)

**Key Changes**:
- Added "Quick Start" section with setup checklist
- Enhanced architecture diagram showing backend-first routing
- Detailed security benefits section
- Updated Twilio webhook configuration with clear warnings
- Added "Why Backend-First Routing?" section
- Updated tenant configuration requirements

### 2. `docs/WEBHOOK_CONFIGURATION.md` (New)

**Complete guide covering**:
- Step-by-step Twilio webhook setup
- Step-by-step ElevenLabs webhook setup  
- Environment variable configuration
- Testing procedures
- Troubleshooting common issues
- Security best practices
- Development with ngrok

## Required Configuration Changes

### Twilio Console

Configure your Twilio phone number:

1. Navigate to: **Phone Numbers** → **Manage** → **Active Numbers**
2. Select your phone number
3. Under **Voice & Fax**:
   - **A CALL COMES IN**: Webhook
   - **URL**: `https://your-domain.com/api/webhooks/twilio/elevenlabs`
   - **HTTP Method**: POST

### ElevenLabs Dashboard

Configure your ElevenLabs agent:

1. Navigate to: **Conversational AI** → **Agents** → Your Agent
2. Under **Webhooks**:
   - **Conversation Initiation**: `https://your-domain.com/api/webhooks/elevenlabs/conversation-initiation`
   - **Webhook Secret**: Set and add to `.env` as `ELEVENLABS_WEBHOOK_SECRET`
3. Under **Advanced Settings**:
   - Enable **"Allow overrides from client"** (required for Twilio audio format)

### Environment Variables

No new environment variables are required. Existing configuration continues to work:

```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token

# ElevenLabs
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_AGENT_ID=your_default_agent_id
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret

# Application
APP_BASE_URL=https://your-domain.com
```

## Benefits of the New Architecture

### 1. Security
- All calls are authenticated and validated before connecting to ElevenLabs
- Webhook signature verification prevents unauthorized access
- API keys never exposed to external services

### 2. Monitoring
- Complete visibility into all calls and conversations
- Centralized logging of all events
- Call tracking in database with full context

### 3. Flexibility
- Custom routing logic can be added
- Rate limiting and abuse prevention
- Tenant-specific configuration
- A/B testing capabilities

### 4. Cost Control
- Monitor usage per tenant
- Implement usage limits
- Track costs accurately

### 5. Tenant Isolation
- Proper data isolation between tenants
- Tenant-specific agent configuration
- Customized greetings and behavior

## Migration Guide

### For Existing Deployments

**Good News**: If your Twilio webhooks are already configured to use `/api/webhooks/twilio/elevenlabs`, no migration is needed! The code changes are backwards compatible.

**If using direct ElevenLabs import**:

1. Update Twilio webhooks to point to: `https://your-domain.com/api/webhooks/twilio/elevenlabs`
2. Configure ElevenLabs webhooks as described above
3. Remove phone number from ElevenLabs (optional cleanup)
4. Agent configuration from business type is now stored in tenant settings automatically

### For New Deployments

Simply follow the webhook configuration guide in `WEBHOOK_CONFIGURATION.md`.

## Testing the Changes

### 1. Test Call Flow

```bash
# Make a test call to your Twilio number
# Check logs for successful connection

# Expected log output:
[INFO]: Twilio-ElevenLabs: Incoming call CA123... from +1555... to +1555...
[INFO]: Twilio-ElevenLabs: Connected call CA123... to ElevenLabs agent xyz
[INFO]: [MediaStream] Connected to ElevenLabs for call CA123
```

### 2. Test Webhook Callbacks

```bash
# During a call, check for conversation initiation webhook
[INFO]: ElevenLabs Conversation Initiation: conversation=xyz, agent=abc, tenant=123
```

### 3. Verify Tenant Configuration

```bash
# Check tenant record has correct phone number
# Verify agent ID is in tenant settings if custom per tenant
```

## Rollback Procedure

If you need to rollback (though not recommended):

1. Checkout the previous commit: `git checkout <previous-commit>`
2. Redeploy the application
3. ElevenLabs phone import will work again

However, we strongly recommend keeping the new architecture for the security and monitoring benefits.

## Support

For issues or questions:

1. Review [WEBHOOK_CONFIGURATION.md](./WEBHOOK_CONFIGURATION.md) for detailed setup
2. Check [TWILIO_ELEVENLABS.md](./TWILIO_ELEVENLABS.md) for architecture details
3. Review application logs for error messages
4. Ensure all environment variables are configured

## Related Files Changed

- `backend/src/modules/auth/auth.service.js` - Removed direct import
- `backend/src/modules/ai-assistant/elevenlabs.service.js` - Deprecated method
- `docs/TWILIO_ELEVENLABS.md` - Updated architecture docs
- `docs/WEBHOOK_CONFIGURATION.md` - New comprehensive guide
- `docs/WEBHOOK_CHANGES.md` - This file

## Confirmation

✅ **Confirmed**: This is the preferred method for Twilio to ElevenLabs integration.

The backend-first routing provides superior security, monitoring, and flexibility compared to direct phone number import to ElevenLabs.
