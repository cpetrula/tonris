-- =============================================================================
-- TONRIS Database Migration
-- Add voice_id column to tenants table
-- =============================================================================

USE tonris_db;

-- =============================================================================
-- Add voice_id column to tenants table
-- This column is a foreign key reference to the elevenlabs_voices table
-- =============================================================================
ALTER TABLE tenants
ADD COLUMN voice_id CHAR(36) NULL AFTER business_type_id,
ADD CONSTRAINT fk_tenants_voice_id FOREIGN KEY (voice_id) REFERENCES elevenlabs_voices(id) ON DELETE SET NULL ON UPDATE CASCADE,
ADD INDEX idx_tenants_voice_id (voice_id);

-- =============================================================================
-- Summary Output
-- =============================================================================
SELECT 'voice_id column added to tenants table successfully!' AS Status;
