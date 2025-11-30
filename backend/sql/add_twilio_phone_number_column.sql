-- =============================================================================
-- Migration: Add twilio_phone_number column to tenants table
-- This column is used to identify tenants when calls come in via Twilio webhooks
-- =============================================================================

USE tonris_db;

-- Add the twilio_phone_number column
ALTER TABLE tenants
ADD COLUMN twilio_phone_number VARCHAR(50) NULL AFTER onboarding_completed_at;

-- Add unique index for quick lookup by phone number
ALTER TABLE tenants
ADD UNIQUE KEY uk_tenants_twilio_phone_number (twilio_phone_number);

-- Verify the column was added
DESCRIBE tenants;
