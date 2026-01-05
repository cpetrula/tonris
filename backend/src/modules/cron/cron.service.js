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

module.exports = {
  sendDailyDigestEmails,
};
