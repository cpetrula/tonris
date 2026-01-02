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
# DEPRECATED: ELEVENLABS_AGENT_ID - Agent ID is now determined dynamically based on tenant's business type
# ELEVENLABS_AGENT_ID=your_agent_id  # Only needed for backward compatibility
ELEVENLABS_VOICE_ID=your_voice_id  # Optional
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret  # Required for production webhook verification
```

### 2. Business Types Configuration

**NEW**: Agent IDs are now configured per business type rather than globally. Each tenant is assigned a business type, and the system automatically selects the appropriate ElevenLabs agent based on that business type.

#### Setting Up Business Types

1. Business types are stored in the `business_types` table
2. Each business type has an associated `agent_id` that specifies which ElevenLabs agent to use
3. Tenants are assigned a `business_type_id` which links them to their business type

Example business types:
- Restaurant / Food Service → agent-food-service-123
- Healthcare / Medical → agent-healthcare-456
- Salon / Spa → agent-salon-789
- Legal Services → agent-legal-012

To configure business types, update the `business_types` table with your ElevenLabs agent IDs:

```sql
UPDATE business_types 
SET agent_id = 'your-elevenlabs-agent-id' 
WHERE business_type = 'Salon / Spa';
```

#### Agent ID Resolution Order

When a call comes in, the system determines which agent to use in the following order:

1. **Business Type Agent** (Recommended): If the tenant has a `business_type_id`, the agent ID from the associated business type is used
2. **Tenant-Specific Agent** (Fallback): If no business type is configured, the system checks `tenant.settings.elevenLabsAgentId` or `tenant.metadata.elevenLabsAgentId`
3. **Error**: If no agent ID is found through any of these methods, the call returns an error

### 3. ElevenLabs Agent Setup

1. Log in to your ElevenLabs account
2. Navigate to **Conversational AI** > **Agents**
3. Create agents for each business type you support (or use existing ones)
4. Copy the **Agent ID** for each agent and update the `business_types` table accordingly
5. Configure each agent's:
   - **Voice**: Select the voice for the agent
   - **System Prompt**: Define the agent's personality and capabilities (customize for each business type)
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

### 4. Twilio Webhook Configuration

Configure your Twilio phone number to use the ElevenLabs webhook:

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to **Phone Numbers** > **Manage** > **Active Numbers**
3. Select your phone number
4. Under **Voice & Fax**, set:
   - **A CALL COMES IN**: Webhook
   - **URL**: `https://your-domain.com/api/webhooks/twilio/elevenlabs`
   - **HTTP Method**: POST

> **Note**: The standard voice webhook (`/api/webhooks/twilio/voice`) handles calls differently and does not automatically connect to ElevenLabs. Use the ElevenLabs-specific webhook endpoint for AI voice conversations.

### 5. Tenant Configuration

Each tenant must be configured with:

1. **Twilio Phone Number** (Required): To identify which tenant owns the incoming call
2. **Business Type** (Recommended): To automatically select the appropriate ElevenLabs agent

```javascript
{
  "twilioPhoneNumber": "+15551234567",  // Required: Twilio phone number for this tenant
  "businessTypeId": "business-type-uuid",  // Recommended: Links to business_types table for agent selection
  "settings": {
    "elevenLabsAgentId": "tenant-specific-agent-id",  // Optional: Override agent for this specific tenant (fallback)
    "businessHours": {
      "monday": { "open": "09:00", "close": "17:00", "enabled": true },
      // ... other days
    }
  }
}
```

**Important**: When setting up a new tenant:
1. Assign a `business_type_id` to automatically use the agent configured for that business type
2. Optionally set `settings.elevenLabsAgentId` to override the business type's agent for special cases
3. If neither is set, calls will fail with a "not properly configured" error

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

Handles callbacks from ElevenLabs agent, including tool calls and conversation events.

**ElevenLabs Standard Request Format** (post-call transcription, conversation events):
```json
{
  "type": "post_call_transcription",
  "event_timestamp": 1739537297,
  "data": {
    "agent_id": "xyz",
    "conversation_id": "abc",
    "status": "done",
    "transcript": []
  }
}
```

**Alternative Request Format** (tool calls, legacy integrations):
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

The webhook handler supports both `type` (ElevenLabs standard) and `event` (legacy) fields for event type identification, and both root-level and nested `data.agent_id` for agent identification.

**Supported Event Types**:
- `conversation_started` - Conversation has begun
- `conversation_ended` - Conversation has ended
- `post_call_transcription` - Post-call transcript is available
- `tool_call` - Agent is requesting a tool call

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

#### POST `/api/webhooks/elevenlabs/conversation-initiation`

**Conversation Initiation Client Data Webhook** - Called by ElevenLabs when a new Twilio phone call or SIP trunk call conversation begins. This webhook allows the server to dynamically provide conversation configuration and variables based on the incoming call data.

