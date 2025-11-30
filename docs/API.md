# TONRIS API Documentation

This document provides complete documentation for all TONRIS API endpoints.

## Base URL

```
Development: http://localhost:3000
Production: https://api.tonris.com
```

## Authentication

Most API endpoints require authentication via JWT Bearer token.

```http
Authorization: Bearer <access_token>
```

### Multi-Tenant Context

All `/api/*` routes require tenant context, provided via:

```http
X-Tenant-ID: <tenant_id>
```

Or as a query parameter: `?tenantId=<tenant_id>`

---

## Health Check Endpoints

### GET /health

Basic health check endpoint.

**Authentication**: None

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

### GET /health/detailed

Detailed health check including database status.

**Authentication**: None

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "checks": {
    "server": {
      "status": "up",
      "uptime": 86400
    },
    "database": {
      "status": "up"
    },
    "memory": {
      "heapUsed": 52428800,
      "heapTotal": 104857600
    }
  }
}
```

### GET /health/ready

Kubernetes readiness probe.

**Response (200)**:
```json
{
  "success": true,
  "status": "ready"
}
```

**Response (503)**:
```json
{
  "success": false,
  "status": "not ready",
  "message": "Database connection not available"
}
```

### GET /health/live

Kubernetes liveness probe.

**Response**:
```json
{
  "success": true,
  "status": "alive"
}
```

---

## Authentication Endpoints

Base path: `/api/auth`

### POST /api/auth/signup

Register a new user and tenant.

**Authentication**: None

**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "tenantName": "My Salon",
  "tenantSlug": "my-salon"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "tenantId": "tenant-id",
      "twoFactorEnabled": false,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "tenant": {
      "id": "uuid-here",
      "tenantId": "tenant-id",
      "name": "My Salon",
      "slug": "my-salon",
      "status": "pending"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### POST /api/auth/login

Authenticate user and receive tokens.

**Authentication**: None

**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "twoFactorCode": "123456"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "tenantId": "tenant-id",
      "twoFactorEnabled": false,
      "isActive": true
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### POST /api/auth/refresh

Refresh access token using refresh token.

**Authentication**: None

**Request Body**:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token"
  }
}
```

### POST /api/auth/forgot-password

Initiate password reset flow.

**Authentication**: None

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset instructions sent to email"
}
```

### POST /api/auth/reset-password

Reset password using token from email.

**Authentication**: None

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecureP@ssw0rd"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### GET /api/auth/me

Get current authenticated user profile.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "tenantId": "tenant-id",
    "twoFactorEnabled": false,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### POST /api/auth/2fa/setup

Generate 2FA secret and QR code.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### POST /api/auth/2fa/verify

Verify and enable 2FA.

**Authentication**: Required

**Request Body**:
```json
{
  "code": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Two-factor authentication enabled"
}
```

### POST /api/auth/2fa/disable

Disable 2FA.

**Authentication**: Required

**Request Body**:
```json
{
  "code": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Two-factor authentication disabled"
}
```

---

## Current User Endpoint

### GET /api/me

Get current user and tenant context.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "tenantId": "tenant-id"
    },
    "tenant": {
      "id": "uuid-here",
      "tenantId": "tenant-id",
      "name": "My Salon",
      "slug": "my-salon",
      "status": "active",
      "planType": "professional",
      "settings": {}
    }
  }
}
```

---

## Tenant Endpoints

Base path: `/api/tenant`

### POST /api/tenant

Create a new tenant.

**Authentication**: None (used in signup flow)

**Request Body**:
```json
{
  "name": "My Salon",
  "slug": "my-salon",
  "contactEmail": "contact@mysalon.com",
  "contactPhone": "+15555555555"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "tenantId": "tenant-id",
    "name": "My Salon",
    "slug": "my-salon",
    "status": "pending",
    "planType": "free",
    "contactEmail": "contact@mysalon.com",
    "contactPhone": "+15555555555",
    "settings": {}
  }
}
```

