-- =============================================================================
-- TONRIS ElevenLabs Voices Seed Data
-- Populates the elevenlabs_voices table with initial voice options
-- =============================================================================

USE tonris_db;

-- =============================================================================
-- Seed: ElevenLabs Voices
-- Each voice entry maps to an ElevenLabs voice ID
-- =============================================================================

INSERT INTO elevenlabs_voices (id, label, elevenlabs_voice_id, description, createdAt, updatedAt)
VALUES
    (UUID(), 'Female', 'g6xIsTj2HwM6VR4iXFCw', '', NOW(), NOW()),
    (UUID(), 'Male', 'PIGsltMj3gFMR34aFDI3', '', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    description = VALUES(description),
    updatedAt = NOW();

-- =============================================================================
-- Summary Output
-- =============================================================================
SELECT 'ElevenLabs voices seeded successfully!' AS Status;
SELECT 'Total Voices:' AS Info, (SELECT COUNT(*) FROM elevenlabs_voices) AS Value;
