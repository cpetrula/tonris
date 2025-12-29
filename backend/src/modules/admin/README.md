# Admin API

This module provides administrative endpoints for managing and viewing all clients (tenants) in the system.

## Authentication

All admin endpoints are protected by password-based authentication using the `ADMIN_PASSWORD` environment variable.

### Environment Variable

Add the following to your `.env` file:

```env
ADMIN_PASSWORD=your-secure-admin-password
```

**Important**: Use a strong, unique password in production environments.

## Endpoints

### GET /api/admin/clients

Retrieves a list of all clients (tenants) who have signed up for the service.

#### Headers

- `X-Admin-Password` (required): The admin password configured in the environment variable

#### Response

**Success (200 OK)**

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

**Error Responses**

- `401 Unauthorized`: No password provided or invalid password
  ```json
  {
    "success": false,
    "error": "Admin password required",
    "code": "UNAUTHORIZED"
  }
  ```

- `500 Internal Server Error`: Database or server error
  ```json
  {
    "success": false,
    "error": "Failed to fetch clients",
    "code": "FETCH_CLIENTS_FAILED"
  }
  ```

## Usage Examples

### Using cURL

```bash
# Get all clients
curl -X GET http://localhost:3000/api/admin/clients \
  -H "X-Admin-Password: your-admin-password"
```

### Using JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/api/admin/clients', {
  headers: {
    'X-Admin-Password': 'your-admin-password'
  }
});

const data = await response.json();
console.log('Clients:', data.data.clients);
```

### Using Postman

1. Create a new GET request to `http://localhost:3000/api/admin/clients`
2. Add a header: `X-Admin-Password` with your admin password value
3. Send the request

## Client Data Fields

- **id**: Unique identifier for the client (UUID)
- **name**: Business or client name
- **slug**: URL-friendly identifier
- **status**: Current status (`pending`, `active`, `suspended`, `cancelled`)
- **planType**: Subscription plan (`free`, `basic`, `professional`, `enterprise`)
- **contactEmail**: Primary contact email
- **signUpDate**: ISO 8601 timestamp of when the client signed up
- **lastUpdated**: ISO 8601 timestamp of when the client record was last updated

## Security Considerations

1. **Password Protection**: All endpoints require the admin password
2. **Environment Variable**: Store the password securely, never commit it to version control
3. **HTTPS**: Always use HTTPS in production to protect the password in transit
4. **Rate Limiting**: Endpoints are rate-limited to prevent brute force attacks (50 requests per 15 minutes)
5. **Logging**: Failed authentication attempts are logged for security monitoring

## Rate Limiting

Admin endpoints are protected by rate limiting:
- Window: 15 minutes
- Maximum requests: 50 per window
- Rate limiting is disabled in test environment

## Testing

Run the admin tests with:

```bash
npm test -- admin.test.js
```

The tests verify:
- Authentication with no password returns 401
- Authentication with wrong password returns 401
- Authentication with correct password returns 200
- Empty client list handling
- Database error handling
