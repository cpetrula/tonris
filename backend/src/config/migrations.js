/**
 * Database Migrations
 * One-time migrations that run on server startup
 */
const { sequelize } = require('./db');
const logger = require('../utils/logger');

/**
 * Fix subscription ENUM columns to match code definitions
 * This is needed when new ENUM values are added to the Sequelize model
 * but the database column wasn't updated
 */
const fixSubscriptionEnums = async () => {
  try {
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
 * Run all pending migrations
 */
const runMigrations = async () => {
  logger.info('Running database migrations...');

  await fixSubscriptionEnums();

  logger.info('Database migrations complete');
};

module.exports = {
  runMigrations,
  fixSubscriptionEnums,
};
