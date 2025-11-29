# Twilio to ElevenLabs Integration

This document explains how to set up and use the Twilio to ElevenLabs integration in the TONRIS platform. This integration allows incoming phone calls to be connected directly to an ElevenLabs Conversational AI agent, enabling natural voice interactions with customers.

## Overview

The integration creates a bridge between Twilio (telephony provider) and ElevenLabs (conversational AI provider), allowing:

- Incoming phone calls to be handled by an AI voice agent
- Real-time voice conversations with natural speech synthesis
- Access to tenant-specific data (services, availability, appointments) during conversations
- Automatic appointment booking, cancellation, and information lookup

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Customer      │     │    Twilio       │     │   TONRIS        │
│   Phone Call    │────>│   Platform      │────>│   Backend       │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 │   TwiML Response      │
                                 │   with <Stream>       │
                                 │<──────────────────────│
                                 │                       │
                                 │                       │
                        ┌────────▼────────┐              │
                        │   WebSocket     │              │
                        │   Connection    │              │
                        └────────┬────────┘              │
                                 │                       │
                                 │                       │
                        ┌────────▼────────┐     ┌────────▼────────┐
                        │   ElevenLabs    │     │   Tool Calls    │
                        │   Agent API     │────>│   (Services,    │
                        │                 │     │   Availability) │
                        └─────────────────┘     └─────────────────┘
```

## Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)
2. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io) with access to Conversational AI
3. **TONRIS Backend**: Running and accessible via public URL (or ngrok for development)

## Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
APP_BASE_URL=https://your-domain.com

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_agent_id
ELEVENLABS_VOICE_ID=your_voice_id  # Optional
```

### 2. ElevenLabs Agent Setup

1. Log in to your ElevenLabs account
2. Navigate to **Conversational AI** > **Agents**
3. Create a new agent or use an existing one
4. Copy the **Agent ID** and add it to your environment variables
5. Configure the agent's:
   - **Voice**: Select the voice for the agent
   - **System Prompt**: Define the agent's personality and capabilities
   - **Tools**: Add the following tools for TONRIS integration

#### Recommended Agent Tools Configuration

Add these tools to your ElevenLabs agent to enable interaction with TONRIS services:

```json
{
  "tools": [
    {
      "name": "check_availability",
      "description": "Check available appointment times for a service",
      "parameters": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "description": "Date to check (YYYY-MM-DD format)"
          },
          "serviceId": {
            "type": "string",
            "description": "Service ID to check availability for"
          }
        }
      }
    },
    {
      "name": "book_appointment",
      "description": "Book a new appointment",
      "parameters": {
        "type": "object",
        "properties": {
          "customerName": { "type": "string" },
          "customerPhone": { "type": "string" },
          "customerEmail": { "type": "string" },
          "serviceId": { "type": "string" },
          "employeeId": { "type": "string" },
          "startTime": { "type": "string" }
        },
        "required": ["customerName", "serviceId", "startTime"]
      }
    },
    {
      "name": "get_services",
      "description": "Get list of available services",
      "parameters": {
        "type": "object",
        "properties": {
          "limit": { "type": "number" }
        }
      }
    },
    {
      "name": "get_business_hours",
      "description": "Get business operating hours",
      "parameters": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "cancel_appointment",
      "description": "Cancel an existing appointment",
      "parameters": {
        "type": "object",
        "properties": {
          "appointmentId": { "type": "string" },
          "reason": { "type": "string" }
        },
        "required": ["appointmentId"]
      }
    }
  ]
}
```

### 3. Twilio Webhook Configuration

Configure your Twilio phone number to use the ElevenLabs webhook:

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Phone Numbers** > **Manage** > **Active Numbers**
3. Select your phone number
4. Under **Voice & Fax**, set:
   - **A CALL COMES IN**: Webhook
   - **URL**: `https://your-domain.com/api/webhooks/twilio/elevenlabs`
   - **HTTP Method**: POST

Alternatively, you can use the standard voice webhook and redirect to ElevenLabs:
- **URL**: `https://your-domain.com/api/webhooks/twilio/voice`

### 4. Tenant Configuration (Optional)

Each tenant can have their own ElevenLabs agent. Configure in tenant settings:

```javascript
{
  "settings": {
    "elevenLabsAgentId": "tenant-specific-agent-id",
    "businessHours": {
      "monday": { "open": "09:00", "close": "17:00", "enabled": true },
      // ... other days
    }
  }
}
```

## API Endpoints

### Twilio Webhook Endpoints

#### POST `/api/webhooks/twilio/elevenlabs`

Main webhook for connecting Twilio calls to ElevenLabs.

**Request** (Twilio sends this automatically):
```
Content-Type: application/x-www-form-urlencoded

CallSid=CA123456789
From=+15559876543
To=+15551234567
CallStatus=ringing
Direction=inbound
```