### GET /api/tenant

Get current tenant information.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "tenantId": "tenant-id",
    "name": "My Salon",
    "slug": "my-salon",
    "status": "active",
    "planType": "professional",
    "contactEmail": "contact@mysalon.com",
    "contactPhone": "+15555555555",
    "settings": {
      "timezone": "America/New_York",
      "currency": "USD",
      "businessHours": {}
    }
  }
}
```

### PATCH /api/tenant

Update tenant information.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "My Updated Salon",
  "contactPhone": "+15555555556"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "My Updated Salon",
    "contactPhone": "+15555555556"
  }
}
```

### GET /api/tenant/settings

Get tenant settings.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "timezone": "America/New_York",
    "language": "en",
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "24h",
    "currency": "USD",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "businessHours": {
      "monday": { "open": "09:00", "close": "17:00", "enabled": true },
      "tuesday": { "open": "09:00", "close": "17:00", "enabled": true },
      "wednesday": { "open": "09:00", "close": "17:00", "enabled": true },
      "thursday": { "open": "09:00", "close": "17:00", "enabled": true },
      "friday": { "open": "09:00", "close": "17:00", "enabled": true },
      "saturday": { "open": "10:00", "close": "14:00", "enabled": false },
      "sunday": { "open": "10:00", "close": "14:00", "enabled": false }
    }
  }
}
```

### PATCH /api/tenant/settings

Update tenant settings.

**Authentication**: Required

**Request Body**:
```json
{
  "timezone": "America/Los_Angeles",
  "businessHours": {
    "saturday": { "open": "10:00", "close": "16:00", "enabled": true }
  }
}
```

### POST /api/tenant/activate

Activate tenant (transition from pending to active).

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Tenant activated successfully",
  "data": {
    "status": "active"
  }
}
```

### PATCH /api/tenant/status

Update tenant status.

**Authentication**: Required

**Request Body**:
```json
{
  "status": "suspended"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "suspended"
  }
}
```

---

## Employee Endpoints

Base path: `/api/employees`

### GET /api/employees

Get all employees for the tenant.

**Authentication**: Required

**Query Parameters**:
- `status` (optional): Filter by status (active, inactive, on_leave)
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "uuid-here",
        "tenantId": "tenant-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+15555555555",
        "employeeType": "employee",
        "status": "active",
        "hireDate": "2024-01-01",
        "schedule": {},
        "serviceIds": ["service-uuid-1", "service-uuid-2"]
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/employees/:id

Get employee by ID.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "tenantId": "tenant-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+15555555555",
    "employeeType": "employee",
    "status": "active",
    "hireDate": "2024-01-01",
    "schedule": {
      "monday": { "start": "09:00", "end": "17:00", "enabled": true }
    },
    "serviceIds": ["service-uuid-1"]
  }
}
```

### POST /api/employees

Create a new employee.

**Authentication**: Required

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+15555555556",
  "employeeType": "employee",
  "hireDate": "2024-01-15",
  "serviceIds": ["service-uuid-1", "service-uuid-2"]
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "status": "active"
  }
}
```

### PATCH /api/employees/:id

Update employee.

**Authentication**: Required

**Request Body**:
```json
{
  "phone": "+15555555557",
  "status": "on_leave"
}
```

### DELETE /api/employees/:id

Delete employee.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

### GET /api/employees/:id/schedule

