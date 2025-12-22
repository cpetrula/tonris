-- =============================================================================
-- Add SMS Opt-In Column to Users Table
-- Adds a column to track user's SMS notification preferences
-- =============================================================================

USE tonris_db;

-- Add sms_opt_in column to users table
ALTER TABLE users
ADD COLUMN sms_opt_in TINYINT(1) DEFAULT 1 COMMENT 'User opt-in for SMS notifications (1=opted in, 0=opted out)'
AFTER is_active;

-- Add index for filtering by SMS opt-in status
CREATE INDEX idx_users_sms_opt_in ON users(sms_opt_in);

-- Note: Default is 1 (opted in) for new users
-- Existing users will also default to opted in, but can change preference
