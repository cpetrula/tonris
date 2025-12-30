/**
 * Scheduler Service
 * Handles scheduled tasks like daily digest, appointment reminders, and cleanup
 * Uses node-cron for scheduling
 */
const cron = require('node-cron');
const logger = require('../utils/logger');
const { CallLog } = require('../modules/telephony/callLog.model');
const { Appointment } = require('../modules/appointments/appointment.model');
const { Tenant } = require('../modules/tenants/tenant.model');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Track active cron jobs for cleanup
const activeJobs = new Map();

/**
 * Initialize all scheduled tasks
 * @param {Object} options - Configuration options
 * @param {Function} options.sendEmail - Email sending function
 * @param {Object} options.smsHandler - SMS handler for reminders
 * @param {Object} options.waitingListService - Waiting list service
 */
const initScheduler = (options = {}) => {
  const {
    sendEmail,
    smsHandler,
    waitingListService,
  } = options;

  // Daily digest at 11:59 PM
  const digestJob = cron.schedule('59 23 * * *', async () => {
    logger.info('[Scheduler] Running daily digest...');
    try {
      await sendDailyDigest(sendEmail);
    } catch (error) {
      logger.error(`[Scheduler] Daily digest failed: ${error.message}`);
    }
  });
  activeJobs.set('dailyDigest', digestJob);
  logger.info('[Scheduler] Daily digest scheduled for 11:59 PM');

  // Appointment reminders every 15 minutes
  const reminderJob = cron.schedule('*/15 * * * *', async () => {
    try {
      await sendAppointmentReminders(smsHandler);
    } catch (error) {
      logger.error(`[Scheduler] Appointment reminders failed: ${error.message}`);
    }
  });
  activeJobs.set('appointmentReminders', reminderJob);
  logger.info('[Scheduler] Appointment reminders checking every 15 minutes');

  // Reset waiting list at 6 AM
  if (waitingListService) {
    const waitingListJob = cron.schedule('0 6 * * *', async () => {
      logger.info('[Scheduler] Resetting waiting list...');
      try {
        const result = await waitingListService.resetWaitingList();
        logger.info(`[Scheduler] Waiting list reset - removed ${result.deleted || 0} entries`);
      } catch (error) {
        logger.error(`[Scheduler] Waiting list reset failed: ${error.message}`);
      }
    });
    activeJobs.set('waitingListReset', waitingListJob);
    logger.info('[Scheduler] Waiting list reset scheduled for 6 AM daily');
  }

  return {
    digestJob,
    reminderJob,
    waitingListJob: activeJobs.get('waitingListReset'),
  };
};

/**
 * Send daily digest email to all active tenants
 * @param {Function} sendEmail - Email sending function
 * @returns {Promise<Object>} - Results summary
 */
