-- =============================================================================
-- Add Login Enablement Columns to Users Table
-- Adds columns to support employee login enablement and temporary password flow
-- =============================================================================

USE tonris_db;

-- Add login_enabled column to users table
ALTER TABLE users
ADD COLUMN login_enabled TINYINT(1) DEFAULT 0 COMMENT 'Whether user can log in (1=enabled, 0=disabled)'
AFTER is_active;

-- Add must_reset_password column to users table
ALTER TABLE users
ADD COLUMN must_reset_password TINYINT(1) DEFAULT 0 COMMENT 'Whether user must reset password on next login'
AFTER login_enabled;

-- Add temp_password_created_at column to users table
ALTER TABLE users
ADD COLUMN temp_password_created_at DATETIME NULL COMMENT 'Timestamp when temporary password was generated'
AFTER must_reset_password;

-- Add index for filtering by login_enabled status
CREATE INDEX idx_users_login_enabled ON users(login_enabled);

-- Update existing users with role = NULL or 'superuser' to have login_enabled = 1
-- These are the original account creators who should have login enabled by default
UPDATE users
SET login_enabled = 1
WHERE role IS NULL OR role = 'superuser';

-- Note: New users will default to login_enabled = 0 unless explicitly set during creation
