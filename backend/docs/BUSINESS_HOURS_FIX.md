# Business Hours Saving Fix

## Problem
Business hours were not persisting to the database due to two potential issues:

1. **Sequelize JSON column detection**: Sequelize doesn't always detect changes to JSON columns when using direct property assignment
2. **Corrupt data**: Existing database records may have malformed or corrupt settings data

## Solutions Implemented

### 1. Proper Sequelize JSON Handling
Updated the `updateSettings` method in `tenant.model.js` to use Sequelize's proper data access methods:

```javascript
Tenant.prototype.updateSettings = async function(newSettings) {
  // Use getDataValue/setDataValue instead of direct property access
  const currentSettings = this.getDataValue('settings') || {};
  const updatedSettings = { ...currentSettings, ...newSettings };
  this.setDataValue('settings', updatedSettings);
  this.changed('settings', true); // Explicitly mark as changed
  await this.save();
  return this;
};
```

**Key improvements:**
- Uses `getDataValue('settings')` to get the raw value, avoiding Sequelize getter proxies
- Uses `setDataValue('settings', updatedSettings)` to set the value properly
- Explicitly calls `this.changed('settings', true)` to mark the field as modified
- Includes defensive handling for corrupt data (JSON parse/stringify, type checking)

### 2. Data Sanitization
Added `sanitizeSettings` method to repair corrupt tenant settings:

```javascript
Tenant.prototype.sanitizeSettings = async function() {
  // Handles null, arrays, non-objects
  // Validates and repairs businessHours structure
  // Falls back to default settings if data is unrecoverable
};
```

### 3. Manual Repair Endpoint
Added a new API endpoint for manually triggering settings repair:

**Endpoint:** `POST /api/tenant/sanitize-settings`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "message": "Settings sanitized successfully",
  "data": {
    "settings": {
      "timezone": "UTC",
      "language": "en",
      "businessHours": { ... }
    }
  }
}
```

**Usage:**
```bash
curl -X POST https://api.example.com/api/tenant/sanitize-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-ID: your-tenant-id"
```

## Debugging

### Check Current Settings
If business hours still aren't saving, check the debug logs:

```javascript
// In tenant.service.js, updateBusinessHours logs:
logger.debug(`Updating business hours for tenant ${id}. Current settings type: ${typeof tenant.settings}, Current businessHours: ${JSON.stringify(tenant.settings?.businessHours || null)}`);
```

### Common Bad Data Scenarios

1. **Settings is null or undefined**
   - Solution: Automatically reset to default settings
   
2. **Settings is an array instead of object**
   - Solution: Automatically reset to default settings
   
3. **businessHours is null, array, or missing**
   - Solution: Replace with default businessHours
   
4. **Circular references in settings JSON**
   - Solution: JSON.parse/stringify fails, reset to defaults

## Testing

All existing tests pass after the fix:
```bash
cd backend
npm test -- tenant.test.js
```

## Manual Testing

To manually test business hours saving:

1. **Update business hours via API:**
```bash
curl -X PUT https://api.example.com/api/tenant/business-hours \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-ID: your-tenant-id" \
  -H "Content-Type: application/json" \
  -d '{
    "businessHours": {
      "monday": { "open": "09:00", "close": "17:00", "enabled": true },
      "tuesday": { "open": "09:00", "close": "17:00", "enabled": true },
      "wednesday": { "open": "09:00", "close": "17:00", "enabled": true },
      "thursday": { "open": "09:00", "close": "17:00", "enabled": true },
      "friday": { "open": "09:00", "close": "17:00", "enabled": true },
      "saturday": { "open": "10:00", "close": "14:00", "enabled": false },
      "sunday": { "open": "10:00", "close": "14:00", "enabled": false }
    }
  }'
```

2. **Verify the update persisted:**
```bash
curl https://api.example.com/api/tenant/business-hours \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-ID: your-tenant-id"
```

3. **If data is still not saving, try sanitizing:**
```bash
curl -X POST https://api.example.com/api/tenant/sanitize-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-ID: your-tenant-id"
```

## SQL Verification

To check the actual database value:
```sql
SELECT id, name, JSON_EXTRACT(settings, '$.businessHours') as business_hours 
FROM tenants 
WHERE id = 'your-tenant-uuid';
```

To manually fix corrupt data in SQL:
```sql
-- Reset settings to defaults
UPDATE tenants 
SET settings = JSON_OBJECT(
  'timezone', 'UTC',
  'language', 'en',
  'businessHours', JSON_OBJECT(
    'monday', JSON_OBJECT('open', '09:00', 'close', '17:00', 'enabled', true),
    'tuesday', JSON_OBJECT('open', '09:00', 'close', '17:00', 'enabled', true)
    -- ... etc
  )
)
WHERE id = 'your-tenant-uuid';
```
