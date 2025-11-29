# TONRIS Architecture

This document describes the system architecture of the TONRIS AI Assistant platform.

## Overview

TONRIS is a multi-tenant SaaS platform that provides AI-powered appointment scheduling and customer service for salons and service businesses. The system consists of a Node.js/Express backend API and a Vue 3 frontend application.

## System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Clients                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Web Browser │  │  Phone Call  │  │     SMS      │               │
│  │   (Vue 3)    │  │   (Twilio)   │  │   (Twilio)   │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TONRIS Backend (Express.js)                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Middleware Layer                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │    │
│  │  │  Helmet  │  │   CORS   │  │   Auth   │  │  Tenant  │     │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     API Modules                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │    │
│  │  │   Auth   │  │  Tenant  │  │ Employee │  │ Service  │     │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │    │
│  │  │  Appt.   │  │ Billing  │  │Telephony │  │    AI    │     │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     MySQL       │ │     Stripe      │ │    External     │
│    Database     │ │   (Payments)    │ │    Services     │
│                 │ │                 │ │  - Twilio       │
│                 │ │                 │ │  - OpenAI       │
│                 │ │                 │ │  - ElevenLabs   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Backend Architecture

### Technology Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js 5.x
- **Database**: MySQL 8.0 with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Winston
- **Security**: Helmet, CORS, bcrypt

### Directory Structure

```
backend/
├── src/
│   ├── app.js                 # Application entry point
│   ├── config/
│   │   ├── env.js             # Environment configuration
│   │   └── db.js              # Database configuration
│   ├── middleware/
│   │   ├── tenant.js          # Multi-tenant middleware
│   │   ├── errorHandler.js    # Global error handling
│   │   └── index.js           # Middleware exports
│   ├── models/
│   │   ├── User.js            # User model
│   │   └── index.js           # Model exports
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   ├── tenants/           # Tenant management
│   │   ├── employees/         # Employee management
│   │   ├── services/          # Service catalog
│   │   ├── appointments/      # Appointment booking
│   │   ├── billing/           # Stripe integration
│   │   ├── telephony/         # Twilio integration
│   │   └── ai-assistant/      # AI conversation engine
│   ├── routes/
│   │   ├── health.js          # Health check routes
│   │   ├── me.js              # Current user context
│   │   └── index.js           # Route exports
│   └── utils/
│       └── logger.js          # Winston logger
├── tests/                     # Test files
├── .env.example               # Environment template
└── package.json
```

### Module Pattern

Each module follows a consistent structure:

```
module/
├── index.js           # Module exports
├── model.js           # Sequelize model definition
├── service.js         # Business logic
├── controller.js      # Request handlers
└── routes.js          # Route definitions
```

## Frontend Architecture

### Technology Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite 7.x
- **State Management**: Pinia
- **Router**: Vue Router 4.x
- **UI Components**: PrimeVue
- **Styling**: Tailwind CSS 4.x
- **HTTP Client**: Axios

### Directory Structure

