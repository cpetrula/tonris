-- Migration: Add reminder_sent_at column to appointments table
-- Issue: #227

-- Add the reminder_sent_at column to track when SMS reminders were sent
ALTER TABLE appointments
ADD COLUMN reminder_sent_at DATETIME DEFAULT NULL;

-- Add index for efficient querying of appointments that need reminders
CREATE INDEX idx_appointments_reminder ON appointments (tenant_id, start_time, reminder_sent_at, status);

-- Verify the migration
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'appointments' AND COLUMN_NAME = 'reminder_sent_at';
