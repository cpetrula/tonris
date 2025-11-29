# TONRIS SQL Scripts

This directory contains SQL scripts for setting up the TONRIS database and seeding demo data.

## Files

- **create_tables.sql** - Creates all database tables for the TONRIS platform
- **seed_data.sql** - Seeds demo data for "Hair Done Right Salon"

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
- All tables support multi-tenancy through the `tenant_id` column
