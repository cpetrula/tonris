# Migration Guide: Settings to Business Hours Column

## Overview
This migration renames the `settings` column to `business_hours` in the `tenants` table and restructures the data to focus solely on business hours.

## Changes Summary
- **Column renamed**: `settings` → `business_hours`
- **Data structure**: Business hours are now stored directly in the `business_hours` column with the wrapper structure: `{ "businessHours": { "monday": {...}, ... } }`
- **Other settings**: AI-related settings like `aiGreeting` and `aiTone` should be stored in the `metadata` JSON column

## Migration Steps

### 1. Backup Your Database
```bash
mysqldump -u your_user -p tonris_db > backup_before_migration.sql
```

### 2. Run the Migration Script
```bash
mysql -u your_user -p tonris_db < backend/sql/migrate_settings_to_business_hours.sql
```

The migration script will:
- Add a new `business_hours` column
- Copy business hours data from `settings.businessHours` to the new column
- Set default business hours for any tenants without them
- Keep the old `settings` column (commented drop statement for safety)

### 3. Verify the Migration
```sql
-- Check that business_hours column exists and has data
SELECT id, name, business_hours FROM tenants LIMIT 5;

-- Verify the structure
SELECT id, name, JSON_PRETTY(business_hours) FROM tenants WHERE id = 'your-tenant-id';
```

Expected structure:
```json
{
  "businessHours": {
    "monday": {
      "open": "09:00",
      "close": "17:00",
      "enabled": true
    },
    ...
  }
}
```

### 4. Deploy Backend Changes
Deploy the updated backend code that uses the new `business_hours` column.

### 5. Test the Application
1. Log in to the application
2. Navigate to Settings → Business Hours
3. Update the business hours
4. Verify that:
   - The hours are saved correctly
   - The hours display correctly on refresh
   - The AI assistant uses the correct hours

### 6. Drop Old Column (After Verification)
After confirming everything works correctly for at least a week:

```sql
ALTER TABLE tenants DROP COLUMN settings;
```

## API Endpoints Updated
- `GET /api/tenant/business-hours` - Returns business hours from new column
- `PUT /api/tenant/business-hours` - Updates business hours in new column
- `GET /api/tenant/settings` - Now returns business hours data
- `PATCH /api/tenant/settings` - Now updates business hours

## Frontend Changes
No frontend changes are required. The frontend already uses the business hours API endpoints which have been updated to work with the new column structure.

## Rollback Plan
If issues are encountered:

1. The migration script keeps the old `settings` column intact
2. Revert the backend code to the previous version
3. The old `settings` column will still have the original data

## Testing
All backend tests have been updated and pass:
```bash
cd backend
npm test -- tenant.test.js
```

## Support
If you encounter any issues during migration, check:
1. Database logs for any errors
2. Application logs for any errors related to business hours
3. The migration SQL file comments for troubleshooting steps
