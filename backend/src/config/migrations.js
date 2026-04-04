/**
 * Database Migrations
 * One-time migrations that run on server startup
 */
const { sequelize } = require('./db');
const logger = require('../utils/logger');

/**
 * Add missing columns to subscriptions table
 */
const addMissingColumns = async () => {
  const columnsToAdd = [
    { name: 'plan_tier', sql: "ADD COLUMN plan_tier ENUM('starter', 'professional', 'business', 'legacy') NOT NULL DEFAULT 'professional'" },
    { name: 'stripe_metered_price_id', sql: "ADD COLUMN stripe_metered_price_id VARCHAR(255) NULL" },
    { name: 'included_minutes', sql: "ADD COLUMN included_minutes INT DEFAULT NULL" },
    { name: 'current_period_minutes_used', sql: "ADD COLUMN current_period_minutes_used INT DEFAULT 0 NOT NULL" },
    { name: 'usage_alert_sent_80', sql: "ADD COLUMN usage_alert_sent_80 TINYINT(1) DEFAULT 0" },
    { name: 'usage_alert_sent_100', sql: "ADD COLUMN usage_alert_sent_100 TINYINT(1) DEFAULT 0" },
  ];

  for (const col of columnsToAdd) {
    try {
      await sequelize.query(`ALTER TABLE subscriptions ${col.sql}`);
      logger.info(`Migration: Added column ${col.name}`);
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        // Column already exists, skip
      } else if (!error.message.includes("doesn't exist")) {
        logger.warn(`Migration: Could not add ${col.name}: ${error.message}`);
      }
    }
  }
};

/**
 * Fix subscription ENUM columns to match code definitions
 * This is needed when new ENUM values are added to the Sequelize model
 * but the database column wasn't updated
 */
const fixSubscriptionEnums = async () => {
  try {
    // First add any missing columns
    await addMissingColumns();

    // Update status ENUM to include all values
    await sequelize.query(`
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
      ) NOT NULL DEFAULT 'incomplete'
    `);
    logger.info('Migration: Updated status ENUM');

    // Update plan_tier ENUM to include all values
    await sequelize.query(`
      ALTER TABLE subscriptions
      MODIFY COLUMN plan_tier ENUM(
        'starter',
        'professional',
        'business',
        'legacy'
      ) NOT NULL DEFAULT 'professional'
    `);
    logger.info('Migration: Updated plan_tier ENUM');

    // Update billing_interval ENUM
    await sequelize.query(`
      ALTER TABLE subscriptions
      MODIFY COLUMN billing_interval ENUM('month', 'year') NULL
    `);
    logger.info('Migration: Updated billing_interval ENUM');

    return true;
  } catch (error) {
    // If the error is "Unknown column" the table might not exist yet
    // which is fine - it will be created with the correct ENUMs
    if (error.message.includes('Unknown column') || error.message.includes("doesn't exist")) {
      logger.info('Migration: subscriptions table not ready, skipping ENUM fix');
      return true;
    }
    logger.error(`Migration failed: ${error.message}`);
    return false;
  }
};

/**
 * Sync Subscription model with database (add missing columns)
 */
const syncSubscriptionTable = async () => {
  try {
    // Import the Subscription model and sync with alter
    const { Subscription } = require('../modules/billing/subscription.model');
    await Subscription.sync({ alter: true });
    logger.info('Migration: Synced Subscription table schema');
    return true;
  } catch (error) {
    logger.error(`Migration: Failed to sync Subscription table: ${error.message}`);
    return false;
  }
};

/**
 * Run all pending migrations
 */
/**
 * Sync the Enrollment table (create if not exists)
 */
const syncEnrollmentTable = async () => {
  try {
    const { Enrollment } = require('../modules/enrollments/enrollment.model');
    await Enrollment.sync();
    logger.info('Migration: Enrollment table synced');
  } catch (error) {
    logger.error(`Migration: Failed to sync Enrollment table: ${error.message}`);
  }
};

const runMigrations = async () => {
  logger.info('Running database migrations...');

  // First sync the table schema to add any missing columns
  await syncSubscriptionTable();

  // Then fix ENUM values
  await fixSubscriptionEnums();

  // Sync new tables
  await syncEnrollmentTable();

  logger.info('Database migrations complete');
};

module.exports = {
  runMigrations,
  fixSubscriptionEnums,
};
