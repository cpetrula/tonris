# TONRIS AI Conversation Flow

This document explains the AI conversation logic used in the TONRIS platform for handling customer interactions via voice calls and chat.

## Overview

TONRIS uses an AI-powered conversation engine to handle customer interactions. The system can:

- Answer incoming phone calls
- Process natural language input
- Detect customer intents
- Execute business actions (booking, cancellation, etc.)
- Provide conversational responses
- Hand off to human agents when needed

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Customer Interaction                          │
│    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐     │
│    │  Phone Call  │      │     SMS      │      │   Web Chat   │     │
│    └──────┬───────┘      └──────┬───────┘      └──────┬───────┘     │
└───────────┼──────────────────────┼──────────────────────┼───────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AI Conversation Engine                          │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    Input Processing                         │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │     │
│  │  │ Speech-to-   │  │    Text      │  │   Context    │      │     │
│  │  │    Text      │  │  Normalizer  │  │   Manager    │      │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                │                                     │
│                                ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                   Intent Detection                          │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │     │
│  │  │   Pattern    │  │    Entity    │  │  Confidence  │      │     │
│  │  │   Matching   │  │  Extraction  │  │    Scoring   │      │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                │                                     │
│                                ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    Intent Handler                           │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │     │
│  │  │   Action     │  │   Business   │  │   Response   │      │     │
│  │  │   Router     │  │    Logic     │  │   Generator  │      │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                │                                     │
│                                ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                   Output Generation                         │     │
│  │  ┌──────────────┐  ┌──────────────┐                        │     │
│  │  │   Text-to-   │  │    Text      │                        │     │
│  │  │   Speech     │  │   Response   │                        │     │
│  │  └──────────────┘  └──────────────┘                        │     │
│  └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

## Supported Intent Types

The AI recognizes the following intents:

| Intent | Description | Trigger Phrases |
|--------|-------------|-----------------|
| `book_appointment` | Book a new appointment | "book", "schedule", "appointment", "make appointment" |
| `check_availability` | Check available time slots | "available", "availability", "when open", "free time", "slot" |
| `cancel_appointment` | Cancel existing appointment | "cancel", "remove appointment" |
| `modify_appointment` | Reschedule or change appointment | "reschedule", "change appointment", "modify appointment" |
| `get_services` | Get list of services | "service", "services", "offer", "menu", "price", "pricing" |
| `get_hours` | Get business hours | "hours", "open", "close", "business hours", "working hours" |
| `human_handoff` | Transfer to human agent | "speak human", "real person", "transfer", "agent" |
| `greeting` | Initial greeting | "hello", "hi", "hey", "good morning", "good afternoon" |
| `goodbye` | End conversation | "bye", "goodbye", "thank", "thanks" |
| `general_inquiry` | General questions | (fallback for unmatched input) |
| `unknown` | Unrecognized input | (very low confidence) |

## Action Types

Each intent maps to an action type:

| Action Type | Description |
|-------------|-------------|
| `query_availability` | Query employee availability |
| `create_appointment` | Create new appointment |
| `update_appointment` | Modify existing appointment |
| `cancel_appointment` | Cancel appointment |
| `get_services` | Retrieve service list |
| `get_business_hours` | Get business hours |
| `transfer_to_human` | Initiate human handoff |
| `end_conversation` | End the session |
| `continue_conversation` | Continue collecting information |

## Conversation Flow Diagrams

### Booking Flow

```
┌─────────────────┐
│  Customer Says  │
│ "Book haircut"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Detect Intent:  │     │  Extract Entity │
│ BOOK_APPOINTMENT│────>│  service: hair  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       │
┌─────────────────┐              │
│ Check Required  │<─────────────┘
│    Fields       │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ Missing │──────────────────────────────┐
    │  Data?  │                              │
    └────┬────┘                              │
         │ No                                │ Yes
         ▼                                   ▼
┌─────────────────┐              ┌─────────────────┐
│ Check Employee  │              │  Ask for More   │
│  Availability   │              │   Information   │
└────────┬────────┘              └────────┬────────┘
         │                                │
         ▼                                │
    ┌─────────┐                           │
    │Available│                           │
    │   ?     │                           │
    └────┬────┘                           │
     Yes │   No                           │
         │    │                           │
         ▼    ▼                           │
┌─────────┐ ┌─────────────────┐           │
│ Create  │ │ Suggest         │           │
│Appt     │ │ Alternatives    │           │
└────┬────┘ └────────┬────────┘           │
     │               │                    │
     ▼               ▼                    │
┌─────────────────────────────────────────┴───────┐
│                  Respond to Customer             │
└─────────────────────────────────────────────────┘
```

