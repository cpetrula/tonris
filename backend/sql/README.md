# TONRIS SQL Scripts

This directory contains SQL scripts for setting up the TONRIS database and seeding demo data.

## Files

- **create_tables.sql** - Creates all database tables for the TONRIS platform
- **seed_data.sql** - Seeds demo data for "Hair Done Right Salon"
- **migrate_services_tenant_id_to_uuid.sql** - Migration script to update services.tenant_id from string to UUID (foreign key to tenants.id)
- **migrate_all_tenant_id_to_uuid.sql** - Migration script to update tenant_id in all tables (users, employees, appointments, subscriptions, call_logs) from string to UUID (foreign key to tenants.id)
- **add_twilio_phone_number_column.sql** - Migration to add twilio_phone_number column to tenants table
- **add_sms_opt_in_to_users.sql** - Migration to add sms_opt_in column to users table for SMS notification preferences
- **create_business_types_table.sql** - Creates the business_types table for storing business type configurations
- **add_business_type_to_tenants.sql** - Adds business_type_id column to tenants table with FK to business_types

## Usage

### 1. Create Tables

Run the table creation script first to set up the database schema:

```bash
mysql -u root -p < create_tables.sql
```

Or if you need to specify a host:

```bash
mysql -h localhost -u root -p < create_tables.sql
```

### 2. Seed Demo Data

After creating the tables, run the seed script to populate demo data:

```bash
mysql -u root -p < seed_data.sql
```

### 3. Migrations

If you have an existing database and need to update the schema, run the migration scripts:

#### Update ALL tables tenant_id to UUID (references tenants.id)

This migration updates ALL tables (users, employees, appointments, subscriptions, call_logs) to use the tenant's UUID (id) instead of the string tenant_id:

```bash
mysql -u root -p tonris_db < migrate_all_tenant_id_to_uuid.sql
```

**Tables updated:**
- users
- employees
- appointments
- subscriptions
- call_logs

**What this migration does for each table:**
1. Drops existing indexes on tenant_id
2. Creates a temporary column for the new UUID values
3. Maps existing string tenant_ids to tenant UUIDs via JOIN with tenants table
4. Displays verification status showing if any records couldn't be mapped
5. Drops the old column and renames the new one
6. Recreates indexes and adds foreign key constraint

#### Update services.tenant_id to UUID (references tenants.id)

This migration updates the services table to use the tenant's UUID (id) instead of the string tenant_id:

```bash
mysql -u root -p tonris_db < migrate_services_tenant_id_to_uuid.sql
```

**What this migration does:**
1. Drops existing indexes on tenant_id
2. Creates a temporary column for the new UUID values
3. Updates the column with tenant UUIDs by joining with the tenants table
4. Drops the old column and renames the new one
5. Recreates indexes and adds foreign key constraint

#### Create business_types table

Creates a new table for storing business type configurations:

```bash
mysql -u root -p tonris_db < create_business_types_table.sql
```

**Table columns:**
- `id` - Primary key (UUID)
- `business_type` - Business type name (VARCHAR 50, unique)
- `agent_id` - Agent identifier (UUID, indexed)
- `active` - Active status (Boolean, indexed)
- `createdAt` - Created timestamp
- `updatedAt` - Updated timestamp

#### Add business_type to tenants table

Adds a business_type_id column to the tenants table with a foreign key reference to business_types:

```bash
mysql -u root -p tonris_db < add_business_type_to_tenants.sql
```

**What this migration does:**
1. Adds `business_type_id` column (CHAR 36, nullable)
2. Creates an index on the new column
3. Adds foreign key constraint referencing `business_types.id`

## Demo Salon Details

The seed data creates a demo salon with the following configuration:

### Business Information
- **Name**: Hair Done Right Salon
- **Tenant ID**: `hair-done-right-salon`
- **Slug**: `hair-done-right-salon`
- **Status**: Active
- **Plan**: Professional

### Admin User
- **Email**: admin@hairdonerightson.com
- **Password**: Demo123! (hashed)

### Employees (4 total)
1. **Sarah Johnson** - Senior Stylist (Color Specialist)
2. **Michael Chen** - Stylist (Precision Cuts)
3. **Emily Rodriguez** - Junior Stylist (Blowouts & Styling)
4. **Jessica Williams** - Nail Technician (Contractor)

### Services (8 total)
Hair Services:
- Haircut ($55, 45 min)
- Full Hair Coloring ($125, 120 min)
- Blowout ($45, 35 min)
- Highlights ($175, 150 min)
- Deep Conditioning Treatment ($65, 45 min)
- Special Occasion Styling ($95, 90 min)

Nail Services:
- Classic Manicure ($35, 30 min)
- Spa Pedicure ($55, 50 min)

### Sample Data
- 10 appointments (mix of upcoming, completed, cancelled, and no-show)
- 5 call logs (inbound and outbound calls)
- Active subscription

## Business Hours

| Day       | Hours           |
|-----------|-----------------|
| Monday    | 9:00 AM - 7:00 PM |
| Tuesday   | 9:00 AM - 7:00 PM |
| Wednesday | 9:00 AM - 7:00 PM |
| Thursday  | 9:00 AM - 8:00 PM |
| Friday    | 9:00 AM - 8:00 PM |
| Saturday  | 9:00 AM - 5:00 PM |
| Sunday    | Closed          |

## Notes

- The scripts are designed for MySQL 8.0+
- UUID() function is used for generating unique identifiers
- JSON columns use MySQL's native JSON type
- The `services.tenant_id` column is a UUID foreign key referencing `tenants.id`
- Other tables use string `tenant_id` referencing `tenants.tenant_id`
