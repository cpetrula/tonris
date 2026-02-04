-- Migration: Create integrations table for third-party service connections
-- Supports Vagaro and future integrations

CREATE TABLE IF NOT EXISTS integrations (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL,
    provider ENUM('vagaro') NOT NULL,
    status ENUM('pending', 'active', 'error', 'disabled') NOT NULL DEFAULT 'pending',
    webhook_token VARCHAR(64) NOT NULL UNIQUE,
    config JSON DEFAULT NULL,
    sync_settings JSON NOT NULL DEFAULT (JSON_OBJECT(
        'syncAppointments', TRUE,
        'syncCustomers', TRUE,
        'syncEmployees', FALSE
    )),
    last_webhook_at DATETIME DEFAULT NULL,
    webhook_count INT NOT NULL DEFAULT 0,
    last_error TEXT DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key to tenants
    CONSTRAINT fk_integrations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Unique constraint: one integration per provider per tenant
    CONSTRAINT uq_integrations_tenant_provider UNIQUE (tenant_id, provider),
    
    -- Index for webhook token lookup
    INDEX idx_integrations_webhook_token (webhook_token),
    
    -- Index for tenant lookups
    INDEX idx_integrations_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify the table was created
DESCRIBE integrations;
