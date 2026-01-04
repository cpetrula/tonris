-- =============================================================================
-- TONRIS Database Migration
-- Create elevenlabs_voices table
-- =============================================================================

USE tonris_db;

-- =============================================================================
-- Table: elevenlabs_voices
-- Stores ElevenLabs voice configurations
-- =============================================================================
CREATE TABLE IF NOT EXISTS elevenlabs_voices (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    label VARCHAR(100) NOT NULL,
    elevenlabs_voice_id VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_elevenlabs_voices_elevenlabs_id (elevenlabs_voice_id),
    INDEX idx_elevenlabs_voices_label (label)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
