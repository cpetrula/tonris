-- =============================================================================
-- TONRIS Database Migration
-- Create business_types table
-- =============================================================================

USE tonris_db;

-- =============================================================================
-- Table: business_types
-- Stores business type configurations
-- =============================================================================
CREATE TABLE IF NOT EXISTS business_types (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    business_type VARCHAR(50) NOT NULL,
    agent_id CHAR(36) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
