# User Roles, Multi-Location & Notification Routing

## Feature Overview

This document describes the role-based access control, multi-location support, and per-employee notification configuration system in CRITON.AI.

## Role Hierarchy

```
Superuser (account creator - immutable)
    └── Admin (full access)
        └── Manager (operational access)
            └── Staff (limited access)
```

### Role Descriptions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Superuser** | The original account creator. Cannot be changed or reassigned. | Full system access, can assign roles, manage all locations, configure all notifications |
| **Admin** | Senior staff with administrative privileges | Manage locations, employees, services, appointments |
| **Manager** | Operational managers, often location-specific | View/manage appointments, view employees at their location |
| **Staff** | Regular employees | Limited access based on configuration |

## Multi-Location Support

### Location Model

Each tenant can have multiple locations. The first location created is marked as the default.

**Fields:**
- `id` - Unique identifier
- `tenantId` - Parent tenant
- `name` - Location name (e.g., "Downtown Branch")
- `address` - JSON object with street, city, state, zipCode
- `phone` - Location phone number
- `email` - Location email
- `isDefault` - Whether this is the default location
- `status` - active/inactive
- `businessHours` - Optional override of tenant business hours

### Employee-Location Assignment

Each employee is assigned to a primary location via `locationId`. Employees can be reassigned between locations by admins.

### Appointment-Location Assignment

Appointments are associated with a location via `locationId`. This determines which employees receive notifications.

## Notification System

### Per-Employee Configuration

Notifications are **configurable per employee** by the Superuser. Each employee has notification preferences:

```json
{
  "receiveEmailNotifications": true,
  "receiveSmsNotifications": true,
  "notificationTypes": ["new_appointment", "cancellation"]
}
```

### Notification Routing

When an appointment event occurs:

1. System identifies the appointment's location
2. Queries employees at that location with notifications enabled
3. Sends email/SMS to each qualifying employee

**Event Types:**
- `new_appointment` - New booking created
- `cancellation` - Appointment cancelled

### Backward Compatibility

- If no employees have notifications enabled, falls back to tenant.contactEmail/contactPhone
- Existing appointments without locationId use the default location
- Existing employees without locationId are treated as "all locations"

## Employee Login Accounts

Employees can optionally have login access to the system:

1. Admin creates employee record
2. Admin can "Create Login Account" for the employee
3. Employee receives credentials and can log in with their assigned role

**Link:** Employee.userId ↔ User.employeeId

## API Endpoints

### Locations

```
GET    /api/locations              - List all locations
GET    /api/locations/:id          - Get location details
POST   /api/locations              - Create location (Admin+)
PATCH  /api/locations/:id          - Update location (Admin+)
DELETE /api/locations/:id          - Delete location (Admin+)
```

### Employee Updates

```
POST   /api/employees/:id/create-login    - Create login for employee (Admin+)
PATCH  /api/employees/:id/notifications   - Update notification prefs (Superuser)
```

## Database Schema

### New: locations table

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  address JSONB,
  phone VARCHAR(50),
  email VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  business_hours JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);
```

### Modified: users table

```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20);
ALTER TABLE users ADD COLUMN employee_id UUID REFERENCES employees(id);
```

### Modified: employees table

```sql
ALTER TABLE employees ADD COLUMN role VARCHAR(20) DEFAULT 'staff';
ALTER TABLE employees ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE employees ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE employees ADD COLUMN notification_preferences JSONB;
```

### Modified: appointments table

```sql
ALTER TABLE appointments ADD COLUMN location_id UUID REFERENCES locations(id);
```

## Migration Notes

When this feature is deployed:

1. All existing users are assigned `superuser` role (as the first/only user per tenant)
2. A default location is created for each tenant using their existing address
3. All existing employees are assigned to the default location
4. Notification preferences default to disabled (opt-in model)

## Usage Examples

### Setting Up a Multi-Location Business

1. Log in as Superuser
2. Go to Locations page
3. Create additional locations
4. Assign employees to locations
5. Configure notification preferences for each employee

### Promoting an Employee to Manager

1. Go to Employees page
2. Edit the employee
3. Change role to "Manager"
4. (Optional) Click "Create Login Account" to give them system access

### Configuring Notifications

1. Go to Settings > Staff Notifications
2. Toggle email/SMS notifications per employee
3. Only employees with notifications enabled will receive alerts

---

*Document created: January 2026*
*Feature: User Roles, Multi-Location & Notification Routing*