### Required Fields for Booking

| Field | Required | Source |
|-------|----------|--------|
| `serviceId` | Yes | Extracted from conversation or asked |
| `employeeId` | Yes | Selected from available employees |
| `startTime` | Yes | Extracted or offered from availability |
| `customerName` | Yes | Asked during booking |
| `customerPhone` OR `customerEmail` | Yes | Asked during booking |
| `notes` | No | Optional |

### Cancellation Flow

```
Customer: "I need to cancel my appointment"
    │
    ▼
┌─────────────────┐
│ Detect Intent:  │
│CANCEL_APPOINTMENT│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check for ID    │
│ or Contact Info │
└────────┬────────┘
         │
         ▼
    ┌─────────────┐
    │ Have ID or  │
    │  Contact?   │
    └──────┬──────┘
      Yes  │    No
           │     │
           ▼     ▼
    ┌──────────┐ ┌────────────────┐
    │  Look up │ │ "Could you     │
    │Appointment│ │ provide your   │
    └────┬─────┘ │ phone or email?"│
         │       └────────┬───────┘
         ▼                │
    ┌─────────┐           │
    │  Found? │           │
    └────┬────┘           │
     Yes │  No            │
         │   │            │
         ▼   ▼            ▼
┌────────────┐ ┌────────────────────┐
│  Cancel    │ │ "I couldn't find   │
│Appointment │ │ an appointment..." │
└────────────┘ └────────────────────┘
```

## Entity Extraction

The AI extracts various entities from user input:

### Date Extraction

| Input | Extracted Value |
|-------|-----------------|
| "tomorrow" | Next day date |
| "today" | Current date |
| "next Monday" | Next occurrence of Monday |
| "1/15" or "01-15" | January 15 |
| "January 15, 2024" | ISO date |

### Time Extraction

| Input | Extracted Value |
|-------|-----------------|
| "2 PM" | 14:00 |
| "2:30 pm" | 14:30 |
| "14:00" | 14:00 |
| "2 o'clock" | 14:00 (PM assumed in business context) |

### Contact Information

| Type | Pattern |
|------|---------|
| Phone | `+1XXXXXXXXXX`, `(XXX) XXX-XXXX`, `XXX-XXX-XXXX` |
| Email | `xxx@xxx.xxx` |

## Conversation Context

Each conversation maintains context:

```javascript
{
  sessionId: "uuid-session-id",
  tenantId: "tenant-id",
  history: [
    { role: "system", content: "System prompt..." },
    { role: "user", content: "I'd like to book..." },
    { role: "assistant", content: "I'd be happy to help..." }
  ],
  metadata: {
    startTime: "2024-01-15T10:00:00.000Z",
    model: "gpt-4",
    channel: "voice" // or "sms", "web"
  },
  collectedEntities: {
    serviceId: null,
    employeeId: null,
    startTime: null,
    customerName: null,
    customerPhone: null
  }
}
```

## AI Provider Interface

TONRIS uses a provider-agnostic interface for AI services:

```javascript
class AIProviderInterface {
  // Start a new conversation
  async startSession(tenantId, options) {}
  
  // Process user input
  async processInput(input, context) {}
  
  // Detect intent from input
  async detectIntent(input, context) {}
  
  // Convert text to speech
  async textToSpeech(text, options) {}
  
  // Convert speech to text
  async speechToText(audio, options) {}
  
  // End conversation
  async endSession(sessionId) {}
  
  // Check if provider is available
  async isAvailable() {}
}
```

### OpenAI Implementation

```javascript
const OpenAIService = {
  // Pattern-based intent detection
  detectIntent(input, context) {
    const patterns = [
      { pattern: /book|schedule|appointment/i, intent: 'book_appointment' },
      { pattern: /available|availability/i, intent: 'check_availability' },
      // ... more patterns
    ];
    // Match against patterns and extract entities
  },
  
  // Generate contextual response
  processInput(input, context) {
    // Add to conversation history
    // Detect intent
    // Generate response based on intent
    // Return structured response
  }
};
```

### ElevenLabs Integration

