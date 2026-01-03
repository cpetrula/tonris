# JSON Column Storage - Best Practices

## The Problem

In some cases, the `address` and `metadata` columns in the `tenants` table were being stored as JSON strings (double-encoded) instead of proper JSON objects:

**Incorrect (JSON string):**
```json
"{\"street\":\"74107 Pinon Dr\",\"city\":\"Twentynine Palms\",\"state\":\"CA\",\"zip\":\"91360\",\"zipCode\":\"91360\"}"
```

**Correct (JSON object):**
```json
{"street":"74107 Pinon Dr","city":"Twentynine Palms","state":"CA","zip":"91360","zipCode":"91360"}
```

## Best Practice: Store as JSON Object

### Why JSON Objects are Better:

1. **Database Native Support**: MySQL/PostgreSQL have native JSON types that provide:
   - JSON validation
   - Efficient storage
   - Query capabilities (e.g., `JSON_EXTRACT`)
   - Proper indexing

2. **Automatic Handling**: Sequelize with `DataTypes.JSON`:
   - Automatically serializes JavaScript objects to JSON
   - Automatically deserializes JSON back to objects
   - No manual `JSON.stringify()` or `JSON.parse()` needed

3. **Type Safety**: Reduces errors from string manipulation

4. **Better Performance**: Native JSON operations are faster than string parsing

### Current Implementation

The code is **already configured correctly**:

```javascript
// tenant.model.js
address: {
  type: DataTypes.JSON,  // ✅ Correct - uses native JSON type
  allowNull: true,
}
```

When saving:
```javascript
// tenant.service.js
await tenant.update({
  address: {              // ✅ Pass object directly
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001'
  }
});
```

## How the Issue Occurred

The double-encoded strings likely came from:
1. **Manual database inserts** that stringified JSON
2. **Data migration** from an older system
3. **Old code** that was already fixed

## Solutions

### 1. Prevent Future Issues (Already Done)

✅ Model uses `DataTypes.JSON`  
✅ Service passes objects directly (no `JSON.stringify`)  
✅ `toSafeObject()` includes parsing fallback for bad data

### 2. Fix Existing Data

Run the migration script to clean up existing double-encoded data:

```bash
cd backend
node src/scripts/fix-json-string-columns.js
```

This will:
- Find all tenants with string-encoded JSON
- Parse and re-save as proper JSON objects
- Log any issues for manual review

### 3. Verify After Migration

```sql
-- Check data types
SELECT 
  id, 
  name,
  JSON_TYPE(address) as address_type,
  address
FROM tenants
WHERE address IS NOT NULL
LIMIT 5;
```

Should show `address_type: OBJECT`, not `STRING`.

## Code Safety

The `toSafeObject()` method now includes a safety net that:
- Detects if address/metadata are strings
- Automatically parses them
- Logs warnings for investigation
- Prevents UI errors

This is a **defensive programming practice** - the data should be stored correctly, but we handle edge cases gracefully.

## Summary

**Answer: Yes, store as JSON objects (which is what the code already does).**

The parsing logic in `toSafeObject()` should remain as:
- ✅ A safety net for existing bad data
- ✅ Protection during migration period
- ✅ Defensive programming practice

But going forward, all new/updated data will be stored as proper JSON objects automatically.
