# TONRIS Backend

Backend infrastructure for the TONRIS AI Assistant application.

## Features

- Express.js framework
- MySQL database with Sequelize ORM
- Multi-tenant architecture
- Environment variable management
- Structured logging with Winston
- Comprehensive error handling
- Health check endpoints

## Prerequisites

- Node.js v18 or higher
- MySQL 8.0 or higher

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create environment file:
   ```bash
   cp .env.example .env
   ```
5. Configure your environment variables in `.env`

## Development

Start the development server with hot-reload:
```bash
npm run dev
```

## Production

Start the production server:
```bash
npm start
```

## Testing

Run the test suite:
```bash
npm test
```

## Linting

Run ESLint:
```bash
npm run lint
```

## API Endpoints

### Health Check

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health status including database
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

### API Routes

All API routes are prefixed with `/api` and include multi-tenant middleware.

- `GET /api/health` - API health check with tenant context

## Project Structure

```
backend/
├── src/
│   ├── app.js              # Express application entry point
│   ├── config/
│   │   ├── env.js          # Environment configuration
│   │   └── db.js           # Database configuration
│   ├── middleware/
│   │   ├── index.js        # Middleware exports
│   │   ├── tenant.js       # Multi-tenant middleware
│   │   └── errorHandler.js # Error handling middleware
│   ├── routes/
│   │   ├── index.js        # Route exports
│   │   └── health.js       # Health check routes
│   └── utils/
│       └── logger.js       # Winston logger configuration
├── tests/
│   └── app.test.js         # Application tests
├── .env.example            # Environment variable template
├── package.json
└── README.md
```

## Environment Variables

| Variable                 | Description                        | Default     |
|--------------------------|------------------------------------|-------------|
| NODE_ENV                 | Environment mode                   | development |
| PORT                     | Server port                        | 3000        |
| DB_HOST                  | Database host                      | localhost   |
| DB_PORT                  | Database port                      | 3306        |
| DB_NAME                  | Database name                      | tonris_db   |
| DB_USER                  | Database user                      | root        |
| DB_PASSWORD              | Database password                  | -           |
| LOG_LEVEL                | Logging level                      | info        |
| DEFAULT_TENANT_ID        | Default tenant identifier          | default     |
| ADMIN_PASSWORD           | Admin API password protection      | -           |

### Twilio Configuration

The application uses **two separate Twilio configurations**:

1. **Voice/Telephony** - For phone calls and voice operations:
   - `TWILIO_ACCOUNT_SID` - Twilio account SID for voice
   - `TWILIO_AUTH_TOKEN` - Twilio auth token for voice

2. **SMS** - For text messaging operations:
   - `TWILIO_SMS_ACCOUNT_SID` - Twilio account SID for SMS
   - `TWILIO_SMS_AUTH_TOKEN` - Twilio auth token for SMS
   - `TWILIO_SMS_PHONE_NUMBER` - Twilio phone number for sending SMS

| Variable                 | Description                        | Default     |
|--------------------------|------------------------------------| ------------|
| TWILIO_ACCOUNT_SID       | Twilio account SID (voice)         | -           |
| TWILIO_AUTH_TOKEN        | Twilio auth token (voice)          | -           |
| TWILIO_SMS_ACCOUNT_SID   | Twilio account SID (SMS)           | -           |
| TWILIO_SMS_AUTH_TOKEN    | Twilio auth token (SMS)            | -           |
| TWILIO_SMS_PHONE_NUMBER  | Twilio phone number for SMS        | -           |

## Testing SMS Functionality

A test endpoint is available for manual SMS testing without authentication:

⚠️ **Security Note**: This endpoint is intended for **development and testing only**. In production environments, consider disabling this endpoint or adding IP restrictions and additional security measures.

**Endpoint:** `POST /api/telephony/test-sms`

**Request Body:**
```json
{
  "to": "+15551234567",
  "message": "Test message from TONRIS"
}
```

**Example using curl:**
```bash
# Replace localhost:3000 with your actual server URL
curl -X POST http://localhost:3000/api/telephony/test-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15551234567",
    "message": "Test message from TONRIS"
  }'
```

**Requirements:**
- `TWILIO_SMS_ACCOUNT_SID` must be set
- `TWILIO_SMS_AUTH_TOKEN` must be set
- `TWILIO_SMS_PHONE_NUMBER` must be set
- Rate limited to 30 requests per minute

**Response:**
```json
{
  "success": true,
  "data": {
    "sid": "SM...",
    "status": "queued",
    "to": "+15551234567",
    "from": "+15559876543",
    "body": "Test message from TONRIS",
    "dateSent": null
  },
  "message": "Test SMS sent successfully"
}
```

## Admin API

The admin API provides administrative endpoints for managing and viewing all clients (tenants).

### Authentication

Admin endpoints are protected by password-based authentication using the `ADMIN_PASSWORD` environment variable.

**Configuration:**
```bash
ADMIN_PASSWORD=your-secure-admin-password
```

### Endpoints

**GET /api/admin/clients** - Get all clients

Retrieves a list of all clients (tenants) who have signed up.

**Headers:**
- `X-Admin-Password` (required): The admin password

**Example:**
```bash
curl -X GET http://localhost:3000/api/admin/clients \
  -H "X-Admin-Password: your-admin-password"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "uuid",
        "name": "Business Name",
        "slug": "business-slug",
        "status": "active",
        "planType": "free",
        "contactEmail": "contact@example.com",
        "signUpDate": "2024-01-01T00:00:00.000Z",
        "lastUpdated": "2024-01-15T00:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

For detailed admin API documentation, see [Admin API README](src/modules/admin/README.md).

## Multi-Tenant Architecture

The backend supports multi-tenant architecture through:

1. **Request Headers**: Set `X-Tenant-ID` header
2. **Query Parameters**: Use `?tenantId=<id>` parameter
3. **Default Tenant**: Falls back to `DEFAULT_TENANT_ID` environment variable

Each request includes:
- Tenant ID in response headers
- Unique request ID for tracing
- Tenant context attached to the request object

## Error Handling

The application provides centralized error handling with:

- Custom `AppError` class for operational errors
- 404 Not Found handler
- Global error handler with structured responses
- Database error transformations
- Development-mode stack traces

## Logging

Winston is used for structured logging:

- Console output with colors (development)
- File-based logging (production)
- Request/response logging
- Error stack traces
- Configurable log levels