Get employee schedule.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "monday": { "start": "09:00", "end": "17:00", "enabled": true },
    "tuesday": { "start": "09:00", "end": "17:00", "enabled": true },
    "wednesday": { "start": "09:00", "end": "17:00", "enabled": true },
    "thursday": { "start": "09:00", "end": "17:00", "enabled": true },
    "friday": { "start": "09:00", "end": "17:00", "enabled": true },
    "saturday": { "start": "10:00", "end": "14:00", "enabled": false },
    "sunday": { "start": "10:00", "end": "14:00", "enabled": false }
  }
}
```

### PUT /api/employees/:id/schedule

Update employee schedule.

**Authentication**: Required

**Request Body**:
```json
{
  "saturday": { "start": "10:00", "end": "16:00", "enabled": true }
}
```

---

## Service Endpoints

Base path: `/api/services`

### GET /api/services

Get all services for the tenant.

**Authentication**: Required

**Query Parameters**:
- `status` (optional): Filter by status (active, inactive)
- `category` (optional): Filter by category (hair, nails, skin, makeup, massage, other)

**Response**:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid-here",
        "tenantId": "tenant-id",
        "name": "Haircut",
        "description": "Standard haircut service",
        "category": "hair",
        "duration": 45,
        "price": "35.00",
        "status": "active",
        "addOns": [
          {
            "id": "addon-uuid",
            "name": "Blow Dry",
            "price": 15.00,
            "duration": 15
          }
        ]
      }
    ],
    "total": 1
  }
}
```

### GET /api/services/:id

Get service by ID.

**Authentication**: Required

### POST /api/services

Create a new service.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Manicure",
  "description": "Classic manicure service",
  "category": "nails",
  "duration": 30,
  "price": 25.00,
  "addOns": [
    { "name": "Gel Polish", "price": 15.00, "duration": 10 }
  ]
}
```

### PATCH /api/services/:id

Update service.

**Authentication**: Required

### DELETE /api/services/:id

Delete service.

**Authentication**: Required

---

## Appointment Endpoints

Base path: `/api/appointments`

### GET /api/appointments

Get all appointments.

**Authentication**: Required

**Query Parameters**:
- `status` (optional): Filter by status (scheduled, confirmed, in_progress, completed, cancelled, no_show)
- `employeeId` (optional): Filter by employee
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)
- `page`, `limit` (optional): Pagination

**Response**:
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid-here",
        "tenantId": "tenant-id",
        "employeeId": "employee-uuid",
        "serviceId": "service-uuid",
        "customerName": "Alice Johnson",
        "customerEmail": "alice@example.com",
        "customerPhone": "+15555555555",
        "startTime": "2024-01-15T14:00:00.000Z",
        "endTime": "2024-01-15T14:45:00.000Z",
        "status": "scheduled",
        "totalPrice": "50.00",
        "totalDuration": 45,
        "notes": "First visit",
        "addOns": []
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/appointments/:id

Get appointment by ID.

**Authentication**: Required

### POST /api/appointments

Create a new appointment.

**Authentication**: Required

**Request Body**:
```json
{
  "employeeId": "employee-uuid",
  "serviceId": "service-uuid",
  "customerName": "Bob Smith",
  "customerEmail": "bob@example.com",
  "customerPhone": "+15555555556",
  "startTime": "2024-01-16T10:00:00.000Z",
  "notes": "Prefers quiet music",
  "addOns": ["addon-uuid-1"]
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "employeeId": "employee-uuid",
    "serviceId": "service-uuid",
    "customerName": "Bob Smith",
    "startTime": "2024-01-16T10:00:00.000Z",
    "endTime": "2024-01-16T10:45:00.000Z",
    "status": "scheduled",
    "totalPrice": "50.00",
    "totalDuration": 45
  }
}
```

### PATCH /api/appointments/:id

Update/reschedule appointment.

**Authentication**: Required

**Request Body**:
```json
{
  "startTime": "2024-01-16T11:00:00.000Z",
  "notes": "Rescheduled by customer"
}
```

### DELETE /api/appointments/:id

Cancel or delete appointment.

**Authentication**: Required

**Query Parameters**:
- `reason` (optional): Cancellation reason (customer_request, employee_unavailable, reschedule, no_show, other)

**Response**:
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

## Availability Endpoint

### GET /api/availability

Get available time slots for scheduling.

**Authentication**: Required

**Query Parameters**:
- `date` (required): Date to check (YYYY-MM-DD)
- `serviceId` (required): Service to book
- `employeeId` (optional): Specific employee

**Response**:
```json
{
  "success": true,
  "data": {
    "date": "2024-01-16",
    "availability": [
      {
        "employeeId": "employee-uuid",
        "employeeName": "John Doe",
        "isAvailable": true,
        "availableSlots": [
          { "start": "09:00", "end": "09:45" },
          { "start": "10:00", "end": "10:45" },
          { "start": "11:00", "end": "11:45" }
        ]
      }
    ]
  }
}
```

---

## Billing Endpoints

Base path: `/api/billing`

### GET /api/billing/plans

Get available subscription plans.

**Authentication**: None

**Response**:
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "monthly",
        "name": "Monthly Plan",
        "price": 29500,
        "currency": "usd",
        "interval": "month",
        "description": "$295/month"
      },
      {
        "id": "yearly",
        "name": "Yearly Plan",
        "price": 283200,
        "currency": "usd",
        "interval": "year",
        "description": "$2,832/year (save $708)"
      }
    ]
  }
}
```