**Response**: TwiML XML connecting to ElevenLabs
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/conversation?...">
      <Parameter name="agent_id" value="your-agent-id"/>
      <Parameter name="tenant_id" value="tenant-id"/>
      <Parameter name="call_sid" value="CA123456789"/>
      <Parameter name="business_name" value="Test Salon"/>
    </Stream>
  </Connect>
</Response>
```

### ElevenLabs Webhook Endpoints

#### POST `/api/ai/webhook/elevenlabs`

Handles callbacks from ElevenLabs agent, including tool calls.

**Request** (from ElevenLabs):
```json
{
  "event": "tool_call",
  "data": {
    "tool_name": "get_services",
    "parameters": {}
  },
  "agentId": "agent-123",
  "sessionId": "session-456"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "services": [
      { "id": "...", "name": "Haircut", "price": 50, "duration": 60 }
    ],
    "message": "We offer: Haircut, Styling, Coloring..."
  }
}
```

## Supported Tool Calls

The integration supports the following tool calls from ElevenLabs:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `check_availability` / `get_availability` | Check available time slots | `date`, `serviceId` |
| `book_appointment` / `create_appointment` | Create new appointment | `customerName`, `customerPhone`, `serviceId`, `startTime`, etc. |
| `cancel_appointment` | Cancel existing appointment | `appointmentId`, `reason` |
| `get_services` / `list_services` | Get available services | `limit` |
| `get_service_details` | Get specific service info | `serviceId` |
| `get_hours` / `get_business_hours` | Get business hours | none |
| `get_tenant_info` | Get tenant information | none |
| `find_appointment` | Find appointments by customer | `customerPhone`, `customerEmail` |

## Local Development with ngrok

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

Configure Twilio to use the ngrok URL for webhooks.

## Error Handling

The integration handles various error scenarios:

| Scenario | Response |
|----------|----------|
| Tenant not found | "This number is not in service." |
| ElevenLabs not configured | "Our AI assistant is temporarily unavailable." |
| No agent ID configured | "Our AI assistant is not properly configured." |
| Connection error | "We encountered an error. Please try again later." |

## Example System Prompt for ElevenLabs Agent

Here's a recommended system prompt for your ElevenLabs agent:

```
You are a friendly and professional AI receptionist for {{business_name}}. Your role is to help customers with:

1. **Booking Appointments**: Help customers schedule appointments by:
   - Asking what service they need
   - Checking availability using the check_availability tool
   - Collecting their name and contact information
   - Confirming the booking

2. **Service Information**: Provide details about services, prices, and duration using the get_services tool.

3. **Business Hours**: Share operating hours using the get_business_hours tool.

4. **Appointment Management**: Help customers cancel or reschedule appointments.

Guidelines:
- Always be polite and professional
- Confirm details before making bookings
- If you can't help with something, offer to connect them with a human
- Keep responses concise and natural for voice conversation
- When listing options, limit to 3-4 items at a time

Start by greeting the caller and asking how you can help them today.
```

## Monitoring and Logging

The integration logs important events:

```
2024-01-15 10:30:00 [INFO]: Twilio-ElevenLabs: Incoming call CA123 from +1555... to +1555...
2024-01-15 10:30:01 [INFO]: Twilio-ElevenLabs: Connected call CA123 to ElevenLabs agent xyz for tenant abc
2024-01-15 10:30:15 [INFO]: ElevenLabs tool call: get_services for tenant: abc
```

Monitor these logs to track:
- Call volume
- Connection success rate
- Tool usage patterns
- Error rates

## Troubleshooting

### Call Not Connecting to ElevenLabs

1. Verify `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` are set
2. Check tenant has a matching phone number configured
3. Ensure `APP_BASE_URL` is accessible from the internet
4. Review logs for error messages

### Tool Calls Not Working

1. Verify the ElevenLabs agent has tools configured
2. Check the tool webhook URL is set to `/api/ai/webhook/elevenlabs`
3. Ensure the tool names match exactly (case-sensitive)

### No Audio / One-Way Audio

1. Check Twilio webhook response is valid TwiML
2. Verify the ElevenLabs signed URL is valid
3. Ensure WebSocket connection is not blocked by firewall

## Security Considerations

1. **Webhook Validation**: In production, Twilio webhook signatures are validated
2. **API Keys**: Never expose API keys in client-side code
3. **Tenant Isolation**: Each tenant's data is isolated by tenant ID
4. **Rate Limiting**: API endpoints have rate limiting enabled

## Related Documentation

- [SETUP.md](./SETUP.md) - General setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [AI_FLOW.md](./AI_FLOW.md) - AI conversation flow details
- [API.md](./API.md) - API reference
