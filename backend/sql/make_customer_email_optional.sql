-- =============================================================================
-- Migration: Make customer_email optional in appointments table
-- Date: 2025-12-07
-- Description: Updates the appointments table to make customer_email field nullable
-- =============================================================================

ALTER TABLE appointments
MODIFY COLUMN customer_email VARCHAR(255) NULL;
