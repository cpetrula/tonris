-- =============================================================================
-- Fix Double-Hashed Passwords - Temporary Password Approach
-- =============================================================================
-- 
-- ⚠️  SECURITY WARNING: FOR DEVELOPMENT/TESTING ENVIRONMENTS ONLY! ⚠️
-- 
-- This script sets a known temporary password that is publicly visible in the
-- repository. DO NOT USE IN PRODUCTION or any environment with real user data.
--
-- For PRODUCTION environments, use fix_double_hashed_passwords.sql instead,
-- which generates unique reset tokens and forces users through the secure
-- password reset flow.
--
-- ALTERNATIVE: Generate a unique temporary password per environment:
-- 1. Generate: node -e "require('bcrypt').hash('YourUniquePassword', 10).then(console.log)"
-- 2. Replace @temp_password below with the generated hash
-- 3. Communicate the unique password securely to your team
-- =============================================================================

USE tonris_db;

-- Temporary password: 'TempPassword123!'
-- This is a properly hashed bcrypt password (single hash, 10 rounds)
-- Generated with: await bcrypt.hash('TempPassword123!', 10)
SET @temp_password = '$2b$10$amqwfNqs/I1Ndhsd1LqrO.GfTGWq0Al1nFJcgY/nYe4z959GaH/lW';

-- Backup current passwords (optional, uncomment if needed)
-- CREATE TABLE IF NOT EXISTS users_password_backup AS 
-- SELECT id, email, password, updatedAt FROM users;

-- Update all active users to use the temporary password
UPDATE users 
SET password = @temp_password,
    updatedAt = NOW()
WHERE is_active = 1;

-- Log the number of affected rows
SELECT ROW_COUNT() as users_updated;

-- Verification query
SELECT 
    COUNT(*) as total_users, 
    SUM(CASE WHEN password = @temp_password THEN 1 ELSE 0 END) as users_with_temp_password
FROM users
WHERE is_active = 1;

-- Show affected users (for verification)
SELECT 
    id,
    email,
    is_active,
    DATE_FORMAT(updatedAt, '%Y-%m-%d %H:%i:%s') as updated_at
FROM users
ORDER BY email;

-- =============================================================================
-- Post-Script Usage
-- =============================================================================
-- 
-- All affected users can now login with:
-- Password: TempPassword123!
--
-- Users should change their password immediately after login through:
-- 1. Profile settings
-- 2. Password change functionality
-- 3. "Forgot Password" flow
--
-- The new password will be properly hashed (single hash) by the fixed User model.
-- =============================================================================
