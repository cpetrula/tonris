-- Migration: Rename settings column to business_hours and restructure data
-- This migration renames the settings column to business_hours and 
-- extracts only the businessHours data from the settings JSON

-- Step 1: Add the new business_hours column
ALTER TABLE tenants 
ADD COLUMN business_hours JSON NULL AFTER plan_type;

-- Step 2: Copy businessHours data from settings to business_hours column
-- Wrapping it in the { "businessHours": {...} } structure
UPDATE tenants 
SET business_hours = JSON_OBJECT(
  'businessHours', JSON_EXTRACT(settings, '$.businessHours')
)
WHERE JSON_EXTRACT(settings, '$.businessHours') IS NOT NULL;

-- Step 3: Set default business_hours for records that don't have it
UPDATE tenants 
SET business_hours = JSON_OBJECT(
  'businessHours', JSON_OBJECT(
    'monday', JSON_OBJECT('open', '09:00', 'close', '17:00', 'enabled', true),
    'tuesday', JSON_OBJECT('open', '09:00', 'close', '17:00', 'enabled', true),
    'wednesday', JSON_OBJECT('open', '09:00', 'close', '17:00', 'enabled', true),
    'thursday', JSON_OBJECT('open', '09:00', 'close', '17:00', 'enabled', true),
    'friday', JSON_OBJECT('open', '09:00', 'close', '17:00', 'enabled', true),
    'saturday', JSON_OBJECT('open', '10:00', 'close', '14:00', 'enabled', false),
    'sunday', JSON_OBJECT('open', '10:00', 'close', '14:00', 'enabled', false)
  )
)
WHERE business_hours IS NULL;

-- Step 4: Make business_hours NOT NULL with default
ALTER TABLE tenants 
MODIFY COLUMN business_hours JSON NOT NULL;

-- Step 5: Drop the old settings column
-- NOTE: Uncomment this line only after verifying the migration worked correctly
-- ALTER TABLE tenants DROP COLUMN settings;

-- To rollback (if needed before dropping settings):
-- ALTER TABLE tenants DROP COLUMN business_hours;
