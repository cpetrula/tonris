# Migration Guide: Dynamic Agent ID Based on Business Type

## Overview

This migration guide covers the changes to how ElevenLabs agent IDs are managed in the TONRIS system. Previously, agent IDs were configured globally via the `ELEVENLABS_AGENT_ID` environment variable. Now, agent IDs are determined dynamically based on each tenant's business type.

## What Changed

### Before
- Single global `ELEVENLABS_AGENT_ID` environment variable
- All tenants used the same ElevenLabs agent
- Tenant-specific overrides available via `settings.elevenLabsAgentId`

### After
- Agent IDs configured per business type in the `business_types` table
- Each tenant automatically uses the agent configured for their business type
- Fallback to tenant-specific `settings.elevenLabsAgentId` if no business type is set
- `ELEVENLABS_AGENT_ID` environment variable is deprecated (but still supported for backward compatibility)

## Benefits

1. **Better Personalization**: Different business types can use agents with specialized training and prompts
2. **Scalability**: Easy to manage multiple agents for different industries
3. **Flexibility**: Tenant-level overrides still available for special cases
4. **Centralized Management**: Business type configuration managed in the database

## Migration Steps

### Step 1: Review Your Current Configuration

Check if you have `ELEVENLABS_AGENT_ID` set in your `.env` file:

```bash
grep ELEVENLABS_AGENT_ID .env
```

### Step 2: Set Up Business Types

The `business_types` table should already exist. Update each business type with the appropriate agent ID:

```sql
-- View current business types
SELECT * FROM business_types;

-- Update agent IDs for each business type
-- Example: Use your existing agent ID for all business types
UPDATE business_types 
SET agent_id = 'your-existing-agent-id'
WHERE active = 1;

-- Or set different agents for different business types
UPDATE business_types 
SET agent_id = 'agent-for-salons' 
WHERE business_type = 'Salon / Spa';

UPDATE business_types 
SET agent_id = 'agent-for-healthcare' 
WHERE business_type = 'Healthcare / Medical';

-- Continue for other business types...
```

### Step 3: Assign Business Types to Tenants

Ensure each tenant has a `business_type_id` assigned:

```sql
-- Check tenants without business types
SELECT id, name, business_type_id 
FROM tenants 
WHERE business_type_id IS NULL;

-- Assign business types to tenants
UPDATE tenants 
SET business_type_id = (
  SELECT id FROM business_types 
  WHERE business_type = 'Salon / Spa' 
  LIMIT 1
)
WHERE id = 'your-tenant-id';
```

### Step 4: Test the Configuration

1. Make a test call to one of your Twilio numbers
2. Check the logs to verify the correct agent is being used:

```
[INFO]: Using agent ID from business type Salon / Spa for tenant xyz
[INFO]: Twilio-ElevenLabs: Connected call CA123 to ElevenLabs agent agent-123 for tenant xyz
```

### Step 5: Update Environment Variables (Optional)

Once you've verified everything works, you can remove or comment out `ELEVENLABS_AGENT_ID` from your `.env` file:

```env
# DEPRECATED: No longer needed - agent IDs are now configured per business type
# ELEVENLABS_AGENT_ID=your_agent_id
```

**Note**: Keeping it won't cause issues; it's just no longer used.

## Agent ID Resolution Order

When a call comes in, the system determines which agent to use in this order:

1. **Business Type Agent** (Primary): Uses the agent ID from the business type if tenant has `business_type_id`
2. **Tenant-Specific Agent** (Fallback): Uses `tenant.settings.elevenLabsAgentId` if set and no business type
3. **Error**: If no agent ID is found, returns an error to the caller

## Rollback Procedure

If you need to revert to the old behavior temporarily:

1. Set `ELEVENLABS_AGENT_ID` in your `.env` file
2. Clear the `business_type_id` for affected tenants:
   ```sql
   UPDATE tenants SET business_type_id = NULL WHERE id = 'tenant-id';
   ```
3. Set tenant-specific agent IDs:
   ```sql
   UPDATE tenants 
   SET settings = JSON_SET(settings, '$.elevenLabsAgentId', 'your-agent-id')
   WHERE id = 'tenant-id';
   ```

However, the new system is backward compatible, so rollback should not be necessary.

## Troubleshooting

### Issue: "No agent ID configured for tenant"

**Cause**: Tenant has no `business_type_id` and no `settings.elevenLabsAgentId`

**Solution**:
1. Assign a business type to the tenant, OR
2. Set a tenant-specific agent ID in settings

```sql
-- Option 1: Assign business type
UPDATE tenants 
SET business_type_id = (SELECT id FROM business_types WHERE business_type = 'Other' LIMIT 1)
WHERE id = 'tenant-id';

-- Option 2: Set tenant-specific agent
UPDATE tenants 
SET settings = JSON_SET(settings, '$.elevenLabsAgentId', 'your-agent-id')
WHERE id = 'tenant-id';
```

### Issue: "Business type is not active"

**Cause**: The business type exists but is marked as inactive

**Solution**: Activate the business type

```sql
UPDATE business_types 
SET active = 1 
WHERE id = 'business-type-id';
```

### Issue: "Business type not found"

**Cause**: The `business_type_id` references a non-existent business type

**Solution**: Fix the reference or create the business type

```sql
-- Check if business type exists
SELECT * FROM business_types WHERE id = 'business-type-id';

-- Fix invalid reference
UPDATE tenants 
SET business_type_id = (SELECT id FROM business_types WHERE active = 1 LIMIT 1)
WHERE id = 'tenant-id';
```

## Benefits of the New System

1. **Industry-Specific Agents**: Customize agent personalities, prompts, and voices for different industries
2. **Easier Onboarding**: New tenants automatically get the right agent based on their business type
3. **Centralized Management**: Update agent IDs for multiple tenants by updating the business type
4. **Better Scalability**: Support many different business types without environment variable clutter

## Support

For questions or issues with the migration, please:
1. Check the logs for specific error messages
2. Review the [TWILIO_ELEVENLABS.md](./TWILIO_ELEVENLABS.md) documentation
3. Open an issue on the repository

## Timeline

- **Current**: Both old and new systems work (backward compatible)
- **Recommended**: Migrate to business type-based agent IDs at your convenience
- **Future**: The `ELEVENLABS_AGENT_ID` environment variable may be removed in a future major version
