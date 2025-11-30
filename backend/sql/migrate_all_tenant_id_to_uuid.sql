-- =============================================================================
-- Migration: Update all tables to use tenants.id (UUID) as foreign key
-- =============================================================================
-- This migration updates the tenant_id column in the following tables to use
-- the tenant's UUID (id) instead of the string tenant_id:
-- - users
-- - employees
-- - appointments
-- - subscriptions
-- - call_logs
--
-- Note: The services table migration is handled separately in 
-- migrate_services_tenant_id_to_uuid.sql
--
-- IMPORTANT: Run this migration on existing databases to update the schema
-- and data to match the new model definitions.
-- =============================================================================

-- =============================================================================
-- USERS TABLE MIGRATION
-- =============================================================================

-- Step 1: Drop existing indexes on tenant_id (if any)
-- Users table may not have tenant_id indexes, but we try anyway
DROP INDEX IF EXISTS idx_users_tenant_id ON users;

-- Step 2: Add temporary column for UUID
ALTER TABLE users ADD COLUMN tenant_uuid CHAR(36) NULL AFTER tenant_id;

-- Step 3: Map existing string tenant_ids to tenant UUIDs
UPDATE users u
INNER JOIN tenants t ON u.tenant_id = t.tenant_id
SET u.tenant_uuid = t.id;

-- Step 4: Verify migration status
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('WARNING: ', COUNT(*), ' users could not be mapped to a tenant UUID!')
        ELSE 'All users successfully mapped to tenant UUIDs'
    END AS users_migration_status
FROM users 
WHERE tenant_uuid IS NULL;

-- Step 5: Drop old column and rename new one
ALTER TABLE users DROP COLUMN tenant_id;
ALTER TABLE users CHANGE COLUMN tenant_uuid tenant_id CHAR(36) NOT NULL;

-- Step 6: Add FK constraint
ALTER TABLE users 
ADD CONSTRAINT fk_users_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =============================================================================
-- EMPLOYEES TABLE MIGRATION
-- =============================================================================

-- Step 1: Drop existing indexes
DROP INDEX IF EXISTS idx_employees_tenant_id ON employees;
DROP INDEX IF EXISTS uk_employees_tenant_email ON employees;

-- Step 2: Add temporary column
ALTER TABLE employees ADD COLUMN tenant_uuid CHAR(36) NULL AFTER tenant_id;

-- Step 3: Map tenant_ids to UUIDs
UPDATE employees e
INNER JOIN tenants t ON e.tenant_id = t.tenant_id
SET e.tenant_uuid = t.id;

-- Step 4: Verify
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('WARNING: ', COUNT(*), ' employees could not be mapped to a tenant UUID!')
        ELSE 'All employees successfully mapped to tenant UUIDs'
    END AS employees_migration_status
FROM employees 
WHERE tenant_uuid IS NULL;

-- Step 5: Drop old and rename new
ALTER TABLE employees DROP COLUMN tenant_id;
ALTER TABLE employees CHANGE COLUMN tenant_uuid tenant_id CHAR(36) NOT NULL;

-- Step 6: Recreate indexes and add FK
CREATE INDEX idx_employees_tenant_id ON employees (tenant_id);
CREATE UNIQUE INDEX uk_employees_tenant_email ON employees (tenant_id, email);
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =============================================================================
-- APPOINTMENTS TABLE MIGRATION
-- =============================================================================

-- Step 1: Drop existing indexes
DROP INDEX IF EXISTS idx_appointments_tenant_id ON appointments;
DROP INDEX IF EXISTS idx_appointments_tenant_employee ON appointments;
DROP INDEX IF EXISTS idx_appointments_tenant_time ON appointments;
DROP INDEX IF EXISTS idx_appointments_tenant_status ON appointments;
DROP INDEX IF EXISTS idx_appointments_tenant_customer_email ON appointments;

-- Step 2: Add temporary column
ALTER TABLE appointments ADD COLUMN tenant_uuid CHAR(36) NULL AFTER tenant_id;

-- Step 3: Map tenant_ids to UUIDs
UPDATE appointments a
INNER JOIN tenants t ON a.tenant_id = t.tenant_id
SET a.tenant_uuid = t.id;

