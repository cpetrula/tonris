-- Migration: Add usage-based billing fields to subscriptions
-- This migration adds fields required for the new hybrid pricing model

-- Add plan tier column
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_tier ENUM('starter', 'professional', 'business', 'legacy') DEFAULT 'professional' AFTER stripe_price_id;

-- Add metered price ID for overage billing
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_metered_price_id VARCHAR(255) NULL AFTER stripe_price_id;

-- Add included minutes field
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS included_minutes INT DEFAULT NULL AFTER plan_tier COMMENT 'Number of minutes included in the plan per billing period (-1 for unlimited)';

-- Add current period minutes used field
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_minutes_used INT DEFAULT 0 NOT NULL AFTER included_minutes COMMENT 'Minutes used in current billing period';

-- Add usage alert tracking fields
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS usage_alert_sent_80 BOOLEAN DEFAULT FALSE AFTER current_period_minutes_used COMMENT 'Whether 80% usage alert has been sent this period';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS usage_alert_sent_100 BOOLEAN DEFAULT FALSE AFTER usage_alert_sent_80 COMMENT 'Whether 100% usage alert has been sent this period';

-- Add index on plan_tier for filtering
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_tier ON subscriptions(plan_tier);

-- Mark existing subscriptions as legacy (unlimited minutes) to grandfather them
UPDATE subscriptions 
SET plan_tier = 'legacy', 
    included_minutes = -1
WHERE status IN ('active', 'trialing') 
  AND plan_tier IS NULL 
  AND stripe_subscription_id IS NOT NULL;

-- Set default for new trialing subscriptions
UPDATE subscriptions 
SET plan_tier = 'professional',
    included_minutes = 100
WHERE status = 'trialing' 
  AND stripe_subscription_id IS NULL
  AND plan_tier IS NULL;

SELECT 'Migration complete: usage-based billing fields added' AS status;
