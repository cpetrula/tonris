-- Migration: Add notification_settings column to tenants table
-- Issue: #221

-- Add the notification_settings JSON column
ALTER TABLE tenants
ADD COLUMN notification_settings JSON DEFAULT NULL;

-- Set default notification settings for existing tenants
UPDATE tenants
SET notification_settings = JSON_OBJECT(
    'emailNewAppointment', TRUE,
    'emailCancellation', TRUE,
    'emailDailyDigest', TRUE,
    'smsReminderEnabled', TRUE,
    'smsReminderHours', 24
)
WHERE notification_settings IS NULL;

-- Verify the migration
SELECT id, name, notification_settings FROM tenants LIMIT 5;
