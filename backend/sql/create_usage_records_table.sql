-- Migration: Create usage_records table for tracking call minutes
-- This table tracks per-call minute usage for the hybrid pricing model

CREATE TABLE IF NOT EXISTS usage_records (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL,
    subscription_id CHAR(36) NOT NULL,
    call_log_id CHAR(36) NULL COMMENT 'Reference to the call log that generated this usage',
    usage_type ENUM('call_minutes') NOT NULL DEFAULT 'call_minutes',
    quantity INT NOT NULL COMMENT 'Usage quantity (e.g., minutes for calls)',
    period_start DATETIME NOT NULL COMMENT 'Start of the billing period this usage belongs to',
    period_end DATETIME NOT NULL COMMENT 'End of the billing period this usage belongs to',
    stripe_usage_record_id VARCHAR(255) NULL COMMENT 'Stripe usage record ID if reported to Stripe',
    reported_to_stripe_at DATETIME NULL COMMENT 'When this usage was reported to Stripe',
    is_overage BOOLEAN DEFAULT FALSE COMMENT 'Whether this usage is overage (beyond included minutes)',
    metadata JSON NULL COMMENT 'Additional metadata (call details, etc.)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_usage_records_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_usage_records_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    
    -- Indexes for common queries
    INDEX idx_usage_records_tenant_id (tenant_id),
    INDEX idx_usage_records_subscription_id (subscription_id),
    INDEX idx_usage_records_call_log_id (call_log_id),
    INDEX idx_usage_records_period (period_start, period_end),
    INDEX idx_usage_records_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Migration complete: usage_records table created' AS status;