For voice interactions, ElevenLabs provides:
- High-quality text-to-speech
- Real-time voice synthesis
- Multiple voice options
- Webhook callbacks for completion

## Response Generation

### Response Format

```javascript
{
  text: "Your appointment has been confirmed for Monday at 2 PM.",
  intent: {
    name: "book_appointment",
    confidence: 0.95,
    entities: {
      date: "2024-01-15",
      time: "14:00"
    }
  },
  action: {
    type: "create_appointment",
    data: { appointmentId: "uuid" }
  },
  shouldHandoff: false,
  shouldEndConversation: false
}
```

### Response Templates

**Greeting:**
```
"Hello! Thank you for calling. How can I help you today? 
I can assist with booking appointments, checking availability, 
or answering questions about our services."
```

**Booking Confirmation:**
```
"Your appointment has been confirmed for {day} at {time}. 
You'll receive a confirmation message shortly. 
Is there anything else I can help you with?"
```

**Availability Check:**
```
"We have {count} time slots available on {date}. 
Would you like me to list them for you?"
```

**Missing Information:**
```
"To book an appointment, I'll need to know which service 
you're interested in. What would you like?"
```

**Human Handoff:**
```
"I'll connect you with a team member right away. 
Please hold while I transfer your call."
```

**Goodbye:**
```
"Thank you for calling! Have a great day. Goodbye!"
```

## Error Handling

### Graceful Degradation

```javascript
try {
  const response = await aiService.processInput(input, context);
  return response;
} catch (error) {
  logger.error(`AI error: ${error.message}`);
  return {
    text: "I'm sorry, I encountered an issue. Let me transfer you to someone who can help.",
    shouldHandoff: true
  };
}
```

### Fallback Responses

| Scenario | Response |
|----------|----------|
| Intent not detected | "I'd be happy to help. Could you tell me more?" |
| Time slot conflict | "That time is no longer available. Would you like alternatives?" |
| Appointment not found | "I couldn't find an appointment with that information." |
| Service unavailable | "Our AI assistant is temporarily unavailable. Please try again." |

## Voice Call Integration

### Inbound Call Flow

```
1. Twilio receives incoming call
2. Webhook triggers /api/webhooks/twilio/voice
3. Backend identifies tenant from phone number
4. AI session starts with greeting
5. Twilio streams audio to STT service
6. AI processes transcribed text
7. Response sent to TTS service
8. Audio played to caller
9. Repeat until call ends or handoff
```

### Status Handling

```javascript
const CALL_STATUS = {
  INITIATED: 'initiated',    // Call starting
  RINGING: 'ringing',        // Ringing customer
  IN_PROGRESS: 'in-progress', // Connected
  COMPLETED: 'completed',    // Normal end
  BUSY: 'busy',              // Line busy
  NO_ANSWER: 'no-answer',    // No pickup
  CANCELED: 'canceled',      // Caller hung up
  FAILED: 'failed',          // Technical failure
};
```

## Configuration Options

Each tenant can customize AI behavior:

```javascript
{
  // AI Settings (in tenant.settings)
  aiConfig: {
    greeting: "Hello! Thank you for calling My Salon.",
    tone: "professional and friendly",
    businessName: "My Salon",
    language: "en-US",
    voiceId: "elevenlabs-voice-id",
    handoffPhone: "+15555555555", // Number for human handoff
    enableVoice: true,
    enableSms: true
  }
}
```

## Performance Metrics

Track AI performance:

| Metric | Description |
|--------|-------------|
| Intent accuracy | % of correctly detected intents |
| Booking success rate | % of booking attempts completed |
| Average conversation length | Number of turns per conversation |
| Handoff rate | % of calls transferred to humans |
| Response latency | Time from input to response |

## Best Practices

### Prompt Engineering

1. **Be specific** - Clear system prompts improve intent detection
2. **Use examples** - Few-shot examples help with edge cases
3. **Set boundaries** - Define what the AI can and cannot do
4. **Handle ambiguity** - Ask clarifying questions when unsure

### Conversation Design

1. **Confirm important details** - Always confirm before booking
2. **Offer alternatives** - When requested time isn't available
3. **Stay on topic** - Gently redirect off-topic questions
4. **Know when to handoff** - Complex issues need humans

### Testing

1. **Intent coverage** - Test all supported intents
2. **Entity extraction** - Verify date/time parsing
3. **Edge cases** - Unclear input, multiple intents
4. **Error recovery** - System failures, API timeouts
