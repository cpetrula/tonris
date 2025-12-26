-- =============================================================================
-- TONRIS Business Types Seed Data
-- Populates the business_types table with common business types
-- =============================================================================

USE tonris_db;

-- =============================================================================
-- Seed: Business Types
-- Each business type is associated with an ElevenLabs AI agent ID
-- Note: Replace agent IDs with actual ElevenLabs agent IDs for your setup
-- =============================================================================

-- Set default agent ID (can be replaced with actual agent IDs)
SET @default_agent_id = UUID();

INSERT INTO business_types (id, business_type, agent_id, active, createdAt, updatedAt)
VALUES
    (UUID(), 'Restaurant / Food Service', @default_agent_id, 1, NOW(), NOW()),
    (UUID(), 'Healthcare / Medical', @default_agent_id, 1, NOW(), NOW()),
    (UUID(), 'Salon / Spa', @default_agent_id, 1, NOW(), NOW()),
    (UUID(), 'Legal Services', @default_agent_id, 1, NOW(), NOW()),
    (UUID(), 'Real Estate', @default_agent_id, 1, NOW(), NOW()),
    (UUID(), 'Home Services', @default_agent_id, 1, NOW(), NOW()),
    (UUID(), 'Professional Services', @default_agent_id, 1, NOW(), NOW()),
    (UUID(), 'Retail', @default_agent_id, 1, NOW(), NOW()),
    (UUID(), 'Other', @default_agent_id, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    active = VALUES(active),
    updatedAt = NOW();

-- =============================================================================
-- Summary Output
-- =============================================================================
SELECT 'Business types seeded successfully!' AS Status;
SELECT 'Total Business Types:' AS Info, (SELECT COUNT(*) FROM business_types WHERE active = 1) AS Value;
