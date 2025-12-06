-- =============================================================================
-- Migration: Remove tenant_id column from tenants table
-- This migration removes the redundant tenant_id column, keeping only the id
-- (UUID) as the primary key. The slug column will be used for human-readable
-- tenant identification.
-- =============================================================================

USE tonris_db;

-- Step 1: Drop the unique index on tenant_id
DROP INDEX IF EXISTS uk_tenants_tenant_id ON tenants;

-- Step 2: Drop the tenant_id column
ALTER TABLE tenants DROP COLUMN tenant_id;

-- Verification: Show the updated table structure
DESCRIBE tenants;

SELECT 'tenant_id column removed successfully!' AS Status;
