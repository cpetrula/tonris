# Tonris

A multi-tenant web application platform for business AI assistants. Initially designed for hair salons, but built with a business-type agnostic architecture to support any service-based business (plumbers, electricians, etc.).

## Features

- **Multi-tenant Architecture**: Each business operates in an isolated tenant with its own data
- **AI Virtual Assistant**: Handles customer interactions including:
  - Answering calls and messages
  - Setting, modifying, and canceling appointments
  - Providing pricing and service duration information
  - Checking availability for specific dates/times
  - Checking when specific staff members are working
  - Answering FAQs about hours and services
- **Appointment Management**: Full CRUD operations for appointments
- **Staff Scheduling**: Manage staff working hours and service assignments
- **Service Catalog**: Define services with pricing and duration
- **Business Hours**: Configure operating hours for each day of the week

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

## API Endpoints

### Tenants & Businesses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tenants` | Create a new tenant |
| GET | `/api/v1/tenants/:id` | Get tenant details |
| PATCH | `/api/v1/tenants/:id` | Update tenant |
| POST | `/api/v1/tenants/:tenantId/businesses` | Create a business |
| GET | `/api/v1/tenants/:tenantId/businesses` | List tenant's businesses |
| GET | `/api/v1/businesses/:id` | Get business details |
| PATCH | `/api/v1/businesses/:id` | Update business |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/businesses/:businessId/services` | Create a service |
| GET | `/api/v1/businesses/:businessId/services` | List services |
| GET | `/api/v1/services/:id` | Get service details |
| PATCH | `/api/v1/services/:id` | Update service |
| DELETE | `/api/v1/services/:id` | Deactivate service |

### Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/businesses/:businessId/staff` | Create staff member |
| GET | `/api/v1/businesses/:businessId/staff` | List staff |
| GET | `/api/v1/staff/:id` | Get staff details |
| PATCH | `/api/v1/staff/:id` | Update staff |
| GET | `/api/v1/staff/:id/schedule` | Get staff schedule |
| POST | `/api/v1/staff/:id/schedule` | Set staff schedule |
| POST | `/api/v1/staff/:staffId/services/:serviceId` | Assign service to staff |
| DELETE | `/api/v1/staff/:staffId/services/:serviceId` | Remove service from staff |
| GET | `/api/v1/staff/:id/services` | Get staff's services |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/appointments` | Book an appointment |
| GET | `/api/v1/appointments/:id` | Get appointment details |
| PATCH | `/api/v1/appointments/:id` | Modify appointment |
| DELETE | `/api/v1/appointments/:id` | Cancel appointment |
| GET | `/api/v1/businesses/:businessId/appointments` | List appointments |
| GET | `/api/v1/businesses/:businessId/availability` | Check availability |
| GET | `/api/v1/businesses/:businessId/availability/next` | Find next available slot |

### Business Hours

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/businesses/:businessId/hours` | Get business hours |
| POST | `/api/v1/businesses/:businessId/hours` | Set hours for a day |
| PUT | `/api/v1/businesses/:businessId/hours` | Set all hours at once |

### FAQs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/businesses/:businessId/faqs` | Create FAQ |
| GET | `/api/v1/businesses/:businessId/faqs` | List FAQs |
| GET | `/api/v1/faqs/:id` | Get FAQ details |
| PATCH | `/api/v1/faqs/:id` | Update FAQ |
| DELETE | `/api/v1/faqs/:id` | Deactivate FAQ |

### AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/assistant/message` | Send message to assistant |
| POST | `/api/v1/assistant/conversations` | Start new conversation |
| DELETE | `/api/v1/assistant/conversations/:conversationId` | End conversation |
| POST | `/api/v1/assistant/webhook/call` | Phone call webhook |

## Example Usage

### Create a Tenant and Business

```bash
# Create tenant
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Salon",
    "businessType": "hair_salon",
    "settings": {
      "timezone": "America/New_York",
      "currency": "USD"
    }
  }'

# Create business
curl -X POST http://localhost:3000/api/v1/tenants/{tenantId}/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Salon - Main Street",
    "address": "123 Main St",
    "phone": "555-1234"
  }'
```

### Chat with the AI Assistant

```bash
curl -X POST http://localhost:3000/api/v1/assistant/message \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "{businessId}",
    "message": "I want to book a haircut for tomorrow"
  }'
```

## Architecture

The application uses a multi-tenant architecture where:

- **Tenant**: Represents a business owner/organization (can have multiple locations)
- **Business**: A specific business location with its own staff, services, hours, etc.
- **Staff**: Employees who provide services
- **Services**: Offerings with duration and pricing
- **Appointments**: Bookings linking customers, staff, and services

### Business Type Agnostic Design

The core models (Tenant, Business, Staff, Service, Appointment) are designed to be generic:

- No hair salon-specific fields in core models
- Business type is stored as metadata
- Services can represent any type of offering (haircut, plumbing repair, electrical work)
- Staff specialties are flexible arrays

To add support for a new business type, simply create a new tenant with the appropriate `businessType` and configure services relevant to that industry.

## License

GPL-3.0