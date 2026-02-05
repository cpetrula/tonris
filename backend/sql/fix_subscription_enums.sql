-- Fix subscription ENUM columns to match code definitions
-- Run this against the production database

-- Update status ENUM to include all values
ALTER TABLE subscriptions
MODIFY COLUMN status ENUM(
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused',
    'inactive'
) NOT NULL DEFAULT 'incomplete';

-- Update plan_tier ENUM to include all values (in case it's missing some)
ALTER TABLE subscriptions
MODIFY COLUMN plan_tier ENUM(
    'starter',
    'professional',
    'business',
    'legacy'
) NOT NULL DEFAULT 'professional';

-- Update billing_interval ENUM
ALTER TABLE subscriptions
MODIFY COLUMN billing_interval ENUM('month', 'year') NULL;

SELECT 'ENUM fix complete' AS status;
