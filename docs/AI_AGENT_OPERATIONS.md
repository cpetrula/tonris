# CRITON.AI - Complete System Documentation & Operations Runbook

**Last Updated:** January 14, 2026
**Current Agent ID:** `agent_7701kb6wza37ejrvpbh337kbretp`
**Tenant (Test Salon):** `6b669acb-f51e-4be2-b290-af21e82ad8d5` (Tony's Hair Salon & Spa)

This document contains EVERYTHING needed to understand, maintain, and troubleshoot the CRITON.AI system. If something happens to the original developers, this document should enable anyone to pick up where they left off.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Tech Stack](#tech-stack)
3. [Hosting & Infrastructure](#hosting--infrastructure)
4. [Application Features](#application-features)
5. [Database Schema](#database-schema)
6. [Quick Reference](#quick-reference)
7. [ElevenLabs Configuration](#elevenlabs-configuration)
8. [Known Issues & Fixes](#known-issues--fixes)
9. [Diagnostic Commands](#diagnostic-commands)
10. [Common Problems & Solutions](#common-problems--solutions)
11. [Backend Validations](#backend-validations)
12. [System Prompt Reference](#system-prompt-reference)
13. [Tool Configuration](#tool-configuration)

---

## Application Overview

**CRITON.AI** is a SaaS platform that provides AI-powered phone receptionists for small businesses. When a customer calls a business, they speak with an AI agent that can:
- Answer questions about services, hours, and location
- Book, modify, and cancel appointments
- Look up customer history by phone number
- Allow employees to update their schedules via phone

### Target Market
- Hair salons & spas
- Dental offices
- Medical practices
- Legal offices
- Any appointment-based business

### Business Model
- Monthly subscription via Stripe
- Per-tenant phone numbers via Twilio
- AI voice conversations via ElevenLabs

---

## Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Vue.js 3** | Frontend framework | Latest |
| **Vite** | Build tool | Latest |
| **PrimeVue** | UI component library | Latest |
| **Pinia** | State management | Latest |
| **Vue Router** | Client-side routing | Latest |
| **Axios** | HTTP client | Latest |
| **Stripe.js** | Payment integration | Latest |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime | 18+ |
| **Express.js** | Web framework | 4.x |
| **Sequelize** | ORM | 6.x |
| **MySQL** | Database | 8.x |
| **JWT** | Authentication | jsonwebtoken |
| **bcrypt** | Password hashing | bcryptjs |
| **Winston** | Logging | Latest |
| **node-cron** | Scheduled tasks | Latest |

### External Services
| Service | Purpose | Account |
|---------|---------|---------|
| **ElevenLabs** | AI voice conversations | Conversational AI API |
| **Twilio** | Phone numbers & telephony | Voice API |
| **Stripe** | Payments & subscriptions | Connect |
| **Resend** | Transactional emails | API |

---

## Hosting & Infrastructure

### Production Environment

| Component | Platform | Instance/Details |
|-----------|----------|------------------|
| **Backend API** | Railway | `criton-ai-backend` service |
| **Frontend** | Railway | Served from backend `/frontend/dist` |
| **Database** | Railway | MySQL 8.x instance `mysql` |
| **Domain** | Custom | `criton.ai` |
| **SSL** | Railway | Auto-provisioned |

### Railway Project Structure
```
Railway Project: CRITON.AI
├── criton-ai-backend (Node.js service)
│   ├── Dockerfile or nixpacks.toml for build
│   ├── Auto-deploys from GitHub main branch
│   └── Environment variables configured in Railway
└── mysql (MySQL database)
    ├── Internal hostname for backend connection
    └── Managed backups by Railway
```

### Environment Variables (Railway)
```env
# Database
DATABASE_URL=mysql://user:pass@host:port/database
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=<from Railway>

# Authentication
JWT_SECRET=<secure random string>
JWT_EXPIRES_IN=7d

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=<from Twilio>

# ElevenLabs
ELEVENLABS_API_KEY=sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# App
APP_BASE_URL=https://criton.ai
NODE_ENV=production
PORT=3000
```

### GitHub Repository
- **Repo:** https://github.com/cpetrula/tonris
- **Main Branch:** `main` (auto-deploys to Railway)
- **Legacy Name:** The repo is named "tonris" (original project name)

### Deployment Process
1. Push code to `main` branch on GitHub
2. Railway automatically detects changes
3. Railway builds using `nixpacks.toml` configuration
4. New version deployed with zero downtime
5. Typically takes 1-2 minutes

---

## Application Features

### Admin Dashboard (`/app/*`)

#### Dashboard (`/app/dashboard`)
- Overview stats: appointments today, upcoming, completed, cancelled
- Quick access to main features

#### Appointments (`/app/appointments`)
- Calendar view and list view
- Create, edit, delete appointments
- Filter by status (Scheduled, Completed, Cancelled, No-show)
- Default filter: Scheduled only
- Search by customer name, phone, service

#### Employees (`/app/employees`)
- Add/edit/remove employees
- Set employee schedules (weekly availability)
- Assign services each employee can perform
- Employee phone numbers (for self-service schedule updates)

#### Services (`/app/services`)
- Define services offered
- Set pricing and duration
- Categorize services
- Enable/disable services

#### Locations (`/app/locations`)
- Multi-location support
- Set address and business hours per location

#### Reports (`/app/reports`)
- Call logs with AI conversation summaries
- Appointment analytics
- Revenue tracking
- Filter by date range

#### Settings (`/app/settings`)
- Business information
- Business hours
- AI agent configuration
- Notification preferences
- Timezone settings

#### Billing (`/app/billing`)
- Stripe subscription management
- View invoices
- Update payment method

### Public Pages

#### Home (`/`)
- Marketing landing page
- Feature highlights
- Pricing information

#### Sign Up (`/signup`)
- New tenant registration
- Stripe checkout integration

#### Login (`/login`)
- JWT-based authentication
- "Forgot password" flow

### AI Phone Features

#### Customer Calls
- Natural voice conversation
- Service inquiry
- Appointment booking
- Appointment modification
- Appointment cancellation
- Business hours/location questions

#### Employee Self-Service
- Employees call and are identified by phone number
- View their current schedule
- Update availability
- Call out sick

---

## Database Schema

### Core Tables

#### `tenants`
Multi-tenant root table. Each business is a tenant.
```sql
- id (UUID, PK)
- name
- email
- phone
- address, city, state, zip
- timezone (default: America/Los_Angeles)
- twilio_phone_number
- business_type_id (FK)
- settings (JSON) - business hours, AI config, etc.
- metadata (JSON)
- stripe_customer_id
- subscription_status
- created_at, updated_at
```

#### `employees`
Staff members who perform services.
```sql
- id (UUID, PK)
- tenant_id (FK)
- first_name, last_name
- email, phone
- schedule (JSON) - weekly availability blocks
- service_ids (JSON) - services they can perform
- is_active
- created_at, updated_at
```

#### `services`
Services offered by the business.
```sql
- id (UUID, PK)
- tenant_id (FK)
- name
- description
- price (DECIMAL)
- duration (INT, minutes)
- category
- is_active
- created_at, updated_at
```

#### `appointments`
Booked appointments.
```sql
- id (UUID, PK)
- tenant_id (FK)
- employee_id (FK)
- service_id (FK)
- customer_name
- customer_email
- customer_phone
- start_time (DATETIME)
- end_time (DATETIME)
- status (scheduled|confirmed|completed|cancelled|no_show)
- notes
- add_ons (JSON)
- created_at, updated_at
```

#### `call_logs`
Phone call records.
```sql
- id (UUID, PK)
- tenant_id (FK)
- twilio_call_sid
- direction (inbound|outbound)
- status
- from_number, to_number
- duration (seconds)
- started_at, ended_at
- metadata (JSON) - includes elevenLabsConversationId
- created_at, updated_at
```

#### `users`
Admin users who log into the dashboard.
```sql
- id (UUID, PK)
- tenant_id (FK)
- email
- password_hash
- role (admin|staff)
- is_active
- created_at, updated_at
```

#### `business_types`
Predefined business categories with default AI agents.
```sql
- id (UUID, PK)
- name
- agent_id (ElevenLabs agent ID)
- is_active
- created_at, updated_at
```

---

## Quick Reference

### API Key
```
ElevenLabs API Key: sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63
```

### Key Endpoints
| Purpose | Endpoint |
|---------|----------|
| Services lookup | `GET https://criton.ai/api/webhooks/elevenlabs/services?tenantId={id}` |
| Employees lookup | `GET https://criton.ai/api/webhooks/elevenlabs/employees?tenantId={id}` |
| Create appointment | `POST https://criton.ai/api/webhooks/elevenlabs/appointments?tenantId={id}` |
| Get appointments | `GET https://criton.ai/api/webhooks/elevenlabs/appointments?tenantId={id}&customerPhone={phone}` |
| Employee schedule | `POST https://criton.ai/api/ai/webhook/elevenlabs/employee-schedule?tenantId={id}&action={action}` |

### Dynamic Variables Passed to Agent
| Variable | Description | Example |
|----------|-------------|---------|
| `business_name` | Tenant name | "Tony's Hair Salon & Spa" |
| `business_hours_voice` | Human-readable hours | "Monday through Friday 9am to 5pm" |
| `today_hours` | Today's hours | "Today we're open 9am to 5pm" |
| `address_voice` | Speakable address | "123 Main St, Los Angeles" |
| `caller_number` | Caller's phone | "+18185316200" |
| `caller_name` | Name if known | "Anthony" |
| `caller_has_appointment_today` | "true" or "false" | "true" |
| `caller_appointments_today` | JSON of today's appointments | "[{...}]" |
| `current_datetime` | Current date/time | "2026-01-14T19:30:00" |

---

## ElevenLabs Configuration

### CRITICAL: Tool Unlinking Bug

**When you update the system prompt via API, ElevenLabs resets the tool_ids array!**

This means tools get unlinked from the agent. After ANY prompt update, you MUST re-link all 9 tools.

#### Re-link Tools Script
```python
import requests

url = "https://api.elevenlabs.io/v1/convai/agents/agent_7701kb6wza37ejrvpbh337kbretp"
headers = {
    "xi-api-key": "sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63",
    "Content-Type": "application/json"
}

all_tool_ids = [
    "tool_8701kby4d48begmtb6aqya38k4r7",  # update_appointment
    "tool_9801kbvk6ec9fyw9g8bpbj4p1znc",  # cancel_appointment
    "tool_6601kbbttqw7ehzt6aaqbsfam1e9",  # get_employees
    "tool_7201kba1gc0dft2vt991avkxbgek",  # get_services
    "tool_1301kex2ffd9ezxraxnf6dkk0z83",  # set_appointment
    "tool_8101kewdsvz4f2ts93kws5d28vc2",  # get_appointments
    "tool_1001kefnd0ykes583ct4dj0cmx7a",  # identify_employee_caller
    "tool_7701kefnd0ymf83tzph348b38qvm",  # get_employee_schedule
    "tool_5601kefnd0yneqmvwtd09fpqyh5h",  # update_employee_schedule
]

payload = {
    "conversation_config": {
        "agent": {
            "prompt": {
                "tool_ids": all_tool_ids
            }
        }
    }
}

response = requests.patch(url, headers=headers, json=payload)
print(f"Status: {response.status_code}")
```

### All 9 Tools

| Tool Name | Tool ID | Purpose |
|-----------|---------|---------|
| update_appointment | tool_8701kby4d48begmtb6aqya38k4r7 | Modify existing appointment |
| cancel_appointment | tool_9801kbvk6ec9fyw9g8bpbj4p1znc | Cancel appointment |
| get_employees | tool_6601kbbttqw7ehzt6aaqbsfam1e9 | List employees & availability |
| get_services | tool_7201kba1gc0dft2vt991avkxbgek | List services with IDs |
| set_appointment | tool_1301kex2ffd9ezxraxnf6dkk0z83 | Create new appointment |
| get_appointments | tool_8101kewdsvz4f2ts93kws5d28vc2 | Look up appointments by phone |
| identify_employee_caller | tool_1001kefnd0ykes583ct4dj0cmx7a | Check if caller is employee |
| get_employee_schedule | tool_7701kefnd0ymf83tzph348b38qvm | Get employee's weekly schedule |
| update_employee_schedule | tool_5601kefnd0yneqmvwtd09fpqyh5h | Update employee availability |

---

## Known Issues & Fixes

### Issue 1: Wrong Service Booked (e.g., "Haircut" becomes "Beard Trim")

**Root Cause:** AI was using service ID from employee's serviceIds array instead of looking up the correct service.

**Fix Applied:** Added to system prompt:
```
**SERVICE LOOKUP REQUIRED:**
When a customer mentions a service (haircut, color, trim, etc.), you MUST:
1. Call get_services to get the list of services with their IDs
2. Match the customer's request to the correct service NAME
3. Use that service's ID when calling set_appointment

DO NOT guess or assume service IDs from employee data - ALWAYS look them up with get_services.
```

### Issue 2: Booking on Closed Days (Saturday)

**Root Cause:** AI calculated wrong date (said "Friday January 17th" when Jan 17 is Saturday), and backend had no validation.

**Fix Applied (Backend):** Added business hours validation in `appointment.service.js`:
- `createAppointment()` now checks if business is open on requested day
- `updateAppointment()` also validates for rescheduling
- Returns error code `BUSINESS_CLOSED` if attempting to book on closed day

### Issue 3: Timezone Issues (4pm → 8am)

**Root Cause:** AI sends datetime with "Z" suffix (e.g., "2026-01-15T16:00:00Z") implying UTC, but actually means local time.

**Fix Applied (Backend):** `parseDateTimeInTimezone()` helper in `appointment.service.js`:
- Always strips Z suffix from datetime strings
- Interprets time in tenant's timezone
- Applies correct UTC offset

### Issue 4: AI Asking for Phone Number

**Root Cause:** System prompt didn't emphasize that `{{caller_number}}` is already available.

**Fix Applied:** Added to system prompt:
```
For modifications/cancellations: You ALREADY have their phone number as {{caller_number}} - use it with get_appointments. NEVER ask for their phone number!
```

### Issue 5: AI Asking for "First and Last Name"

**Root Cause:** No guidance on how to ask for name.

**Fix Applied:** Added to system prompt:
```
**NAME COLLECTION:**
Ask for the customer's NAME only (e.g., "Can I get your name?"). Do NOT ask for "first and last name".
```

### Issue 6: Date Calculation Errors (Friday → Saturday)

**Root Cause:** LLM inherent limitation with date math.

**Fix Applied:** Added to system prompt:
```
**DATE VERIFICATION - CRITICAL:**
Before confirming any appointment, you MUST verify the day of week matches the date:
- Use {{current_datetime}} to know today's date
- Count forward carefully: if today is Wednesday the 14th, then Thursday is the 15th, Friday is the 16th, Saturday is the 17th
- NEVER say a day name without verifying it matches the calendar date
```

### Issue 7: Multiple Confirmations Before Booking

**Root Cause:** No clear rules for modification flow.

**Fix Applied:** Added CRITICAL MODIFICATION RULES section (if applied):
```
# CRITICAL MODIFICATION RULES

When a caller wants to CHANGE or RESCHEDULE an appointment:
1. Use get_appointments with {{caller_number}} to find their appointment
2. Ask what they want to change
3. Collect the NEW information
4. Confirm the change ONCE
5. Call update_appointment ONCE
6. Confirm success

DO NOT: Ask for phone, confirm multiple times, re-read details repeatedly
```

### Issue 8: Employee Schedule Update Failing

**Root Cause:** ElevenLabs sends nested JSON arrays as strings. The `blocks` parameter arrived as:
```
"[{\"start\":\"12:00\",\"end\":\"17:00\"}]"  ← STRING (wrong)
```
Instead of:
```
[{"start":"12:00","end":"17:00"}]  ← ARRAY (expected)
```

**Fix Applied (Backend):** Added JSON parsing in `ai.controller.js` `handleEmployeeScheduleWebhook`:
```javascript
// Parse blocks if it's a string (ElevenLabs sometimes sends nested JSON as strings)
let parsedBlocks = blocks;
if (typeof blocks === 'string') {
  parsedBlocks = JSON.parse(blocks);
}
```

### Issue 9: Slow Initial Greeting (Delay Before AI Speaks)

**Root Cause:** The conversation initiation webhook was making a database query to fetch tenant data BEFORE the greeting could play. This added 500ms-1.5s of delay.

**Fix Applied (Backend):** Optimized `handleConversationInitiation` in `twilio-elevenlabs.handler.js`:
- Removed all database queries from the initialization flow
- Return immediately with minimal variables (tenant_id, caller_number, business_name)
- Context like caller appointments and business hours are now fetched via tools AFTER the caller states their intent

**Before:**
```
Call received → DB query → Build variables → Return → Greeting plays (~1-2s delay)
```

**After:**
```
Call received → Return immediately → Greeting plays (near-instant)
```

**Tradeoff:** AI no longer knows upfront if caller has an appointment today. It must call a tool to find out after the caller speaks. This is acceptable because most callers state their intent first anyway.

### Issue 10: Appointment Time Stored 8 Hours Off (Double Timezone Conversion)

**Symptom:** Booking appointment for 10am Pacific resulted in 6pm Pacific being stored.

**Root Cause:** The time was being converted TWICE:
1. `handleElevenLabsCreateAppointmentWebhook` in `ai.controller.js` converted "10:00 Pacific" → "18:00 UTC"
2. `createAppointment` in `appointment.service.js` then called `parseDateTimeInTimezone()` which stripped the Z suffix and converted "18:00" as if it were Pacific time → "02:00 UTC next day"

**The Math:**
```
Input:           "2026-01-16T10:00:00" (10am Pacific intended)
After webhook:   "2026-01-16T18:00:00Z" (correct UTC)
After strip Z:   "2026-01-16T18:00:00" (now treated as 6pm Pacific!)
After 2nd conv:  "2026-01-17T02:00:00Z" (6pm Pacific → UTC = 2am next day)
```

**Fix Applied (January 15, 2026):** Removed timezone conversion from `handleElevenLabsCreateAppointmentWebhook` (ai.controller.js lines 1088-1154). Now passes original `startTime` string to `createAppointment`, which handles timezone conversion as the single source of truth.

**Verification:** Checked all 5 callers of `createAppointment`:
- `appointment.controller.js` - passes raw startTime ✓
- `intent.handler.js` - passes raw startTime ✓
- `ai.controller.js:186` - passes raw startTime ✓
- `twilio-elevenlabs.handler.js` - passes raw startTime ✓
- `ai.controller.js:1167` (webhook) - was pre-converting, now fixed ✓

**Files Changed:** `backend/src/modules/ai-assistant/ai.controller.js`

---

## Diagnostic Commands

### Fetch Latest Conversation Transcript
```bash
# Get latest conversation ID
CONV_ID=$(curl -s "https://api.elevenlabs.io/v1/convai/conversations?agent_id=agent_7701kb6wza37ejrvpbh337kbretp&limit=1" \
  -H "xi-api-key: sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63" | jq -r '.conversations[0].conversation_id')

# Get full transcript
curl -s "https://api.elevenlabs.io/v1/convai/conversations/$CONV_ID" \
  -H "xi-api-key: sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63" | jq '.transcript[] | {role, message}'
```

### Check Tool Calls in Conversation
```bash
curl -s "https://api.elevenlabs.io/v1/convai/conversations/$CONV_ID" \
  -H "xi-api-key: sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63" | jq '[.transcript[] | select(.tool_calls | length > 0)] | .[] | {tool_calls, tool_results}'
```

### Get Current System Prompt
```bash
curl -s "https://api.elevenlabs.io/v1/convai/agents/agent_7701kb6wza37ejrvpbh337kbretp" \
  -H "xi-api-key: sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63" | jq -r '.conversation_config.agent.prompt.prompt'
```

### Verify Tools Are Linked
```bash
curl -s "https://api.elevenlabs.io/v1/convai/agents/agent_7701kb6wza37ejrvpbh337kbretp" \
  -H "xi-api-key: sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63" | jq '.conversation_config.agent.prompt.tools[] | .name'
```

**Expected output (9 webhook tools + 3 system tools):**
```
"update_appointment"
"cancel_appointment"
"get_employees"
"get_services"
"set_appointment"
"get_appointments"
"identify_employee_caller"
"get_employee_schedule"
"update_employee_schedule"
"end_call"
"language_detection"
"skip_turn"
```

### Test Employee Identification
```bash
curl -s -X POST "https://criton.ai/api/ai/webhook/elevenlabs/employee-schedule?tenantId=6b669acb-f51e-4be2-b290-af21e82ad8d5&action=identify" \
  -H "Content-Type: application/json" \
  -d '{"callerPhone": "+18185316200"}' | jq '.'
```

### Test Services Endpoint
```bash
curl -s "https://criton.ai/api/webhooks/elevenlabs/services?tenantId=6b669acb-f51e-4be2-b290-af21e82ad8d5" | jq '.data.services_offered[] | {id, name}'
```

### Test Get Appointments by Phone
```bash
curl -s "https://criton.ai/api/webhooks/elevenlabs/appointments?tenantId=6b669acb-f51e-4be2-b290-af21e82ad8d5&customerPhone=%2B18185316200" | jq '.data.appointments[] | {id, service: .service.name, startTime, status}'
```

---

## Common Problems & Solutions

### Problem: "set_appointment" Shows `tool_has_been_called: false`

**Diagnosis:** Check the tool_calls in the transcript:
```bash
curl -s "https://api.elevenlabs.io/v1/convai/conversations/$CONV_ID" \
  -H "xi-api-key: ..." | jq '[.transcript[] | select(.tool_calls | length > 0)] | .[-1].tool_calls[0]'
```

**Possible Causes:**
1. Tool not linked to agent (run verify tools command)
2. ElevenLabs rate limiting or transient error
3. Missing required parameters

**Solution:** Re-link tools and retry.

### Problem: AI Says Wrong Day Name for Date

**Diagnosis:** This is an LLM limitation. The AI knows today's date from `{{current_datetime}}` but miscalculates future days.

**Solution:**
1. Backend validation catches this if the wrong day is a closed day
2. System prompt now has explicit counting instructions
3. Consider adding a `current_day_of_week` dynamic variable in the future

### Problem: Appointment Created with Wrong Service

**Diagnosis:** Check the `serviceId` in the tool call:
```bash
# In the transcript, look for set_appointment tool call
# Compare serviceId to actual services:
curl -s "https://criton.ai/api/webhooks/elevenlabs/services?tenantId=..." | jq '.data.services_offered[] | {id, name}'
```

**Solution:** System prompt now requires calling `get_services` before booking.

### Problem: Tools Disappeared After Prompt Update

**Root Cause:** ElevenLabs API bug - updating prompt resets tool_ids.

**Solution:** Always re-link tools after any prompt update using the script above.

---

## Backend Validations

### Business Hours Validation
**File:** `backend/src/modules/appointments/appointment.service.js`

```javascript
// In createAppointment() and updateAppointment():
const businessHours = tenant?.settings?.businessHours || tenant?.businessHours;
if (businessHours) {
  const dayOfWeekInTz = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: tenantTimezone,
  }).format(startDateTime).toLowerCase();

  const dayHours = businessHours[dayOfWeekInTz];

  if (!dayHours || dayHours.enabled === false) {
    throw new AppError(
      `Cannot book appointment: Business is closed on ${dayName}`,
      400,
      'BUSINESS_CLOSED'
    );
  }
}
```

### Timezone Handling
**File:** `backend/src/modules/appointments/appointment.service.js`

```javascript
const parseDateTimeInTimezone = (dateTimeStr, timezone = 'America/Los_Angeles') => {
  if (!dateTimeStr) return null;
  // Strip Z suffix - AI incorrectly adds it
  const strippedDateTimeStr = dateTimeStr.replace(/[Zz]$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/, '');
  // Parse in tenant timezone...
};
```

---

## System Prompt Reference

The current system prompt includes these key sections:

1. **ABSOLUTE RULE** - Requires all 4 pieces before booking
2. **CONVERSATION PACING** - One question at a time
3. **Business Context** - Uses dynamic variables for hours/location
4. **CRITICAL BOOKING RULES** - Service lookup, name collection, date verification
5. **CRITICAL MODIFICATION RULES** - Single confirmation flow
6. **Employee Self-Service** - Phone-based employee identification
7. **Guardrails** - Never break character, never ask for phone

### Update System Prompt
```python
import requests

with open('new_prompt.txt', 'r') as f:
    new_prompt = f.read()

url = "https://api.elevenlabs.io/v1/convai/agents/agent_7701kb6wza37ejrvpbh337kbretp"
headers = {
    "xi-api-key": "sk_b88f7b9324391674252b948cc7f0d4a8f40352cbe4eaaa63",
    "Content-Type": "application/json"
}

payload = {
    "conversation_config": {
        "agent": {
            "prompt": {
                "prompt": new_prompt
            }
        }
    }
}

response = requests.patch(url, headers=headers, json=payload)
print(f"Status: {response.status_code}")

# IMPORTANT: Re-link tools after this!
```

---

## Tool Configuration

### Employee Schedule Endpoint Actions

| Action | Query Param | Body | Purpose |
|--------|-------------|------|---------|
| identify | `action=identify` | `{callerPhone}` | Check if caller is employee |
| get_schedule | `action=get_schedule` | `{callerPhone}` | Get employee's current schedule |
| update_schedule | `action=update_schedule` | `{callerPhone, date, enabled, blocks}` | Update day's schedule |

### Appointment Tool URLs

| Tool | Method | URL |
|------|--------|-----|
| get_appointments | GET | `/api/webhooks/elevenlabs/appointments` |
| set_appointment | POST | `/api/webhooks/elevenlabs/appointments` |
| update_appointment | PATCH | `/api/appointments/{id}` |
| cancel_appointment | DELETE | `/api/appointments/{id}` |

---

## Deployment Notes

- **Frontend:** Vue.js, built with `npm run build`, served from `/frontend/dist`
- **Backend:** Node.js/Express, deployed on Railway
- **Database:** MySQL/PostgreSQL on Railway
- **Auto-deploy:** Push to GitHub main branch triggers Railway deployment

### Files Modified (January 14, 2026)
1. `backend/src/modules/appointments/appointment.service.js` - Timezone fix, business hours validation
2. `backend/src/modules/ai-assistant/ai.routes.js` - Employee schedule webhook route
3. `backend/src/modules/ai-assistant/ai.controller.js` - Employee schedule webhook handler, blocks string parsing fix
4. `backend/src/modules/ai-assistant/twilio-elevenlabs.handler.js` - Caller appointment context, greeting speed optimization
5. `frontend/src/pages/AppointmentsPage.vue` - Delete button, default status filter

### Files Modified (January 15, 2026)
1. `backend/src/modules/ai-assistant/ai.controller.js` - Fixed double timezone conversion bug (Issue 10)
2. `backend/src/modules/appointments/appointment.service.js` - Chris fixed nested businessHours.businessHours access
3. `docs/AI_AGENT_OPERATIONS.md` - Added Issue 10 documentation
4. Moved 11 obsolete fix docs to `mark4deletion/` folder
5. Added `CurrentAgentSystemPrompt.md` with current ElevenLabs agent prompt

---

## Contact & Resources

- **ElevenLabs Dashboard:** https://elevenlabs.io/app/conversational-ai
- **Railway Dashboard:** https://railway.app
- **Production URL:** https://criton.ai
- **GitHub Repo:** https://github.com/cpetrula/tonris