```
frontend/
├── src/
│   ├── main.ts               # Application entry point
│   ├── App.vue               # Root component
│   ├── router/
│   │   └── index.ts          # Route configuration
│   ├── stores/
│   │   ├── auth.ts           # Authentication state
│   │   └── tenant.ts         # Tenant state
│   ├── services/
│   │   └── api.ts            # Axios client with JWT
│   ├── layouts/
│   │   ├── PublicLayout.vue  # Layout for public pages
│   │   └── DashboardLayout.vue # Layout for authenticated pages
│   ├── pages/                # Page components
│   ├── components/           # Reusable components
│   └── assets/               # Static assets
├── public/                   # Public assets
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

## Multi-Tenant Architecture

TONRIS uses a shared-database multi-tenant architecture where all tenants share the same database, with data isolation achieved through tenant IDs.

### Tenant Identification

Tenants are identified through:

1. **Request Header**: `X-Tenant-ID`
2. **Query Parameter**: `?tenantId=<id>`
3. **Default Fallback**: `DEFAULT_TENANT_ID` environment variable

### Request Flow

```
Request → Tenant Middleware → Extract Tenant ID → Validate → Attach to Request
```

The tenant middleware:
1. Extracts tenant ID from header or query parameter
2. Validates the tenant exists and is active
3. Attaches tenant context to `req.tenantId`
4. Adds response headers with tenant info

### Data Isolation

All database models include a `tenantId` field, and all queries are scoped by tenant:

```javascript
const appointments = await Appointment.findAll({
  where: { tenantId: req.tenantId }
});
```

## Authentication & Security

### JWT Token Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│   Client   │     │   Backend  │     │  Database  │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                  │
      │ POST /login      │                  │
      │─────────────────>│                  │
      │                  │ Verify password  │
      │                  │─────────────────>│
      │                  │<─────────────────│
      │                  │                  │
      │ JWT Token        │                  │
      │<─────────────────│                  │
      │                  │                  │
      │ Request + Token  │                  │
      │─────────────────>│                  │
      │                  │ Validate JWT     │
      │                  │                  │
      │ Response         │                  │
      │<─────────────────│                  │
```

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Short-lived access tokens (24h), refresh tokens (7d)
- **Two-Factor Authentication**: TOTP-based 2FA
- **Rate Limiting**: Per-endpoint rate limits
- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing

## External Service Integrations

### Stripe (Payments)

- **Customer Management**: Create/manage Stripe customers
- **Subscription Billing**: Monthly ($295) and yearly ($2,832) plans
- **Checkout Sessions**: Hosted payment pages
- **Webhooks**: Real-time payment event handling
- **Customer Portal**: Self-service billing management

### Twilio (Telephony)

- **Voice Calls**: Inbound/outbound voice handling
- **SMS Messaging**: Appointment reminders, notifications
- **Phone Numbers**: Dynamic number provisioning
- **Webhooks**: Call status and SMS delivery events
- **Call Logs**: Call metadata and recordings

### AI Providers

- **OpenAI**: Natural language understanding and response generation
- **ElevenLabs**: Text-to-speech for voice interactions

## Data Flow Examples

### Appointment Booking Flow

```
1. Customer calls tenant's phone number
2. Twilio webhook → Backend receives call
3. AI service processes greeting
4. Customer requests appointment
5. AI detects booking intent
6. Backend checks employee availability
7. AI confirms details with customer
8. Backend creates appointment
9. SMS confirmation sent to customer
10. Call ends
```

### Subscription Flow

```
1. User clicks "Subscribe" in frontend
2. Frontend calls POST /api/billing/create-checkout-session
3. Backend creates Stripe Checkout Session
4. User redirected to Stripe payment page
5. User completes payment
6. Stripe sends webhook to backend
7. Backend creates/updates subscription record
8. Tenant status updated to active
9. User can access premium features
```

## Scaling Considerations

### Horizontal Scaling

- Stateless API design enables multiple backend instances
- Session data stored in database, not memory
- External services handle their own scaling

### Database Optimization

- Indexed queries on tenant_id for fast lookups
- Composite indexes for common query patterns
- Connection pooling via Sequelize

### Caching Strategy (Future)

- Redis for session caching
- Query result caching for read-heavy endpoints
- CDN for static frontend assets

## Monitoring & Observability

### Logging

- Winston logger with structured JSON output
- Log levels: error, warn, info, debug
- Request/response logging with timing

### Health Checks

- `/health` - Basic health status
- `/health/detailed` - Including database connectivity
- `/health/ready` - Kubernetes readiness probe
- `/health/live` - Kubernetes liveness probe

## Environment Configuration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete environment variable reference.

Key configuration areas:
- Server settings (PORT, NODE_ENV)
- Database connection (DB_HOST, DB_NAME, etc.)
- JWT secrets
- External API keys (Stripe, Twilio, OpenAI, ElevenLabs)
