-- Migration: Add usage-based billing fields to subscriptions
-- This migration adds fields required for the new hybrid pricing model

-- Add plan tier column (check if exists first via procedure)
DROP PROCEDURE IF EXISTS add_usage_billing_fields;

DELIMITER //
CREATE PROCEDURE add_usage_billing_fields()
BEGIN
    -- Add plan_tier column if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'subscriptions' 
        AND COLUMN_NAME = 'plan_tier'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN plan_tier ENUM('starter', 'professional', 'business', 'legacy') DEFAULT 'professional' AFTER stripe_price_id;
    END IF;

    -- Add stripe_metered_price_id column if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'subscriptions' 
        AND COLUMN_NAME = 'stripe_metered_price_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_metered_price_id VARCHAR(255) NULL AFTER stripe_price_id;
    END IF;

    -- Add included_minutes column if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'subscriptions' 
        AND COLUMN_NAME = 'included_minutes'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN included_minutes INT DEFAULT NULL COMMENT 'Number of minutes included in the plan per billing period (-1 for unlimited)';
    END IF;

    -- Add current_period_minutes_used column if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'subscriptions' 
        AND COLUMN_NAME = 'current_period_minutes_used'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_minutes_used INT DEFAULT 0 NOT NULL COMMENT 'Minutes used in current billing period';
    END IF;

    -- Add usage_alert_sent_80 column if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'subscriptions' 
        AND COLUMN_NAME = 'usage_alert_sent_80'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN usage_alert_sent_80 TINYINT(1) DEFAULT 0 COMMENT 'Whether 80% usage alert has been sent this period';
    END IF;

    -- Add usage_alert_sent_100 column if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'subscriptions' 
        AND COLUMN_NAME = 'usage_alert_sent_100'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN usage_alert_sent_100 TINYINT(1) DEFAULT 0 COMMENT 'Whether 100% usage alert has been sent this period';
    END IF;

    -- Add index on plan_tier if not exists
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'subscriptions' 
        AND INDEX_NAME = 'idx_subscriptions_plan_tier'
    ) THEN
        CREATE INDEX idx_subscriptions_plan_tier ON subscriptions(plan_tier);
    END IF;
END //
DELIMITER ;

-- Run the procedure
CALL add_usage_billing_fields();

-- Clean up
DROP PROCEDURE IF EXISTS add_usage_billing_fields;

-- Mark existing subscriptions as legacy (unlimited minutes) to grandfather them
UPDATE subscriptions 
SET plan_tier = 'legacy', 
    included_minutes = -1
WHERE status IN ('active', 'trialing') 
  AND (plan_tier IS NULL OR plan_tier = 'professional')
  AND stripe_subscription_id IS NOT NULL;

-- Set default for new trialing subscriptions
UPDATE subscriptions 
SET plan_tier = 'professional',
    included_minutes = 100
WHERE status = 'trialing' 
  AND stripe_subscription_id IS NULL
  AND plan_tier IS NULL;

SELECT 'Migration complete: usage-based billing fields added' AS status;
