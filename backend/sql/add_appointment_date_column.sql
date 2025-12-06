-- Add appointment_date column to appointments table
-- This column stores the date of the appointment (without time component)

ALTER TABLE appointments
ADD COLUMN appointment_date DATE NOT NULL DEFAULT '1970-01-01' AFTER customer_phone;

-- Remove default after adding the column to avoid default values for new rows
ALTER TABLE appointments
ALTER COLUMN appointment_date DROP DEFAULT;

-- Update existing appointments to set appointment_date from start_time
UPDATE appointments
SET appointment_date = DATE(start_time)
WHERE appointment_date = '1970-01-01';

-- Make customer_email nullable
ALTER TABLE appointments
MODIFY COLUMN customer_email VARCHAR(255) NULL;
