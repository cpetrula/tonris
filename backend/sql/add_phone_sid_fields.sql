-- =============================================================================
-- Migration: Add twilio_phone_number_sid and elevenlabs_phone_number_id to tenants table
-- These columns store the Twilio SID and ElevenLabs phone number ID for tracking
-- =============================================================================

USE tonris_db;

-- Add the twilio_phone_number_sid column
ALTER TABLE tenants
ADD COLUMN twilio_phone_number_sid VARCHAR(100) NULL AFTER twilio_phone_number;

-- Add the elevenlabs_phone_number_id column
ALTER TABLE tenants
ADD COLUMN elevenlabs_phone_number_id VARCHAR(100) NULL AFTER twilio_phone_number_sid;

-- Verify the columns were added
DESCRIBE tenants;
