# TONRIS Data Model

This document describes the complete database schema for the TONRIS platform.

## Overview

TONRIS uses MySQL with Sequelize ORM. All tables support multi-tenancy through a `tenant_id` column.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Tenant    │       │    User     │       │ Subscription│
│─────────────│       │─────────────│       │─────────────│
│ id (PK)     │───┐   │ id (PK)     │       │ id (PK)     │
│ tenant_id   │   │   │ tenant_id   │───────│ tenant_id   │
│ name        │   │   │ email       │       │ status      │
│ slug        │   │   │ password    │       │ stripe_*    │
│ status      │   │   │ 2fa_*       │       │             │
│ plan_type   │   │   │             │       │             │
│ settings    │   │   │             │       │             │
└─────────────┘   │   └─────────────┘       └─────────────┘
                  │
                  │
┌─────────────┐   │   ┌─────────────┐       ┌─────────────┐
│  Employee   │   │   │   Service   │       │ Appointment │
│─────────────│   │   │─────────────│       │─────────────│
│ id (PK)     │   │   │ id (PK)     │       │ id (PK)     │
│ tenant_id   │───┼───│ tenant_id   │───┬───│ tenant_id   │
│ first_name  │   │   │ name        │   │   │ employee_id │──┐
│ last_name   │   │   │ category    │   │   │ service_id  │──│───┐
│ email       │   │   │ duration    │   │   │ customer_*  │  │   │
│ schedule    │   │   │ price       │   │   │ start_time  │  │   │
│ service_ids │───┘   │ add_ons     │   │   │ end_time    │  │   │
└─────────────┘       └─────────────┘   │   │ status      │  │   │
      ▲                                  │   └─────────────┘  │   │
      │                                  │         │          │   │
      └──────────────────────────────────│─────────┼──────────┘   │
                                         │         │              │
                                         └─────────┼──────────────┘
                                                   │
