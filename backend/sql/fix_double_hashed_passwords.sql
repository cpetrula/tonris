-- =============================================================================
-- Fix Double-Hashed Passwords Migration
-- =============================================================================
-- 
-- Problem: Prior to the User model fix (PR #162), passwords were being 
-- double-hashed when users were created or updated. This caused login failures
-- because the comparePassword method would try to compare the plaintext password
-- against a double-hashed value.
--
-- Solution: This script generates password reset tokens for affected users,
-- forcing them through the password reset flow instead of setting a temporary
-- password.
--
-- This is the RECOMMENDED approach for production environments.
-- =============================================================================

USE tonris_db;

-- Generate password reset tokens for all users
-- The token expires in 24 hours
UPDATE users 
SET password_reset_token = SHA2(CONCAT(UUID(), email, NOW()), 256),
    password_reset_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR),
    updatedAt = NOW()
WHERE is_active = 1;

-- Log the number of affected rows
SELECT ROW_COUNT() as users_with_reset_tokens;

-- Verification query - show affected users (without exposing actual tokens)
SELECT 
    id,
    email,
    DATE_FORMAT(password_reset_expires, '%Y-%m-%d %H:%i:%s') as reset_token_expires,
    is_active
FROM users
WHERE password_reset_token IS NOT NULL
ORDER BY email;

-- =============================================================================
-- Post-Migration Instructions
-- =============================================================================
-- 
-- 1. Extract reset tokens from database for each user:
--    SELECT email, password_reset_token FROM users WHERE password_reset_token IS NOT NULL;
--
-- 2. Send password reset emails to all affected users with their unique token
--    The reset link format: https://your-domain.com/reset-password?token={token}
--
-- 3. Users click the link and set a new password
--
-- 4. The new password will be properly hashed (single hash) by the fixed User model
--
-- Alternative for Testing/Development:
-- If you need immediate access for testing, see the companion script:
-- fix_double_hashed_passwords_temp.sql
-- =============================================================================
