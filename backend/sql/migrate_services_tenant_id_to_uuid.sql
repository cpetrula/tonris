-- =============================================================================
-- Migration: Update services.tenant_id to use tenants.id (UUID) as foreign key
-- =============================================================================
-- This migration updates the services table to use the tenant's UUID (id) 
-- instead of the string tenant_id for the tenant_id foreign key column.
--
-- IMPORTANT: Run this migration on existing databases to update the schema
-- and data to match the new model definition.
-- =============================================================================

-- Step 1: Drop existing indexes on tenant_id (they will be recreated after column change)
ALTER TABLE services DROP INDEX idx_services_tenant_id;
ALTER TABLE services DROP INDEX uk_services_tenant_name;

-- Step 2: Add a temporary column to store the new UUID values
ALTER TABLE services ADD COLUMN tenant_uuid CHAR(36) NULL AFTER tenant_id;

-- Step 3: Update the temporary column with the correct tenant UUIDs
-- This joins services with tenants using the current string tenant_id
-- and copies the tenant's UUID (id) to the new column
UPDATE services s
INNER JOIN tenants t ON s.tenant_id = t.tenant_id
SET s.tenant_uuid = t.id;

-- Step 4: Verify all services have been mapped (optional but recommended)
-- Run this query manually to check for any unmapped services:
-- SELECT * FROM services WHERE tenant_uuid IS NULL;

-- Step 5: Drop the old tenant_id column
ALTER TABLE services DROP COLUMN tenant_id;

-- Step 6: Rename the new column to tenant_id
ALTER TABLE services CHANGE COLUMN tenant_uuid tenant_id CHAR(36) NOT NULL;

-- Step 7: Recreate indexes
CREATE INDEX idx_services_tenant_id ON services (tenant_id);
CREATE UNIQUE INDEX uk_services_tenant_name ON services (tenant_id, name);

-- Step 8: Add foreign key constraint to reference tenants.id
ALTER TABLE services 
ADD CONSTRAINT fk_services_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =============================================================================
-- Migration complete!
-- The services.tenant_id column now:
-- - Uses CHAR(36) type to store UUIDs
-- - References tenants.id as a foreign key
-- - Contains the tenant's UUID instead of the string identifier
-- =============================================================================