const sendDailyDigest = async (sendEmail) => {
  if (!sendEmail) {
    logger.warn('[Scheduler] No email function provided for daily digest');
    return { success: false, error: 'No email function' };
  }

  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Get all active tenants
    const tenants = await Tenant.findAll({
      where: { status: 'active' },
      attributes: ['id', 'tenantId', 'name', 'contactEmail'],
    });

    const results = {
      totalTenants: tenants.length,
      sent: 0,
      skipped: 0,
      errors: 0,
    };

    for (const tenant of tenants) {
      if (!tenant.contactEmail) {
        results.skipped++;
        continue;
      }

      try {
        // Get today's calls for this tenant
        const calls = await CallLog.findAll({
          where: {
            tenantId: tenant.id,
            createdAt: {
              [Op.between]: [todayStart, todayEnd],
            },
          },
          order: [['createdAt', 'DESC']],
        });

        if (calls.length === 0) {
          results.skipped++;
          continue;
        }

        // Build digest
        const digest = buildDailyDigestEmail(tenant.name, calls, todayStart);

        // Send email
        await sendEmail({
          to: tenant.contactEmail,
          subject: digest.subject,
          html: digest.html,
        });

        results.sent++;
        logger.debug(`[Scheduler] Sent digest to ${tenant.name}`);
      } catch (tenantError) {
        logger.error(`[Scheduler] Digest failed for ${tenant.name}: ${tenantError.message}`);
        results.errors++;
      }
    }

    logger.info(`[Scheduler] Daily digest complete: ${results.sent} sent, ${results.skipped} skipped, ${results.errors} errors`);
    return { success: true, results };
  } catch (error) {
    logger.error(`[Scheduler] Error in daily digest: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Build daily digest email HTML
 * @param {string} tenantName - Tenant name
 * @param {Array} calls - Today's calls
 * @param {Date} date - Date for the digest
 * @returns {Object} - { subject, html }
 */
const buildDailyDigestEmail = (tenantName, calls, date) => {
  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed');
  const failedCalls = calls.filter(c => ['failed', 'busy', 'no-answer', 'canceled'].includes(c.status));
  const inProgressCalls = calls.filter(c => c.status === 'in-progress');

  // Calculate average duration
  let totalDuration = 0;
  completedCalls.forEach(call => {
    if (call.duration) {
      totalDuration += call.duration;
    }
  });
  const avgDuration = completedCalls.length > 0 ? Math.round(totalDuration / completedCalls.length) : 0;
  const avgDurationFormatted = `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`;

  // Build call rows (limit to 10)
  const callRows = calls.slice(0, 10).map(call => {
    const statusColor = call.status === 'completed' ? '#4CAF50'
      : ['failed', 'busy', 'no-answer'].includes(call.status) ? '#f44336'
      : '#ff9800';

    const callTime = new Date(call.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const duration = call.duration
      ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s`
      : 'N/A';

    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${callTime}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${call.fromNumber || 'Unknown'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <span style="color: ${statusColor}; font-weight: bold;">${call.status}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${duration}</td>
      </tr>
    `;
  }).join('');

  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Daily Call Report - ${dateStr} (${totalCalls} calls)`;

  const html = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">${tenantName} - Daily Call Report</h1>
        <p style="margin: 5px 0 0 0; font-size: 18px;">${dateStr}</p>
      </div>

      <div style="padding: 20px;">
        <!-- Summary Stats -->
        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 30px;">
          <div style="flex: 1; min-width: 150px; background-color: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="margin: 0; color: #2196F3; font-size: 36px;">${totalCalls}</h2>
            <p style="margin: 5px 0 0 0; color: #666;">Total Calls</p>
          </div>
          <div style="flex: 1; min-width: 150px; background-color: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="margin: 0; color: #4CAF50; font-size: 36px;">${completedCalls.length}</h2>
            <p style="margin: 5px 0 0 0; color: #666;">Completed</p>
          </div>
          <div style="flex: 1; min-width: 150px; background-color: #ffebee; padding: 20px; border-radius: 8px; text-align: center;">
            <h2 style="margin: 0; color: #f44336; font-size: 36px;">${failedCalls.length}</h2>
            <p style="margin: 5px 0 0 0; color: #666;">Failed/Missed</p>
          </div>
        </div>

        <!-- Average Duration -->
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
          <p style="margin: 0;"><strong>Average Call Duration:</strong> ${avgDurationFormatted}</p>
        </div>

        <!-- Recent Calls Table -->
        <h3 style="margin-bottom: 15px;">Recent Calls</h3>
        <table style="width: 100%; border-collapse: collapse; background-color: white;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Time</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Caller</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${callRows}
          </tbody>
        </table>

        ${totalCalls > 10 ? `<p style="color: #666; font-size: 14px; margin-top: 15px;"><em>Showing 10 of ${totalCalls} calls</em></p>` : ''}

        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          This daily digest is automatically sent at 11:59 PM.<br>
          Powered by CRITON.AI
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Send appointment reminder SMS
 * @param {Object} smsHandler - SMS handler with sendAppointmentReminder
 * @returns {Promise<Object>} - Results summary
 */
const sendAppointmentReminders = async (smsHandler) => {
  if (!smsHandler) {
    return { success: false, error: 'No SMS handler' };
  }

  try {
    const now = new Date();

    // 24h window: 23-25 hours from now
    const reminder24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const reminder24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // 1h window: 45-75 minutes from now
    const reminder1hStart = new Date(now.getTime() + 45 * 60 * 1000);
    const reminder1hEnd = new Date(now.getTime() + 75 * 60 * 1000);

    const results = {
      reminder24h: { sent: 0, skipped: 0 },
      reminder1h: { sent: 0, skipped: 0 },
    };

    // Find appointments needing 24h reminder
    const appointments24h = await Appointment.findAll({
      where: {
        startTime: {
          [Op.between]: [reminder24hStart, reminder24hEnd],
        },
        status: 'confirmed',
        [Op.or]: [
          { 'metadata.reminder24hSent': null },
          { 'metadata.reminder24hSent': false },
        ],
      },
      include: [{
        association: 'service',
        attributes: ['name'],
      }],
    });

    for (const apt of appointments24h) {
      try {
        const tenant = await Tenant.findByPk(apt.tenantId);
        if (!tenant || !apt.customerPhone) {
          results.reminder24h.skipped++;
          continue;
        }

        await smsHandler.sendAppointmentReminder({
          tenantId: tenant.tenantId,
          customerPhone: apt.customerPhone,
          customerName: apt.customerName || 'there',
          appointmentDate: apt.startTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          }),
          appointmentTime: apt.startTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          serviceName: apt.service?.name || 'your appointment',
        });

        // Mark as sent
        apt.metadata = { ...apt.metadata, reminder24hSent: true };
        await apt.save();

        results.reminder24h.sent++;
      } catch (error) {
        logger.error(`[Scheduler] 24h reminder failed: ${error.message}`);
        results.reminder24h.skipped++;
      }
    }

    // Find appointments needing 1h reminder
    const appointments1h = await Appointment.findAll({
      where: {
        startTime: {
          [Op.between]: [reminder1hStart, reminder1hEnd],
        },
        status: 'confirmed',
        [Op.or]: [
          { 'metadata.reminder1hSent': null },
          { 'metadata.reminder1hSent': false },
        ],
      },
      include: [{
        association: 'service',
        attributes: ['name'],
      }],
    });

    for (const apt of appointments1h) {
      try {
        const tenant = await Tenant.findByPk(apt.tenantId);
        if (!tenant || !apt.customerPhone) {
          results.reminder1h.skipped++;
          continue;
        }

        // Send 1h reminder (shorter message)
        await smsHandler.sendCustomerNotification({
          tenantId: tenant.tenantId,
          to: apt.customerPhone,
          message: `Reminder: Your appointment is in about 1 hour! See you soon.`,
          type: 'appointment_reminder_1h',
          skipConsentCheck: true, // Transactional
        });

        // Mark as sent
        apt.metadata = { ...apt.metadata, reminder1hSent: true };
        await apt.save();

        results.reminder1h.sent++;
      } catch (error) {
        logger.error(`[Scheduler] 1h reminder failed: ${error.message}`);
        results.reminder1h.skipped++;
      }
    }

    if (results.reminder24h.sent > 0 || results.reminder1h.sent > 0) {
      logger.info(`[Scheduler] Reminders sent: 24h=${results.reminder24h.sent}, 1h=${results.reminder1h.sent}`);
    }

    return { success: true, results };
  } catch (error) {
    logger.error(`[Scheduler] Error sending reminders: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Stop all scheduled jobs (for graceful shutdown)
 */
const stopScheduler = () => {
  for (const [name, job] of activeJobs) {
    job.stop();
    logger.debug(`[Scheduler] Stopped job: ${name}`);
  }
  activeJobs.clear();
  logger.info('[Scheduler] All scheduled jobs stopped');
};

/**
 * Manually trigger daily digest (for testing)
 * @param {Function} sendEmail - Email function
 * @returns {Promise<Object>} - Result
 */
const triggerDailyDigest = async (sendEmail) => {
  logger.info('[Scheduler] Manual daily digest triggered');
  return sendDailyDigest(sendEmail);
};

/**
 * Manually trigger appointment reminders (for testing)
 * @param {Object} smsHandler - SMS handler
 * @returns {Promise<Object>} - Result
 */
const triggerReminders = async (smsHandler) => {
  logger.info('[Scheduler] Manual reminder check triggered');
  return sendAppointmentReminders(smsHandler);
};

module.exports = {
  initScheduler,
  sendDailyDigest,
  sendAppointmentReminders,
  buildDailyDigestEmail,
  stopScheduler,
  triggerDailyDigest,
  triggerReminders,
};
