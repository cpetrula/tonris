# Webhook Configuration Guide

This guide provides detailed instructions for configuring webhooks in Twilio and ElevenLabs to work with the TONRIS backend.

## Overview

The TONRIS platform uses a backend-first architecture where all calls are routed through the TONRIS backend before connecting to ElevenLabs. This provides:

- **Security**: Authentication and validation of all incoming requests
- **Monitoring**: Complete visibility into calls and conversations
- **Flexibility**: Custom logic and business rules can be applied
- **Tenant Isolation**: Proper data isolation between tenants

## Architecture Diagram

```
Customer Call → Twilio → TONRIS Backend → ElevenLabs AI
                   ↓           ↓              ↓
                Status    WebSocket       Webhooks
               Callback    Bridge        Callbacks
```

## Twilio Webhook Configuration

### Step 1: Access Twilio Console

1. Log in to your [Twilio Console](https://console.twilio.com)
2. Navigate to **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on the phone number you want to configure

### Step 2: Configure Voice Webhook

Under the **Voice & Fax** section:

| Setting | Value | Description |
|---------|-------|-------------|
| **A CALL COMES IN** | Webhook | Select "Webhook" from dropdown |
| **URL** | `https://your-domain.com/api/webhooks/twilio/elevenlabs` | Your TONRIS backend URL |
| **HTTP Method** | POST | Required |

**Example URL**: `https://api.mytonrisapp.com/api/webhooks/twilio/elevenlabs`

### Step 3: Configure Status Callback (Recommended)

Status callbacks allow you to track call progress and save call logs.

| Setting | Value | Description |
|---------|-------|-------------|
| **Status Callback URL** | `https://your-domain.com/api/webhooks/twilio/status` | Your TONRIS backend URL |
| **HTTP Method** | POST | Required |

**Events tracked**:
- Call initiated
- Call ringing
- Call answered
- Call completed
- Call failed

### Step 4: Configure SMS Webhook (Optional)

If you want to handle SMS messages:

Under the **Messaging** section:

| Setting | Value | Description |
|---------|-------|-------------|
| **A MESSAGE COMES IN** | Webhook | Select "Webhook" from dropdown |
| **URL** | `https://your-domain.com/api/webhooks/twilio/sms` | Your TONRIS backend URL |
| **HTTP Method** | POST | Required |

### Step 5: Save Configuration

Click **Save** at the bottom of the page to apply your changes.

## ElevenLabs Webhook Configuration

### Step 1: Access ElevenLabs Dashboard

1. Log in to [ElevenLabs Dashboard](https://elevenlabs.io)
2. Navigate to **Conversational AI** → **Agents**
3. Select the agent you want to configure (or create a new one)

### Step 2: Configure Conversation Initiation Webhook

This webhook is called when a new conversation begins, allowing dynamic configuration.

1. In the Agent settings, find the **Webhooks** section
2. Under **Conversation Initiation**, configure:

| Setting | Value | Description |
|---------|-------|-------------|
| **Webhook URL** | `https://your-domain.com/api/webhooks/elevenlabs/conversation-initiation` | Your TONRIS backend URL |
| **Webhook Secret** | `your-secret-key` | Generate a secure random string |

**Example URL**: `https://api.mytonrisapp.com/api/webhooks/elevenlabs/conversation-initiation`

3. Copy the webhook secret and add it to your `.env` file:

```env
ELEVENLABS_WEBHOOK_SECRET=your-secret-key
```

### Step 3: Enable Client Overrides

To allow the backend to set audio formats and other parameters:

1. In the Agent settings, find **Advanced Settings**
2. Enable **"Allow overrides from client"**
3. This is crucial for Twilio compatibility (mu-law audio format)

### Step 4: Configure Client Data Endpoints (Optional)

If you want ElevenLabs to fetch data dynamically during conversations:

#### Services Endpoint

URL: `https://your-domain.com/api/webhooks/elevenlabs/services?tenantId={TENANT_ID}`

Replace `{TENANT_ID}` with the actual tenant UUID.

#### Employees Endpoint

URL: `https://your-domain.com/api/webhooks/elevenlabs/employees?tenantId={TENANT_ID}`

#### Appointments Endpoint

URL: `https://your-domain.com/api/webhooks/elevenlabs/appointments?tenantId={TENANT_ID}`

### Step 5: Configure Custom Actions (Optional)

For appointment creation via HTTP POST:

1. Navigate to **Custom Actions** in the Agent settings
2. Add a new action with these settings:

| Setting | Value | Description |
|---------|-------|-------------|
| **Action Name** | `create_appointment` | Internal name |
| **Method** | POST | HTTP method |
| **URL** | `https://your-domain.com/api/webhooks/elevenlabs/appointments?tenantId={TENANT_ID}` | Backend endpoint |
| **Content-Type** | `application/json` | Required header |

3. Define parameters: `employeeId`, `serviceId`, `customerName`, `customerEmail`, `customerPhone`, `startTime`, `notes`

## Environment Variables

Ensure these environment variables are configured in your `.env` file:

```env
# Application
APP_BASE_URL=https://your-domain.com

# Twilio (Voice)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token

# Twilio (SMS) - Optional, can be same as voice
TWILIO_SMS_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SMS_AUTH_TOKEN=your_sms_auth_token
TWILIO_SMS_PHONE_NUMBER=+15551234567

# ElevenLabs
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_AGENT_ID=your_default_agent_id
ELEVENLABS_VOICE_ID=your_voice_id  # Optional
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret
```

## Testing Your Configuration

### Test Twilio Voice Webhook

1. Call your Twilio phone number
2. Check the TONRIS backend logs for:
   ```
   [INFO]: Twilio-ElevenLabs: Incoming call CA123... from +1555... to +1555...
   [INFO]: Twilio-ElevenLabs: Connected call CA123... to ElevenLabs agent xyz
   ```
3. The call should connect to your ElevenLabs AI agent

### Test ElevenLabs Webhook

1. Make a call that connects to ElevenLabs
2. Check the backend logs for:
   ```
   [INFO]: ElevenLabs Conversation Initiation: conversation=xyz, agent=abc, tenant=123
   ```
3. Verify the conversation receives proper tenant context

### Common Issues

#### Call Not Connecting

**Symptom**: Call rings but doesn't connect to AI

**Solutions**:
1. Verify `APP_BASE_URL` is set correctly and publicly accessible
2. Check Twilio webhook URL is correct
3. Review backend logs for errors
4. Ensure tenant has phone number configured

#### Call Immediately Disconnects

**Symptom**: Call connects briefly then drops

**Solutions**:
1. Verify ElevenLabs agent has "Allow overrides" enabled
2. Check audio format is set to `ulaw_8000`
3. Review ElevenLabs WebSocket logs for close codes
4. Ensure agent has a first message configured

#### No Tenant Found

**Symptom**: Error message: "This number is not in service"

**Solutions**:
1. Verify tenant record has `twilioPhoneNumber` field populated
2. Check phone number format matches (E.164 format: +15551234567)
3. Ensure tenant status is 'active'

#### Webhook Signature Validation Failed

**Symptom**: 401 or 403 error in logs

**Solutions**:
1. Verify `ELEVENLABS_WEBHOOK_SECRET` matches the secret in ElevenLabs dashboard
2. Check that webhook secret is configured in both places
3. In development, you may temporarily disable signature validation

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS URLs for webhooks in production
2. **Validate Signatures**: Enable webhook signature validation in production
3. **Rotate Secrets**: Periodically rotate webhook secrets
4. **Monitor Logs**: Regularly review webhook logs for suspicious activity
5. **Rate Limiting**: Built-in rate limiting protects against abuse
6. **IP Whitelisting**: Consider IP whitelisting for additional security (optional)

## Webhook Endpoints Reference

### TONRIS Backend Endpoints

| Endpoint | Method | Purpose | Called By |
|----------|--------|---------|-----------|
| `/api/webhooks/twilio/elevenlabs` | POST | Incoming voice calls | Twilio |
| `/api/webhooks/twilio/status` | POST | Call status updates | Twilio |
| `/api/webhooks/twilio/sms` | POST | Incoming SMS messages | Twilio |
| `/api/webhooks/elevenlabs/conversation-initiation` | POST | Conversation start | ElevenLabs |
| `/api/webhooks/elevenlabs/services` | GET | Fetch services | ElevenLabs |
| `/api/webhooks/elevenlabs/employees` | GET | Fetch employees | ElevenLabs |
| `/api/webhooks/elevenlabs/appointments` | GET/POST | Get/Create appointments | ElevenLabs |

### WebSocket Endpoint

| Endpoint | Protocol | Purpose | Connected By |
|----------|----------|---------|--------------|
| `/media-stream` | WebSocket | Audio streaming | Twilio |

## Development with ngrok

For local development, use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your backend
npm run dev

# In another terminal, expose port 3000
ngrok http 3000
```

Update your `.env` with the ngrok URL:
```env
APP_BASE_URL=https://xxxxx.ngrok.io
```

Then configure Twilio and ElevenLabs to use the ngrok URL for webhooks.

> **Note**: ngrok URLs change each time you restart ngrok (unless you have a paid account). You'll need to update webhook URLs each time.

## Monitoring and Logging

The backend logs all webhook activity. Monitor these logs to track:

- **Call Volume**: Number of calls per day/hour
- **Success Rate**: Percentage of successful connections
- **Error Patterns**: Common errors and their frequency
- **Tool Usage**: Which AI tools are being called most
- **Response Times**: How quickly webhooks respond

Example log entries:

```
[INFO]: Twilio-ElevenLabs: Incoming call CA123 from +15551234567 to +15559876543
[INFO]: Twilio-ElevenLabs: Connected call CA123 to ElevenLabs agent xyz for tenant abc
[INFO]: ElevenLabs Conversation Initiation: conversation=xyz, agent=abc, tenant=123
[INFO]: [MediaStream] Connected to ElevenLabs for call CA123
[INFO]: ElevenLabs tool call: check_availability for tenant: abc
```

## Support

If you encounter issues not covered in this guide:

1. Check the [TWILIO_ELEVENLABS.md](./TWILIO_ELEVENLABS.md) documentation
2. Review the [Troubleshooting](#testing-your-configuration) section above
3. Check backend logs for detailed error messages
4. Verify all environment variables are set correctly
5. Test with ngrok for local development

## Related Documentation

- [TWILIO_ELEVENLABS.md](./TWILIO_ELEVENLABS.md) - Integration details and architecture
- [SETUP.md](./SETUP.md) - General setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [API.md](./API.md) - API reference
