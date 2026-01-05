/**
 * Cron Scheduler
 * Sets up internal cron jobs using node-cron
 */
const cron = require('node-cron');
const cronService = require('./cron.service');
const logger = require('../../utils/logger');

/**
 * Initialize all scheduled cron jobs
 * Called once when the server starts
 */
const initScheduler = () => {
  logger.info('Initializing cron scheduler...');

  // Daily Digest - runs at 7:00 AM UTC every day
  cron.schedule('0 7 * * *', async () => {
    logger.info('Running scheduled daily digest job');
    try {
      const results = await cronService.sendDailyDigestEmails();
      logger.info(`Daily digest completed: ${results.sent} sent, ${results.skipped} skipped, ${results.failed} failed`);
    } catch (error) {
      logger.error(`Daily digest job failed: ${error.message}`);
    }
  }, {
    timezone: 'UTC',
  });

  // Appointment Reminders - runs every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    logger.info('Running scheduled appointment reminders job');
    try {
      const results = await cronService.sendAppointmentReminders();
      logger.info(`Appointment reminders completed: ${results.sent} sent, ${results.skipped} skipped, ${results.failed} failed`);
    } catch (error) {
      logger.error(`Appointment reminders job failed: ${error.message}`);
    }
  }, {
    timezone: 'UTC',
  });

  logger.info('Cron scheduler initialized - Daily digest at 7:00 UTC, Reminders every hour');
};

module.exports = {
  initScheduler,
};
