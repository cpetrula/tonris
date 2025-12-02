-- =============================================================================
-- TONRIS Database Migration
-- Add business_type column to tenants table with FK to business_types
-- =============================================================================

USE tonris_db;

-- =============================================================================
-- Add business_type column to tenants table
-- This column is a foreign key to the business_types table
-- =============================================================================

-- Add the business_type column
ALTER TABLE tenants
ADD COLUMN business_type_id CHAR(36) NULL AFTER twilio_phone_number;

-- Add index for the business_type_id column
ALTER TABLE tenants
ADD INDEX idx_tenants_business_type_id (business_type_id);

-- Add foreign key constraint to business_types table
ALTER TABLE tenants
ADD CONSTRAINT fk_tenants_business_type_id 
    FOREIGN KEY (business_type_id) 
    REFERENCES business_types(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;