┌─────────────┐                                    │
│   CallLog   │                                    │
│─────────────│                                    │
│ id (PK)     │                                    │
│ tenant_id   │────────────────────────────────────┘
│ twilio_sid  │
│ direction   │
│ status      │
│ from/to     │
│ duration    │
└─────────────┘
```

## Tables

### users

Stores user authentication and profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT UUIDV4 | Primary key |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `password` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `tenant_id` | VARCHAR(64) | NOT NULL | Tenant identifier |
| `two_factor_secret` | VARCHAR(255) | NULL | TOTP secret for 2FA |
| `two_factor_enabled` | BOOLEAN | DEFAULT FALSE | 2FA enabled flag |
| `password_reset_token` | VARCHAR(255) | NULL | Password reset token |
| `password_reset_expires` | DATETIME | NULL | Reset token expiry |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active flag |
| `createdAt` | DATETIME | NOT NULL | Created timestamp |
| `updatedAt` | DATETIME | NOT NULL | Updated timestamp |

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`email`)

**Methods**:
- `comparePassword(candidatePassword)` - Verify password
- `toSafeObject()` - Return user without sensitive fields

---

### tenants

Stores tenant/organization configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT UUIDV4 | Primary key |
| `tenant_id` | VARCHAR(64) | NOT NULL, UNIQUE | Unique tenant identifier |
| `name` | VARCHAR(255) | NOT NULL | Business name |
| `slug` | VARCHAR(128) | NOT NULL, UNIQUE | URL-safe identifier |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Tenant status |
| `plan_type` | ENUM | NOT NULL, DEFAULT 'free' | Subscription plan |
| `settings` | JSON | NOT NULL, DEFAULT '{}' | Tenant settings |
| `contact_email` | VARCHAR(255) | NOT NULL | Contact email |
| `contact_phone` | VARCHAR(50) | NULL | Contact phone |
| `address` | JSON | NULL | Business address |
| `metadata` | JSON | NULL | Additional metadata |
| `trial_ends_at` | DATETIME | NULL | Trial expiration |
| `onboarding_completed_at` | DATETIME | NULL | Onboarding completion |
| `createdAt` | DATETIME | NOT NULL | Created timestamp |
| `updatedAt` | DATETIME | NOT NULL | Updated timestamp |

**Status Values**:
```javascript
const TENANT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};
```

**Plan Types**:
```javascript
const PLAN_TYPES = {
  FREE: 'free',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
};
```

**Settings Schema**:
```json
{
  "timezone": "UTC",
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
```

**Valid Status Transitions**:
```
pending → active, cancelled
active → suspended, cancelled
suspended → active, cancelled
cancelled → (no transitions)
```

---

### employees

Stores employee/staff information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT UUIDV4 | Primary key |
| `tenant_id` | VARCHAR(64) | NOT NULL | Tenant identifier |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `email` | VARCHAR(255) | NOT NULL | Email address |
| `phone` | VARCHAR(50) | NULL | Phone number |
| `employee_type` | ENUM | NOT NULL, DEFAULT 'employee' | Employment type |
| `status` | ENUM | NOT NULL, DEFAULT 'active' | Employee status |
| `hire_date` | DATE | NULL | Date of hire |
| `schedule` | JSON | NOT NULL, DEFAULT '{}' | Work schedule |
| `service_ids` | JSON | NOT NULL, DEFAULT '[]' | Services provided |
| `metadata` | JSON | NULL | Additional data |
| `createdAt` | DATETIME | NOT NULL | Created timestamp |
| `updatedAt` | DATETIME | NOT NULL | Updated timestamp |

**Indexes**:
- PRIMARY KEY (`id`)
- INDEX (`tenant_id`)
- UNIQUE (`tenant_id`, `email`)

**Status Values**:
```javascript
const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
};
```

**Employee Types**:
```javascript
const EMPLOYEE_TYPES = {
  EMPLOYEE: 'employee',
  CONTRACTOR: 'contractor',
};
```

**Schedule Schema**:
```json
{
  "monday": { "start": "09:00", "end": "17:00", "enabled": true },
  "tuesday": { "start": "09:00", "end": "17:00", "enabled": true },
  "wednesday": { "start": "09:00", "end": "17:00", "enabled": true },
  "thursday": { "start": "09:00", "end": "17:00", "enabled": true },
  "friday": { "start": "09:00", "end": "17:00", "enabled": true },
  "saturday": { "start": "10:00", "end": "14:00", "enabled": false },
  "sunday": { "start": "10:00", "end": "14:00", "enabled": false }
}
```

---

### services

Stores service catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT UUIDV4 | Primary key |
| `tenant_id` | VARCHAR(64) | NOT NULL | Tenant identifier |
| `name` | VARCHAR(200) | NOT NULL | Service name |
| `description` | TEXT | NULL | Service description |
| `category` | ENUM | NOT NULL, DEFAULT 'other' | Service category |
| `duration` | INTEGER | NOT NULL, DEFAULT 60 | Duration in minutes |
| `price` | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00 | Service price |
| `status` | ENUM | NOT NULL, DEFAULT 'active' | Service status |
| `add_ons` | JSON | NOT NULL, DEFAULT '[]' | Available add-ons |
| `metadata` | JSON | NULL | Additional data |
| `createdAt` | DATETIME | NOT NULL | Created timestamp |
| `updatedAt` | DATETIME | NOT NULL | Updated timestamp |

**Indexes**:
- PRIMARY KEY (`id`)
- INDEX (`tenant_id`)
- UNIQUE (`tenant_id`, `name`)

**Status Values**:
```javascript
const SERVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};
```

**Categories**:
```javascript
const SERVICE_CATEGORIES = {
  HAIR: 'hair',
  NAILS: 'nails',
  SKIN: 'skin',
  MAKEUP: 'makeup',
  MASSAGE: 'massage',
  OTHER: 'other',
};
```

**Add-On Schema**:
```json
[
  {
    "id": "uuid",
    "name": "Blow Dry",
    "price": 15.00,
    "duration": 15
  }
]
```

---

### appointments

Stores appointment bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT UUIDV4 | Primary key |
| `tenant_id` | VARCHAR(64) | NOT NULL | Tenant identifier |
| `employee_id` | UUID | NOT NULL | FK to employees |
| `service_id` | UUID | NOT NULL | FK to services |
| `customer_name` | VARCHAR(200) | NOT NULL | Customer name |
| `customer_email` | VARCHAR(255) | NOT NULL | Customer email |
| `customer_phone` | VARCHAR(50) | NULL | Customer phone |
| `start_time` | DATETIME | NOT NULL | Appointment start |
| `end_time` | DATETIME | NOT NULL | Appointment end |
| `status` | ENUM | NOT NULL, DEFAULT 'scheduled' | Appointment status |
| `add_ons` | JSON | NOT NULL, DEFAULT '[]' | Selected add-on IDs |
| `notes` | TEXT | NULL | Appointment notes |
| `total_price` | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00 | Total price |
| `total_duration` | INTEGER | NOT NULL, DEFAULT 0 | Total duration |
| `cancellation_reason` | ENUM | NULL | Cancellation reason |
| `cancellation_notes` | TEXT | NULL | Cancellation notes |
| `cancelled_at` | DATETIME | NULL | Cancellation timestamp |
| `metadata` | JSON | NULL | Additional data |
| `createdAt` | DATETIME | NOT NULL | Created timestamp |
| `updatedAt` | DATETIME | NOT NULL | Updated timestamp |

**Indexes**:
- PRIMARY KEY (`id`)
- INDEX (`tenant_id`)
- INDEX (`tenant_id`, `employee_id`)
- INDEX (`tenant_id`, `start_time`, `end_time`)
- INDEX (`tenant_id`, `status`)
- INDEX (`tenant_id`, `customer_email`)

**Status Values**:
```javascript
const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};
```

**Cancellation Reasons**:
```javascript
const CANCELLATION_REASONS = {
  CUSTOMER_REQUEST: 'customer_request',
  EMPLOYEE_UNAVAILABLE: 'employee_unavailable',
  RESCHEDULE: 'reschedule',
  NO_SHOW: 'no_show',
  OTHER: 'other',
};
```

**Methods**:
- `canBeCancelled()` - Check if status allows cancellation
- `canBeModified()` - Check if status allows modification
- `cancel(reason, notes)` - Cancel the appointment

---

### subscriptions

Stores Stripe subscription data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT UUIDV4 | Primary key |
| `tenant_id` | VARCHAR(64) | NOT NULL, UNIQUE | Tenant identifier |
| `stripe_customer_id` | VARCHAR(255) | NULL | Stripe customer ID |
| `stripe_subscription_id` | VARCHAR(255) | NULL, UNIQUE | Stripe subscription ID |
| `stripe_price_id` | VARCHAR(255) | NULL | Stripe price ID |
| `status` | ENUM | NOT NULL, DEFAULT 'incomplete' | Subscription status |
| `billing_interval` | ENUM | NULL | month or year |
| `current_period_start` | DATETIME | NULL | Billing period start |
| `current_period_end` | DATETIME | NULL | Billing period end |
| `cancel_at_period_end` | BOOLEAN | DEFAULT FALSE | Pending cancellation |
| `canceled_at` | DATETIME | NULL | Cancellation timestamp |
| `trial_start` | DATETIME | NULL | Trial start date |
| `trial_end` | DATETIME | NULL | Trial end date |
| `metadata` | JSON | NULL | Additional data |
| `createdAt` | DATETIME | NOT NULL | Created timestamp |
| `updatedAt` | DATETIME | NOT NULL | Updated timestamp |

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE (`tenant_id`)
- UNIQUE (`stripe_subscription_id`)
- INDEX (`stripe_customer_id`)
- INDEX (`status`)

**Status Values** (aligned with Stripe):
```javascript
const SUBSCRIPTION_STATUS = {
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
  PAUSED: 'paused',
};
```

**Billing Intervals**:
```javascript
const BILLING_INTERVAL = {
  MONTH: 'month',
  YEAR: 'year',
};
```

**Plan Configuration**:
```javascript
const PLAN_CONFIG = {
  MONTHLY_PRICE: 29500, // $295.00 in cents
  YEARLY_PRICE: 283200, // $2,832.00 in cents
};
```

**Methods**:
- `isActive()` - Check if subscription is active or trialing
- `hasAccess()` - Check if tenant should have access (includes grace period)
- `updateFromStripe(stripeSubscription)` - Update from webhook data

---

### call_logs

Stores telephony call metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT UUIDV4 | Primary key |
| `tenant_id` | VARCHAR(64) | NOT NULL | Tenant identifier |
| `twilio_call_sid` | VARCHAR(64) | NOT NULL, UNIQUE | Twilio Call SID |
| `direction` | ENUM | NOT NULL | inbound or outbound |
| `status` | ENUM | NOT NULL, DEFAULT 'initiated' | Call status |
| `from_number` | VARCHAR(20) | NOT NULL | Caller number |
| `to_number` | VARCHAR(20) | NOT NULL | Recipient number |
| `duration` | INTEGER | NULL | Duration in seconds |
| `started_at` | DATETIME | NULL | Call start time |
| `ended_at` | DATETIME | NULL | Call end time |
| `recording_url` | VARCHAR(500) | NULL | Recording URL |
| `transcription` | TEXT | NULL | Call transcription |
| `metadata` | JSON | NULL, DEFAULT '{}' | Additional data |
| `createdAt` | DATETIME | NOT NULL | Created timestamp |
| `updatedAt` | DATETIME | NOT NULL | Updated timestamp |

**Indexes**:
- PRIMARY KEY (`id`)
- INDEX (`tenant_id`)
- UNIQUE (`twilio_call_sid`)
- INDEX (`created_at`)

**Direction Values**:
```javascript
const CALL_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
};
```

**Status Values**:
```javascript
const CALL_STATUS = {
  INITIATED: 'initiated',
  RINGING: 'ringing',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  BUSY: 'busy',
  NO_ANSWER: 'no-answer',
  CANCELED: 'canceled',
  FAILED: 'failed',
};
```

**Methods**:
- `updateFromTwilio(twilioData)` - Update from webhook data

---

## Database Configuration

### Connection Settings

```javascript
// config/db.js
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'tonris_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});
```

### Migrations

Sequelize handles schema synchronization. For production, use:

```bash
# Sync schema (development only)
npm run db:sync

