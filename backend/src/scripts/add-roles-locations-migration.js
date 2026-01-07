/**
 * Migration: Add Roles, Locations, and Notification Preferences
 *
 * This migration adds:
 * - role column to users table
 * - employee_id column to users table
 * - role column to employees table
 * - location_id column to employees table
 * - notification_preferences column to employees table
 * - locations table (new)
 *
 * Run with: node src/scripts/add-roles-locations-migration.js
 */
const { sequelize } = require('../config/db');
const logger = require('../utils/logger');

const runMigration = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    logger.info('Starting roles/locations migration...');

    // 1. Create locations table if it doesn't exist
    logger.info('Creating locations table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id CHAR(36) PRIMARY KEY,
        tenant_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address JSON,
        phone VARCHAR(50),
        email VARCHAR(255),
        is_default BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'inactive') DEFAULT 'active',
        business_hours JSON,
        metadata JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        INDEX idx_locations_tenant (tenant_id),
        INDEX idx_locations_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    logger.info('locations table created/verified');

    // 2. Add role column to users table (if not exists)
    logger.info('Adding role column to users table...');
    try {
      await sequelize.query(`
        ALTER TABLE users
        ADD COLUMN role ENUM('superuser', 'admin', 'manager', 'staff') NULL
      `);
      logger.info('role column added to users table');
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        logger.info('role column already exists in users table');
      } else {
        throw error;
      }
    }

    // 3. Add employee_id column to users table (if not exists)
    logger.info('Adding employee_id column to users table...');
    try {
      await sequelize.query(`
        ALTER TABLE users
        ADD COLUMN employee_id CHAR(36) NULL,
        ADD INDEX idx_users_employee (employee_id)
      `);
      logger.info('employee_id column added to users table');
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        logger.info('employee_id column already exists in users table');
      } else if (error.original && error.original.code === 'ER_DUP_KEYNAME') {
        logger.info('employee_id index already exists in users table');
      } else {
        throw error;
      }
    }

    // 4. Add role column to employees table (if not exists)
    logger.info('Adding role column to employees table...');
    try {
      await sequelize.query(`
        ALTER TABLE employees
        ADD COLUMN role ENUM('admin', 'manager', 'staff') DEFAULT 'staff'
      `);
      logger.info('role column added to employees table');
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        logger.info('role column already exists in employees table');
      } else {
        throw error;
      }
    }

    // 5. Add location_id column to employees table (if not exists)
    logger.info('Adding location_id column to employees table...');
    try {
      await sequelize.query(`
        ALTER TABLE employees
        ADD COLUMN location_id CHAR(36) NULL,
        ADD INDEX idx_employees_location (location_id)
      `);
      logger.info('location_id column added to employees table');
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        logger.info('location_id column already exists in employees table');
      } else if (error.original && error.original.code === 'ER_DUP_KEYNAME') {
        logger.info('location_id index already exists in employees table');
      } else {
        throw error;
      }
    }

    // 6. Add notification_preferences column to employees table (if not exists)
    logger.info('Adding notification_preferences column to employees table...');
    try {
      await sequelize.query(`
        ALTER TABLE employees
        ADD COLUMN notification_preferences JSON
      `);
      logger.info('notification_preferences column added to employees table');
    } catch (error) {
      if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
        logger.info('notification_preferences column already exists in employees table');
      } else {
        throw error;
      }
    }

    logger.info('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
