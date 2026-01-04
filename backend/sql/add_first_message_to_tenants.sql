-- =============================================================================
-- Migration: Add first_message column to tenants table
-- This column allows tenants to customize the AI assistant's first greeting message
-- =============================================================================

USE tonris_db;

-- Add the first_message column
ALTER TABLE tenants
ADD COLUMN first_message TEXT NULL AFTER twilio_phone_number;

-- Verify the column was added
DESCRIBE tenants;