-- Step 4: Verify
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('WARNING: ', COUNT(*), ' appointments could not be mapped to a tenant UUID!')
        ELSE 'All appointments successfully mapped to tenant UUIDs'
    END AS appointments_migration_status
FROM appointments 
WHERE tenant_uuid IS NULL;

-- Step 5: Drop old and rename new
ALTER TABLE appointments DROP COLUMN tenant_id;
ALTER TABLE appointments CHANGE COLUMN tenant_uuid tenant_id CHAR(36) NOT NULL;

-- Step 6: Recreate indexes and add FK
CREATE INDEX idx_appointments_tenant_id ON appointments (tenant_id);
CREATE INDEX idx_appointments_tenant_employee ON appointments (tenant_id, employee_id);
CREATE INDEX idx_appointments_tenant_time ON appointments (tenant_id, start_time, end_time);
CREATE INDEX idx_appointments_tenant_status ON appointments (tenant_id, status);
CREATE INDEX idx_appointments_tenant_customer_email ON appointments (tenant_id, customer_email);
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =============================================================================
-- SUBSCRIPTIONS TABLE MIGRATION
-- =============================================================================

-- Step 1: Drop existing indexes
DROP INDEX IF EXISTS uk_subscriptions_tenant_id ON subscriptions;

-- Step 2: Add temporary column
ALTER TABLE subscriptions ADD COLUMN tenant_uuid CHAR(36) NULL AFTER tenant_id;

-- Step 3: Map tenant_ids to UUIDs
UPDATE subscriptions s
INNER JOIN tenants t ON s.tenant_id = t.tenant_id
SET s.tenant_uuid = t.id;

-- Step 4: Verify
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('WARNING: ', COUNT(*), ' subscriptions could not be mapped to a tenant UUID!')
        ELSE 'All subscriptions successfully mapped to tenant UUIDs'
    END AS subscriptions_migration_status
FROM subscriptions 
WHERE tenant_uuid IS NULL;

-- Step 5: Drop old and rename new
ALTER TABLE subscriptions DROP COLUMN tenant_id;
ALTER TABLE subscriptions CHANGE COLUMN tenant_uuid tenant_id CHAR(36) NOT NULL;

-- Step 6: Recreate indexes and add FK
CREATE UNIQUE INDEX uk_subscriptions_tenant_id ON subscriptions (tenant_id);
ALTER TABLE subscriptions 
ADD CONSTRAINT fk_subscriptions_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =============================================================================
-- CALL_LOGS TABLE MIGRATION
-- =============================================================================

-- Step 1: Drop existing indexes
DROP INDEX IF EXISTS idx_call_logs_tenant_id ON call_logs;

-- Step 2: Add temporary column
ALTER TABLE call_logs ADD COLUMN tenant_uuid CHAR(36) NULL AFTER tenant_id;

-- Step 3: Map tenant_ids to UUIDs
UPDATE call_logs c
INNER JOIN tenants t ON c.tenant_id = t.tenant_id
SET c.tenant_uuid = t.id;

-- Step 4: Verify
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('WARNING: ', COUNT(*), ' call_logs could not be mapped to a tenant UUID!')
        ELSE 'All call_logs successfully mapped to tenant UUIDs'
    END AS call_logs_migration_status
FROM call_logs 
WHERE tenant_uuid IS NULL;

-- Step 5: Drop old and rename new
ALTER TABLE call_logs DROP COLUMN tenant_id;
ALTER TABLE call_logs CHANGE COLUMN tenant_uuid tenant_id CHAR(36) NOT NULL;

-- Step 6: Recreate indexes and add FK
CREATE INDEX idx_call_logs_tenant_id ON call_logs (tenant_id);
ALTER TABLE call_logs 
ADD CONSTRAINT fk_call_logs_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES tenants(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- =============================================================================
-- Migration complete!
-- All tenant_id columns now:
-- - Use CHAR(36) type to store UUIDs
-- - Reference tenants.id as a foreign key
-- - Contain the tenant's UUID instead of the string identifier
-- =============================================================================
SELECT 'All tables migration completed successfully!' AS Status;