# For production, use migrations
npx sequelize-cli db:migrate
```

### Seeding

```bash
# Run seeders
npx sequelize-cli db:seed:all
```

---

## Multi-Tenant Data Isolation

All queries must include tenant filtering:

```javascript
// Correct - data is isolated by tenant
const employees = await Employee.findAll({
  where: { tenantId: req.tenantId }
});

// Incorrect - would expose other tenant's data
const employees = await Employee.findAll();
```

The tenant middleware ensures `req.tenantId` is always available for authenticated requests.

---

## Index Strategy

### Primary Indexes

Each table has a UUID primary key for:
- Global uniqueness across distributed systems
- No sequential patterns (security)
- Easy data merging if needed

### Composite Indexes

Common query patterns have composite indexes:

```sql
-- Employee queries by tenant
CREATE INDEX idx_employees_tenant ON employees(tenant_id);

-- Appointment lookups
CREATE INDEX idx_appointments_tenant_employee ON appointments(tenant_id, employee_id);
CREATE INDEX idx_appointments_tenant_time ON appointments(tenant_id, start_time, end_time);
CREATE INDEX idx_appointments_tenant_status ON appointments(tenant_id, status);
```

### Unique Constraints

```sql
-- Prevent duplicate emails per tenant
UNIQUE(tenant_id, email)

-- Prevent duplicate service names per tenant
UNIQUE(tenant_id, name)

-- Global uniqueness
UNIQUE(email) -- users table
UNIQUE(slug) -- tenants table
```

---

## Data Types Reference

| Sequelize Type | MySQL Type | Usage |
|----------------|------------|-------|
| `UUID` | `CHAR(36)` | Primary keys, foreign keys |
| `STRING(n)` | `VARCHAR(n)` | Text fields with max length |
| `TEXT` | `TEXT` | Long text (notes, descriptions) |
| `INTEGER` | `INT` | Counts, durations |
| `DECIMAL(10,2)` | `DECIMAL(10,2)` | Currency values |
| `BOOLEAN` | `TINYINT(1)` | Flags |
| `DATE` | `DATE` | Date only |
| `DATETIME` | `DATETIME` | Date and time |
| `JSON` | `JSON` | Complex nested data |
| `ENUM` | `ENUM` | Predefined value sets |