### GET /api/billing/subscription

Get current subscription status.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "tenantId": "tenant-id",
    "status": "active",
    "billingInterval": "month",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "isActive": true,
    "hasAccess": true
  }
}
```

### POST /api/billing/create-checkout-session

Create Stripe checkout session.

**Authentication**: Required

**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "priceId": "price_monthly_plan_id",
  "successUrl": "https://app.tonris.com/billing/success",
  "cancelUrl": "https://app.tonris.com/billing/cancel"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/c/pay/..."
  }
}
```

### POST /api/billing/portal-session

Create Stripe customer portal session.

**Authentication**: Required

**Request Body**:
```json
{
  "returnUrl": "https://app.tonris.com/billing"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/p/session/..."
  }
}
```

### POST /api/billing/cancel

Cancel subscription.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "message": "Subscription will be cancelled at end of billing period",
  "data": {
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z"
  }
}
```

---

## Telephony Endpoints

Base path: `/api/telephony`

### POST /api/telephony/provision-number

Provision a new phone number from Twilio.

**Authentication**: Required

**Request Body**:
```json
{
  "areaCode": "212"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+12125551234",
    "sid": "PN...",
    "friendlyName": "TONRIS Line"
  }
}
```

### DELETE /api/telephony/release-number/:sid

Release a provisioned phone number.

**Authentication**: Required

### POST /api/telephony/send-sms

Send SMS to customer.

**Authentication**: Required

**Rate Limit**: 30 per minute

**Request Body**:
```json
{
  "to": "+15555555555",
  "message": "Your appointment is confirmed for tomorrow at 2 PM."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sid": "SM...",
    "status": "queued"
  }
}
```

### POST /api/telephony/send-employee-sms

Send SMS to employee.

**Authentication**: Required

**Request Body**:
```json
{
  "employeeId": "employee-uuid",
  "message": "New appointment scheduled for 3 PM."
}
```

### POST /api/telephony/send-appointment-reminder

Send appointment reminder SMS.

**Authentication**: Required

**Request Body**:
```json
{
  "appointmentId": "appointment-uuid"
}
```

### GET /api/telephony/call-logs

Get call logs for tenant.

**Authentication**: Required

**Query Parameters**:
- `direction` (optional): inbound or outbound
- `status` (optional): completed, missed, etc.
- `startDate`, `endDate` (optional): Date range

**Response**:
```json
{
  "success": true,
  "data": {
    "calls": [
      {
        "id": "uuid-here",
        "twilioCallSid": "CA...",
        "direction": "inbound",
        "status": "completed",
        "fromNumber": "+15555555555",
        "toNumber": "+12125551234",
        "duration": 180,
        "startedAt": "2024-01-15T14:00:00.000Z",
        "endedAt": "2024-01-15T14:03:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### POST /api/telephony/make-call

Initiate outbound call.

**Authentication**: Required

**Request Body**:
```json
{
  "to": "+15555555555"
}
```

---

## AI Assistant Endpoints

Base path: `/api/ai`

### POST /api/ai/conversation

Process conversation input.

**Authentication**: Required

**Rate Limit**: 60 per minute

**Request Body**:
```json
{
  "input": "I'd like to book an appointment for tomorrow",
  "sessionId": "session-uuid",
  "context": {}
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "text": "I'd be happy to help you book an appointment. What service would you like?",
    "intent": {
      "name": "book_appointment",
      "confidence": 0.95,
      "entities": {
        "date": "tomorrow"
      }
    },
    "action": {
      "type": "create_appointment",
      "data": {}
    },
    "shouldHandoff": false
  }
}
```

### POST /api/ai/availability

Query availability via AI.

**Authentication**: Required

**Request Body**:
```json
{
  "date": "2024-01-16",
  "serviceId": "service-uuid"
}
```

### POST /api/ai/appointments

Manage appointments via AI.

**Authentication**: Required

**Request Body**:
```json
{
  "action": "create",
  "data": {
    "serviceId": "service-uuid",
    "startTime": "2024-01-16T10:00:00.000Z",
    "customerName": "Alice Johnson",
    "customerPhone": "+15555555555"
  }
}
```

### POST /api/ai/services

Get services information for AI.

**Authentication**: Required

### POST /api/ai/hours

Get business hours for AI.

**Authentication**: Required

### GET /api/ai/config

Get AI configuration for tenant.

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "greeting": "Hello! Thank you for calling.",
    "tone": "professional and friendly",
    "businessName": "My Salon"
  }
}
```

### POST /api/ai/webhook/elevenlabs

Handle ElevenLabs webhooks.

**Authentication**: None (webhook signature verification)

---

## Webhook Endpoints

These endpoints receive callbacks from external services.

### POST /api/webhooks/stripe

Handle Stripe payment events.

**Authentication**: Stripe signature verification

### POST /api/webhooks/twilio/voice

Handle incoming voice calls.

**Authentication**: Twilio signature verification

### POST /api/webhooks/twilio/sms

Handle incoming SMS.

**Authentication**: Twilio signature verification

### POST /api/webhooks/twilio/status

Handle call status updates.

**Authentication**: Twilio signature verification

### POST /api/webhooks/elevenlabs/conversation-initiation

Handle ElevenLabs Conversation Initiation Client Data webhook. This webhook is called by ElevenLabs when a new Twilio phone call or SIP trunk call conversation begins. It allows the server to provide dynamic conversation configuration and variables based on the call data.

**Authentication**: HMAC-SHA256 signature verification (via `X-ElevenLabs-Signature` header)

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `X-ElevenLabs-Signature` | Yes (in production) | HMAC-SHA256 signature of the request body using `ELEVENLABS_WEBHOOK_SECRET` |
| `Content-Type` | Yes | Must be `application/json` |

**Request Body** (from ElevenLabs):
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
      "language": "en",
      "first_message": "Hello! Welcome to My Business."
    },
    "tts": {
      "output_format": "ulaw_8000"
    }
  }
}
```

---

## Error Responses

All API errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `TIME_SLOT_CONFLICT` | 409 | Appointment time conflict |
| `TENANT_NOT_FOUND` | 404 | Tenant does not exist |
| `SUBSCRIPTION_INACTIVE` | 403 | Subscription expired or cancelled |

---

## Rate Limiting

Most endpoints have rate limiting enabled:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 15 minutes |
| Standard API | 100 requests | 15 minutes |
| SMS Sending | 30 requests | 1 minute |
| AI Conversation | 60 requests | 1 minute |
| Billing Actions | 10 requests | 15 minutes |
| Availability | 200 requests | 15 minutes |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Time when the rate limit resets
