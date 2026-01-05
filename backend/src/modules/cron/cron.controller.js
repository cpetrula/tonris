/**
 * Cron Controller
 * Handles HTTP requests for cron job endpoints
 */
const cronService = require('./cron.service');
const logger = require('../../utils/logger');

/**
 * POST /api/cron/daily-digest
 * Trigger daily digest email job
 */
const triggerDailyDigest = async (req, res, next) => {
  try {
    logger.info('Daily digest cron job triggered');

    const results = await cronService.sendDailyDigestEmails();

    logger.info(`Daily digest job completed: ${results.sent} sent, ${results.skipped} skipped, ${results.failed} failed`);

    res.status(200).json({
      success: true,
      message: 'Daily digest job completed',
      data: results,
    });
  } catch (error) {
    logger.error(`Daily digest job failed: ${error.message}`);
    next(error);
  }
};

/**
 * POST /api/cron/appointment-reminders
 * Trigger appointment reminder SMS job
 */
const triggerAppointmentReminders = async (req, res, next) => {
  try {
    logger.info('Appointment reminders cron job triggered');

    const results = await cronService.sendAppointmentReminders();

    logger.info(`Appointment reminders job completed: ${results.sent} sent, ${results.skipped} skipped, ${results.failed} failed`);

    res.status(200).json({
      success: true,
      message: 'Appointment reminders job completed',
      data: results,
    });
  } catch (error) {
    logger.error(`Appointment reminders job failed: ${error.message}`);
    next(error);
  }
};

module.exports = {
  triggerDailyDigest,
  triggerAppointmentReminders,
};