**Use Case**: Configure this webhook URL in your ElevenLabs agent settings to enable dynamic conversation configuration for each call.

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `X-ElevenLabs-Signature` | Yes (production) | HMAC-SHA256 signature of request body |
| `Content-Type` | Yes | `application/json` |

**Request** (from ElevenLabs):
```json
{
  "type": "conversation_initiation_client_data",
  "conversation_id": "unique-conversation-id",
  "agent_id": "elevenlabs-agent-id",
  "dynamic_variables": {
    "tenant_id": "tenant-identifier",
    "caller_number": "+15551234567",
    "call_sid": "CA12345...",
    "business_name": "My Business"
  }
}
```

**Response**:
```json
{
  "dynamic_variables": {
    "tenant_id": "tenant-identifier",
    "tenant_name": "My Business",
    "business_name": "My Business",
    "caller_number": "+15551234567",
    "call_sid": "CA12345...",
    "conversation_id": "unique-conversation-id",
    "business_hours_summary": "We're open Monday through Friday from 09:00 to 17:00."
  },
  "conversation_config_override": {
    "agent": {
      "agent_output_audio_format": "ulaw_8000",
      "user_input_audio_format": "ulaw_8000",
      "language": "en"
    },
    "tts": {
      "output_format": "ulaw_8000"
    }
  }
}

**Note**: `first_message` cannot be overridden via the API. The greeting message must be configured directly in the ElevenLabs agent dashboard. You can use dynamic variables like `{{business_name}}` in the dashboard to personalize greetings.
```

**Configuration in ElevenLabs Dashboard**:
1. Navigate to your ElevenLabs agent settings
2. Under "Webhooks" or "Conversation Initiation", add the webhook URL:
   - URL: `https://your-domain.com/api/webhooks/elevenlabs/conversation-initiation`
3. Set the webhook secret (recommended for production):
   - Generate a secure random string
   - Add it to your `.env` as `ELEVENLABS_WEBHOOK_SECRET`
   - Configure the same secret in ElevenLabs dashboard

#### GET `/api/webhooks/elevenlabs/services`

**Client Data Webhook for Services** - Called by ElevenLabs to fetch available services for a tenant. This endpoint does not require Bearer token authentication, making it suitable for ElevenLabs webhook calls.

**Use Case**: Configure this webhook URL in your ElevenLabs agent settings to enable dynamic service retrieval for each call. This is useful when you want ElevenLabs to automatically fetch the list of services.

**Query Parameters**:
| Parameter | Required | Description |
|-----------|----------|-------------|
| `tenantId` | Yes | The tenant identifier (UUID format) |

**Headers** (optional):
| Header | Required | Description |
|--------|----------|-------------|
| `X-ElevenLabs-Signature` | No (Yes in production) | HMAC-SHA256 signature of the query string |

**Request**:
```
GET /api/webhooks/elevenlabs/services?tenantId=de535df4-ccee-11f0-a2aa-12736706c408
```

**Response**:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "service-uuid",
        "name": "Haircut",
        "description": "A classic haircut",
        "price": 50,
        "duration": 60,
        "category": "hair"
      }
    ],
    "total": 1,
    "tenantId": "de535df4-ccee-11f0-a2aa-12736706c408"
  }
}
```

**Configuration in ElevenLabs Dashboard**:
1. Navigate to your ElevenLabs agent settings
2. Under "Client Data" or "Data Sources", add the webhook URL:
   - URL: `https://your-domain.com/api/webhooks/elevenlabs/services?tenantId=YOUR_TENANT_ID`
3. Optionally set the webhook secret for production use

#### POST `/api/webhooks/elevenlabs/appointments`

**Create Appointment Webhook** - Called by ElevenLabs Custom Actions to create appointments. This endpoint does not require Bearer token authentication.

**Use Case**: Configure this as a Custom Action URL in your ElevenLabs agent to enable direct appointment creation via HTTP POST.

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `X-ElevenLabs-Signature` | Yes (production) | HMAC-SHA256 signature of request body |
| `Content-Type` | Yes | `application/json` |

**Request** (from ElevenLabs):
```json
{
  "tenantId": "de535df4-ccee-11f0-a2aa-12736706c408",
  "employeeId": "12345678-1234-1234-1234-123456789012",
  "serviceId": "87654321-4321-4321-4321-210987654321",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+15551234567",
  "startTime": "2024-01-15T10:00:00Z",
  "addOns": [],
  "notes": "Created via AI assistant"
}
```

