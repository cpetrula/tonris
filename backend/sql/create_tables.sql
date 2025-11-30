-- =============================================================================
-- TONRIS Database Schema
-- MySQL Database Tables Creation Script
-- =============================================================================

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tonris_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tonris_db;

-- =============================================================================
-- Table: users
-- Stores user authentication and profile data
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(64) NOT NULL,
    two_factor_secret VARCHAR(255) NULL,
    two_factor_enabled TINYINT(1) DEFAULT 0,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires DATETIME NULL,
    is_active TINYINT(1) DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: tenants
-- Stores tenant/organization configuration
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    tenant_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    status ENUM('pending', 'active', 'suspended', 'cancelled') NOT NULL DEFAULT 'pending',
    plan_type ENUM('free', 'basic', 'professional', 'enterprise') NOT NULL DEFAULT 'free',
    settings JSON NOT NULL DEFAULT (JSON_OBJECT()),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NULL,
    address JSON NULL,
    metadata JSON NULL,
    trial_ends_at DATETIME NULL,
    onboarding_completed_at DATETIME NULL,
    twilio_phone_number VARCHAR(50) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_tenants_tenant_id (tenant_id),
    UNIQUE KEY uk_tenants_slug (slug),
    UNIQUE KEY uk_tenants_twilio_phone_number (twilio_phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: employees
-- Stores employee/staff information
-- =============================================================================
CREATE TABLE IF NOT EXISTS employees (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    tenant_id VARCHAR(64) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    employee_type ENUM('employee', 'contractor') NOT NULL DEFAULT 'employee',
    status ENUM('active', 'inactive', 'on_leave') NOT NULL DEFAULT 'active',
    hire_date DATE NULL,
    schedule JSON NOT NULL DEFAULT (JSON_OBJECT()),
    service_ids JSON NOT NULL DEFAULT (JSON_ARRAY()),
    metadata JSON NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_employees_tenant_id (tenant_id),
    UNIQUE KEY uk_employees_tenant_email (tenant_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: services
-- Stores service catalog
-- =============================================================================
CREATE TABLE IF NOT EXISTS services (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    tenant_id CHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    category ENUM('hair', 'nails', 'skin', 'makeup', 'massage', 'other') NOT NULL DEFAULT 'other',
    duration INT NOT NULL DEFAULT 60 COMMENT 'Duration in minutes',
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    add_ons JSON NOT NULL DEFAULT (JSON_ARRAY()),
    metadata JSON NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_services_tenant_id (tenant_id),
    UNIQUE KEY uk_services_tenant_name (tenant_id, name),
    CONSTRAINT fk_services_tenant_id FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: appointments
-- Stores appointment bookings
-- =============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    tenant_id VARCHAR(64) NOT NULL,
    employee_id CHAR(36) NOT NULL,
    service_id CHAR(36) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'scheduled',
    add_ons JSON NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Array of add-on IDs selected for this appointment',
    notes TEXT NULL,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_duration INT NOT NULL DEFAULT 0 COMMENT 'Total duration in minutes including add-ons',
    cancellation_reason ENUM('customer_request', 'employee_unavailable', 'reschedule', 'no_show', 'other') NULL,
    cancellation_notes TEXT NULL,
    cancelled_at DATETIME NULL,
    metadata JSON NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_appointments_tenant_id (tenant_id),
    INDEX idx_appointments_tenant_employee (tenant_id, employee_id),
    INDEX idx_appointments_tenant_time (tenant_id, start_time, end_time),
    INDEX idx_appointments_tenant_status (tenant_id, status),
    INDEX idx_appointments_tenant_customer_email (tenant_id, customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: subscriptions
-- Stores Stripe subscription data
-- =============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    tenant_id VARCHAR(64) NOT NULL,
    stripe_customer_id VARCHAR(255) NULL,
    stripe_subscription_id VARCHAR(255) NULL,
    stripe_price_id VARCHAR(255) NULL,
    status ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused') NOT NULL DEFAULT 'incomplete',
    billing_interval ENUM('month', 'year') NULL,
    current_period_start DATETIME NULL,
    current_period_end DATETIME NULL,
    cancel_at_period_end TINYINT(1) DEFAULT 0,
    canceled_at DATETIME NULL,
    trial_start DATETIME NULL,
    trial_end DATETIME NULL,
    metadata JSON NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_subscriptions_tenant_id (tenant_id),
    UNIQUE KEY uk_subscriptions_stripe_subscription_id (stripe_subscription_id),
    INDEX idx_subscriptions_stripe_customer_id (stripe_customer_id),
    INDEX idx_subscriptions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: call_logs
-- Stores telephony call metadata
-- =============================================================================
CREATE TABLE IF NOT EXISTS call_logs (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    tenant_id VARCHAR(64) NOT NULL,
    twilio_call_sid VARCHAR(64) NOT NULL,
    direction ENUM('inbound', 'outbound') NOT NULL,
    status ENUM('initiated', 'ringing', 'in-progress', 'completed', 'busy', 'no-answer', 'canceled', 'failed') NOT NULL DEFAULT 'initiated',
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    duration INT NULL COMMENT 'Call duration in seconds',
    started_at DATETIME NULL,
    ended_at DATETIME NULL,
    recording_url VARCHAR(500) NULL,
    transcription TEXT NULL,
    metadata JSON DEFAULT (JSON_OBJECT()),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_call_logs_tenant_id (tenant_id),
    UNIQUE KEY uk_call_logs_twilio_call_sid (twilio_call_sid),
    INDEX idx_call_logs_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
