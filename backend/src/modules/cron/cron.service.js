/**
 * Cron Service
 * Handles scheduled job logic
 */
const { Op } = require('sequelize');
const { Tenant } = require('../tenants/tenant.model');
const { Appointment, APPOINTMENT_STATUS } = require('../appointments/appointment.model');
const { Employee } = require('../employees/employee.model');
const { Service } = require('../services/service.model');
const { emailService } = require('../notifications');
const smsService = require('../appointments/sms.service');
const logger = require('../../utils/logger');

/**
 * Get start and end of a day in UTC
 * @param {Date} date - Date object
 * @returns {Object} - { start, end }
 */
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Format time from Date object
 * @param {Date} date - Date object
 * @returns {string} - Formatted time (e.g., "2:00 PM")
 */
const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Send daily digest emails to all eligible tenants
 * @returns {Promise<Object>} - Results summary
 */
const sendDailyDigestEmails = async () => {
  const results = {
    total: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  try {
    // Get all active tenants
    const tenants = await Tenant.findAll({
      where: { status: 'active' },
    });

    results.total = tenants.length;

    for (const tenant of tenants) {
      try {
        // Parse notification settings
        let notificationSettings = tenant.notificationSettings;
        if (typeof notificationSettings === 'string') {
          try {
            notificationSettings = JSON.parse(notificationSettings);
          } catch (e) {
            notificationSettings = {};
          }
        }

        // Check if daily digest is enabled (default to true)
        const emailDailyDigest = notificationSettings?.emailDailyDigest !== false;

        if (!emailDailyDigest) {
          results.skipped++;
          results.details.push({
            tenantId: tenant.id,
            status: 'skipped',
            reason: 'Daily digest disabled',
          });
          continue;
        }

        // Check if contact email exists
        if (!tenant.contactEmail) {
          results.skipped++;
          results.details.push({
            tenantId: tenant.id,
            status: 'skipped',
            reason: 'No contact email',
          });
          continue;
        }

        // Get today's and tomorrow's dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayBounds = getDayBounds(today);
        const tomorrowBounds = getDayBounds(tomorrow);

        // Get today's appointments
        const todayAppointments = await Appointment.findAll({
          where: {
            tenantId: tenant.id,
            startTime: {
              [Op.gte]: todayBounds.start,
              [Op.lte]: todayBounds.end,
            },
            status: {
              [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
            },
          },
          include: [
            { model: Employee, as: 'employee', attributes: ['firstName', 'lastName'] },
            { model: Service, as: 'service', attributes: ['name'] },
          ],
          order: [['startTime', 'ASC']],
        });

        // Get tomorrow's appointments
        const tomorrowAppointments = await Appointment.findAll({
          where: {
            tenantId: tenant.id,
            startTime: {
              [Op.gte]: tomorrowBounds.start,
              [Op.lte]: tomorrowBounds.end,
            },
            status: {
              [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
            },
          },
          include: [
            { model: Employee, as: 'employee', attributes: ['firstName', 'lastName'] },
            { model: Service, as: 'service', attributes: ['name'] },
          ],
          order: [['startTime', 'ASC']],
        });

        // Format appointments for email
        const formatAppointments = (appointments) =>
          appointments.map((apt) => ({
            time: formatTime(new Date(apt.startTime)),
            customerName: apt.customerName,
            serviceName: apt.service?.name || 'Unknown Service',
            employeeName: apt.employee
              ? `${apt.employee.firstName} ${apt.employee.lastName}`
              : 'Unknown Employee',
          }));

        // Format date for email
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-US', dateOptions);

        // Send digest email
        const emailResult = await emailService.sendDailyDigestEmail(tenant.contactEmail, {
          businessName: tenant.name,
          date: formattedDate,
          todayAppointments: formatAppointments(todayAppointments),
          tomorrowAppointments: formatAppointments(tomorrowAppointments),
          stats: {
            todayCount: todayAppointments.length,
            tomorrowCount: tomorrowAppointments.length,
          },
        });

        if (emailResult.success) {
          results.sent++;
          results.details.push({
            tenantId: tenant.id,
            status: 'sent',
            todayCount: todayAppointments.length,
            tomorrowCount: tomorrowAppointments.length,
          });
          logger.info(`Daily digest sent to ${tenant.contactEmail} for tenant ${tenant.id}`);
        } else {
          results.failed++;
          results.details.push({
            tenantId: tenant.id,
            status: 'failed',
            error: emailResult.error || emailResult.reason,
          });
          logger.warn(`Failed to send daily digest to ${tenant.contactEmail}: ${emailResult.error || emailResult.reason}`);
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          tenantId: tenant.id,
          status: 'failed',
          error: error.message,
        });
        logger.error(`Error processing daily digest for tenant ${tenant.id}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error in daily digest job: ${error.message}`);
    throw error;
  }

  return results;
};

/**
 * Send SMS reminders for upcoming appointments
 * @returns {Promise<Object>} - Results summary
 */
const sendAppointmentReminders = async () => {
  const results = {
    total: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: [],
  };

  try {
    // Get all active tenants
    const tenants = await Tenant.findAll({
      where: { status: 'active' },
    });

    for (const tenant of tenants) {
      try {
        // Parse notification settings
        let notificationSettings = tenant.notificationSettings;
        if (typeof notificationSettings === 'string') {
          try {
            notificationSettings = JSON.parse(notificationSettings);
          } catch (e) {
            notificationSettings = {};
          }
        }

        // Check if SMS reminders are enabled (default to true)
        const smsReminderEnabled = notificationSettings?.smsReminderEnabled !== false;
        const smsReminderHours = notificationSettings?.smsReminderHours || 24;

        if (!smsReminderEnabled) {
          continue; // Skip this tenant silently
        }

        // Calculate reminder window
        // Find appointments that start between reminderHours and (reminderHours + 1) from now
        // This way the cron job running every hour will catch appointments once
        const now = new Date();
        const windowStart = new Date(now.getTime() + smsReminderHours * 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() + (smsReminderHours + 1) * 60 * 60 * 1000);

        // Find appointments that need reminders
        const appointments = await Appointment.findAll({
          where: {
            tenantId: tenant.id,
            startTime: {
              [Op.gte]: windowStart,
              [Op.lt]: windowEnd,
            },
            status: {
              [Op.in]: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED],
            },
            reminderSentAt: null, // Haven't sent reminder yet
            customerPhone: {
              [Op.not]: null,
              [Op.ne]: '',
            },
          },
          include: [
            { model: Employee, as: 'employee', attributes: ['firstName', 'lastName'] },
            { model: Service, as: 'service', attributes: ['name'] },
          ],
        });

        results.total += appointments.length;

        for (const appointment of appointments) {
          try {
            // Send SMS reminder
            const smsResult = await smsService.sendAppointmentReminderSms(
              appointment,
              appointment.employee,
              appointment.service,
              tenant.name,
              tenant.id
            );

            if (smsResult) {
              // Mark reminder as sent
              await appointment.update({ reminderSentAt: new Date() });
              results.sent++;
              results.details.push({
                appointmentId: appointment.id,
                tenantId: tenant.id,
                status: 'sent',
              });
            } else {
              results.skipped++;
              results.details.push({
                appointmentId: appointment.id,
                tenantId: tenant.id,
                status: 'skipped',
                reason: 'SMS not sent (no phone, not opted in, or SMS not configured)',
              });
            }
          } catch (error) {
            results.failed++;
            results.details.push({
              appointmentId: appointment.id,
              tenantId: tenant.id,
              status: 'failed',
              error: error.message,
            });
            logger.error(`Error sending reminder for appointment ${appointment.id}: ${error.message}`);
          }
        }
      } catch (error) {
        logger.error(`Error processing reminders for tenant ${tenant.id}: ${error.message}`);
      }
    }
  } catch (error) {
    logger.error(`Error in appointment reminders job: ${error.message}`);
    throw error;
  }

  return results;
};

module.exports = {
  sendDailyDigestEmails,
  sendAppointmentReminders,
};