**Query Parameters** (alternative):
| Parameter | Required | Description |
|-----------|----------|-------------|
| `tenantId` | No | Tenant UUID (can be in body or query) |

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "appt-uuid",
      "tenantId": "de535df4-ccee-11f0-a2aa-12736706c408",
      "employeeId": "12345678-1234-1234-1234-123456789012",
      "serviceId": "87654321-4321-4321-4321-210987654321",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "customerPhone": "+15551234567",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:00:00Z",
      "status": "scheduled",
      "notes": "Created via ElevenLabs AI"
    },
    "message": "Appointment created successfully"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "employeeId, serviceId, customerName, and startTime are required",
  "code": "VALIDATION_ERROR"
}
```

**Configuration in ElevenLabs Dashboard**:
1. Navigate to your ElevenLabs agent settings
2. Under "Custom Actions", add a new action:
   - Name: `create_appointment`
   - Method: POST
   - URL: `https://your-domain.com/api/webhooks/elevenlabs/appointments?tenantId=YOUR_TENANT_ID`
   - Headers: `Content-Type: application/json`
3. Define the parameters: `employeeId`, `serviceId`, `customerName`, `customerEmail`, `customerPhone`, `startTime`, `notes`
4. Optionally set the webhook secret for production use

**Example Usage**:
```bash
curl -X POST "https://your-domain.com/api/webhooks/elevenlabs/appointments?tenantId=de535df4-ccee-11f0-a2aa-12736706c408" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "12345678-1234-1234-1234-123456789012",
    "serviceId": "87654321-4321-4321-4321-210987654321",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+15551234567",
    "startTime": "2024-01-15T10:00:00Z",
    "notes": "Haircut appointment"
  }'
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

1. Verify `ELEVENLABS_API_KEY` is set
2. Check tenant has a matching phone number configured
3. Verify tenant has a valid `business_type_id` or `settings.elevenLabsAgentId`
4. Check that the business type has an active agent ID configured
5. Ensure `APP_BASE_URL` is accessible from the internet
6. Review logs for error messages

Common error messages:
- "No agent ID configured for tenant" - Check that tenant has `business_type_id` or `settings.elevenLabsAgentId`
- "Business type not found" - The `business_type_id` references a non-existent business type
- "Business type is not active" - The business type exists but is marked as inactive

### Call Immediately Disconnects After Connecting

This is often caused by audio format incompatibility. Check the following:

1. **ElevenLabs Dashboard Configuration**:
   - Log in to your ElevenLabs account
   - Navigate to the Agent settings
   - **Enable "Overrides"** - This must be enabled for the code to override the default audio format
   - In the Agent's Voice settings, ensure the TTS output format is set to `ulaw_8000` (mu-law 8kHz)

2. **WebSocket Connection Logs**:
   - Check the server logs for ElevenLabs WebSocket close codes:
     - Code `1000`: Normal closure
     - Code `1006`: Abnormal closure (connection lost) - often indicates audio format issues
     - Code `4xxx`: Application-specific errors from ElevenLabs
   
3. **Verify Audio Format Configuration**:
   - The system sends `agent_output_audio_format: 'ulaw_8000'` and `user_input_audio_format: 'ulaw_8000'`
   - These settings must be accepted by ElevenLabs for Twilio compatibility
   - If the agent doesn't have overrides enabled, it will ignore these settings

4. **Check for Error Messages**:
   - Look for `[MediaStream] ElevenLabs error` in the logs
   - Check for `conversation_initiation_metadata` message - if not received, initialization failed

5. **First Message Configuration**:
   - The greeting/first message **must** be configured in the ElevenLabs agent dashboard
   - It **cannot** be overridden via the API or WebSocket connection
   - If your agent doesn't have a first message configured in the dashboard, it may wait for user input
   - Use dynamic variables like `{{business_name}}` in the dashboard to personalize greetings

### Tool Calls Not Working

1. Verify the ElevenLabs agent has tools configured
2. Check the tool webhook URL is set to `/api/ai/webhook/elevenlabs`
3. Ensure the tool names match exactly (case-sensitive)

### No Audio / One-Way Audio

1. Check Twilio webhook response is valid TwiML
2. Verify the ElevenLabs signed URL is valid
3. Ensure WebSocket connection is not blocked by firewall
4. Verify the audio format is set to `ulaw_8000` in both directions

### Common ElevenLabs Dashboard Settings

When setting up your ElevenLabs agent, ensure these settings are configured:

1. **Agent Settings > Advanced**:
   - Enable "Allow overrides from client"
   - This allows the application to set audio format parameters

2. **Agent Settings > Voice**:
   - Set TTS Output Format to `ulaw_8000` (for telephony)
   - This ensures audio is compatible with Twilio

3. **Agent Settings > Conversation**:
   - **IMPORTANT**: Configure a first message/greeting for the agent in the dashboard
   - This cannot be set via API - it must be configured directly in ElevenLabs
   - Use dynamic variables like `{{business_name}}`, `{{tenant_name}}` in the greeting to personalize it
   - Set appropriate language settings

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
