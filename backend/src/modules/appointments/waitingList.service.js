/**
 * Waiting List Service
 * Handles both same-day slot backfill (salons) and enrollment waitlists (schools)
 */
const logger = require('../../utils/logger');
const { WaitingList, WAITING_STATUS, WAITING_TYPE } = require('./waitingList.model');
const { Service } = require('../services/service.model');

// Track active timeouts for slot_backfill cleanup
const activeTimeouts = new Map();

// ─── Shared ──────────────────────────────────────────────

/**
 * Add a customer/parent to the waiting list
 * @param {Object} params
 * @returns {Promise<Object>}
 */
const addToWaitingList = async (params) => {
  const {
    tenantId,
    type = WAITING_TYPE.SLOT_BACKFILL,
    customerName,
    customerPhone,
    customerEmail,
    // slot_backfill fields
    serviceName,
    serviceId,
    serviceDurationMinutes,
    // enrollment fields
    childName,
    childDob,
    programName,
    preferredSchedule,
    preferredLocation,
    preferredStartDate,
    notes,
  } = params;

  try {
    // Duplicate check
    const alreadyOnList = await WaitingList.isOnWaitingList(tenantId, customerPhone, type, programName);
    if (alreadyOnList) {
      const msg = type === WAITING_TYPE.ENROLLMENT
        ? `Already on waitlist for ${programName || 'this program'}`
        : 'Already on waiting list for today';
      return { success: false, error: msg, code: 'ALREADY_ON_LIST' };
    }

    // For slot_backfill, resolve duration if not provided
    let duration = serviceDurationMinutes;
    if (type === WAITING_TYPE.SLOT_BACKFILL) {
      if (!duration && serviceName) {
        duration = await getServiceDuration(tenantId, serviceName);
      }
      duration = duration || 30;
    }

    const entry = await WaitingList.create({
      tenantId,
      type,
      customerName,
      customerPhone,
      customerEmail,
      serviceId,
      serviceName,
      serviceDurationMinutes: duration,
      childName,
      childDob,
      programName,
      preferredSchedule,
      preferredLocation,
      preferredStartDate,
      notes,
      status: WAITING_STATUS.WAITING,
    });

    const position = await WaitingList.getPosition(tenantId, customerPhone, type);

    logger.info(`[WaitingList] Added ${customerName} to ${type} list (position ${position})`);

    return { success: true, entry, position };
  } catch (error) {
    logger.error(`[WaitingList] Error adding to waiting list: ${error.message}`);
    return { success: false, error: 'Failed to add to waiting list', code: 'ADD_FAILED' };
  }
};

/**
 * Get waiting list for a tenant
 */
const getWaitingList = async (tenantId, type = null) => {
  try {
    let entries;
    if (type) {
      entries = await WaitingList.getList(tenantId, type);
    } else {
      // Return all types
      const slotEntries = await WaitingList.getList(tenantId, WAITING_TYPE.SLOT_BACKFILL);
      const enrollEntries = await WaitingList.getList(tenantId, WAITING_TYPE.ENROLLMENT);
      entries = [...slotEntries, ...enrollEntries];
    }

    return {
      success: true,
      entries,
      count: entries.length,
      waiting: entries.filter(e => e.status === WAITING_STATUS.WAITING).length,
      notified: entries.filter(e => e.status === WAITING_STATUS.NOTIFIED).length,
      booked: entries.filter(e => e.status === WAITING_STATUS.BOOKED).length,
      enrolled: entries.filter(e => e.status === WAITING_STATUS.ENROLLED).length,
    };
  } catch (error) {
    logger.error(`[WaitingList] Error getting waiting list: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Get customer's position in queue
 */
const getPosition = async (tenantId, customerPhone, type = WAITING_TYPE.SLOT_BACKFILL) => {
  try {
    const position = await WaitingList.getPosition(tenantId, customerPhone, type);
    if (position === null) {
      return { success: false, error: 'Not on waiting list', code: 'NOT_ON_LIST' };
    }
    return { success: true, position };
  } catch (error) {
    logger.error(`[WaitingList] Error getting position: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Remove customer from waiting list
 */
const removeFromWaitingList = async (tenantId, customerPhone, type = WAITING_TYPE.SLOT_BACKFILL) => {
  try {
    const { Op } = require('sequelize');
    const where = {
      tenantId,
      customerPhone,
      status: WAITING_STATUS.WAITING,
      type,
    };

    if (type === WAITING_TYPE.SLOT_BACKFILL) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.createdAt = { [Op.gte]: today };
    }

    const deleted = await WaitingList.destroy({ where });
    if (deleted > 0) {
      logger.info(`[WaitingList] Removed ${customerPhone} from ${type} list`);
      return { success: true };
    }
    return { success: false, error: 'Not on waiting list', code: 'NOT_ON_LIST' };
  } catch (error) {
    logger.error(`[WaitingList] Error removing from list: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Reset/clear old entries (called by cron)
 */
const resetWaitingList = async (tenantId = null) => {
  try {
    const deleted = await WaitingList.clearOldEntries(tenantId);
    logger.info(`[WaitingList] Reset complete - removed ${deleted} old entries`);
    return { success: true, deleted };
  } catch (error) {
    logger.error(`[WaitingList] Error resetting list: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// ─── Slot Backfill (Salon) ───────────────────────────────

/**
 * Calculate response window based on time until appointment
 */
const calculateResponseWindow = (slotTime) => {
  const now = new Date();
  const minutesUntilSlot = (slotTime.getTime() - now.getTime()) / (1000 * 60);

  if (minutesUntilSlot < 30) return 10;
  if (minutesUntilSlot < 120) return 20;
  if (minutesUntilSlot < 240) return 45;
  return 120;
};

/**
 * Get service duration from database
 */
const getServiceDuration = async (tenantId, serviceName) => {
  try {
    const { Op } = require('sequelize');
    const service = await Service.findOne({
      where: {
        tenantId,
        name: { [Op.like]: `%${serviceName}%` },
        status: 'active',
      },
    });
    return service?.duration || null;
  } catch (error) {
    logger.error(`[WaitingList] Error getting service duration: ${error.message}`);
    return null;
  }
};

/**
 * Notify next person in line about a cancelled slot (slot_backfill)
 */
const notifyNextInLine = async (slot, smsHandler = null) => {
  const { tenantId, startTime, durationMinutes, serviceName } = slot;

  try {
    const matches = await WaitingList.findMatchingEntries(tenantId, durationMinutes);
    if (matches.length === 0) {
      return { success: false, error: 'No matching entries', code: 'NO_MATCHES' };
    }

    const entry = matches[0];
    const responseWindow = calculateResponseWindow(startTime);
    const deadline = new Date(Date.now() + responseWindow * 60 * 1000);

    const timeStr = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

    entry.status = WAITING_STATUS.NOTIFIED;
    entry.notifiedAt = new Date();
    entry.notifiedSlotTime = startTime;
    entry.responseDeadline = deadline;
    await entry.save();

    if (smsHandler) {
      try {
        await smsHandler.sendCustomerNotification({
          tenantId: entry.tenantId,
          to: entry.customerPhone,
          message: `Great news! A ${timeStr} appointment just opened up for your ${entry.serviceName || 'service'}. Reply YES within ${responseWindow} minutes to grab it, or NO to pass.`,
          type: 'waiting_list_notification',
          skipConsentCheck: true,
        });
        logger.info(`[WaitingList] Notified ${entry.customerName} about ${timeStr} slot`);
      } catch (smsError) {
        logger.error(`[WaitingList] Failed to send SMS: ${smsError.message}`);
      }
    }

    scheduleResponseTimeout(entry.id, slot, responseWindow, smsHandler);

    return { success: true, entry, responseWindowMinutes: responseWindow, deadline };
  } catch (error) {
    logger.error(`[WaitingList] Error notifying waiting list: ${error.message}`);
    return { success: false, error: 'Failed to notify', code: 'NOTIFY_FAILED' };
  }
};

/**
 * Handle YES/NO SMS response (slot_backfill)
 */
const handleWaitingListResponse = async (customerPhone, response, smsHandler = null) => {
  try {
    const entry = await WaitingList.findNotifiedByPhone(customerPhone);
    if (!entry) {
      return { success: false, action: 'not_found' };
    }

    const slotTime = entry.notifiedSlotTime;

    if (activeTimeouts.has(entry.id)) {
      clearTimeout(activeTimeouts.get(entry.id));
      activeTimeouts.delete(entry.id);
    }

    if (response === 'yes') {
      entry.status = WAITING_STATUS.BOOKED;
      await entry.save();
      logger.info(`[WaitingList] ${entry.customerName} confirmed - booking slot`);

      if (smsHandler && slotTime) {
        try {
          const timeStr = slotTime.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true,
          });
          await smsHandler.sendCustomerNotification({
            tenantId: entry.tenantId,
            to: customerPhone,
            message: `You're confirmed for ${timeStr} today! See you soon.`,
            type: 'waiting_list_confirmation',
            skipConsentCheck: true,
          });
        } catch (smsError) {
          logger.error(`[WaitingList] Failed to send confirmation: ${smsError.message}`);
        }
      }

      return { success: true, action: 'booked', entry, slotTime };
    } else {
      entry.status = WAITING_STATUS.NO_RESPONSE;
      await entry.save();
      logger.info(`[WaitingList] ${entry.customerName} passed - notifying next in line`);

      if (slotTime && slotTime > new Date()) {
        await notifyNextInLine({
          tenantId: entry.tenantId,
          startTime: slotTime,
          durationMinutes: entry.serviceDurationMinutes,
          serviceName: entry.serviceName,
        }, smsHandler);
      }

      return { success: true, action: 'passed', entry };
    }
  } catch (error) {
    logger.error(`[WaitingList] Error handling response: ${error.message}`);
    return { success: false, action: 'error', error: error.message };
  }
};

/**
 * Schedule a timeout for slot_backfill response
 */
const scheduleResponseTimeout = (entryId, slot, responseWindowMinutes, smsHandler) => {
  const timeoutMs = responseWindowMinutes * 60 * 1000;

  const timeoutId = setTimeout(async () => {
    try {
      const entry = await WaitingList.findByPk(entryId);
      if (entry && entry.status === WAITING_STATUS.NOTIFIED) {
        logger.info(`[WaitingList] ${entry.customerName} didn't respond in time`);
        entry.status = WAITING_STATUS.NO_RESPONSE;
        await entry.save();

        if (smsHandler) {
          try {
            await smsHandler.sendCustomerNotification({
              tenantId: entry.tenantId,
              to: entry.customerPhone,
              message: "The appointment slot has been offered to the next person. We'll text you if another opens up!",
              type: 'waiting_list_timeout',
              skipConsentCheck: true,
            });
          } catch (smsError) {
            logger.error(`[WaitingList] Failed to send timeout message: ${smsError.message}`);
          }
        }

        if (slot.startTime > new Date()) {
          await notifyNextInLine(slot, smsHandler);
        }
      }
    } catch (error) {
      logger.error(`[WaitingList] Error in timeout handler: ${error.message}`);
    } finally {
      activeTimeouts.delete(entryId);
    }
  }, timeoutMs);

  activeTimeouts.set(entryId, timeoutId);
};

// ─── Enrollment (School) ─────────────────────────────────

/**
 * Notify a parent that a spot opened in a program (enrollment)
 * Uses 72-hour response window matching school policies
 */
const notifyEnrollmentOpening = async (tenantId, programName, smsHandler = null) => {
  try {
    const entries = await WaitingList.findByProgram(tenantId, programName);
    if (entries.length === 0) {
      return { success: false, error: 'No one waiting for this program', code: 'NO_MATCHES' };
    }

    const entry = entries[0]; // first-come-first-served
    const responseWindowMinutes = 72 * 60; // 72 hours
    const deadline = new Date(Date.now() + responseWindowMinutes * 60 * 1000);

    entry.status = WAITING_STATUS.NOTIFIED;
    entry.notifiedAt = new Date();
    entry.responseDeadline = deadline;
    await entry.save();

    if (smsHandler) {
      try {
        await smsHandler.sendCustomerNotification({
          tenantId,
          to: entry.customerPhone,
          message: `Great news! A spot has opened up in our ${programName} program for ${entry.childName || 'your child'}. You have 72 hours to confirm enrollment. Please reply YES to accept or NO to pass. You can also call us to discuss.`,
          type: 'enrollment_notification',
          skipConsentCheck: true,
        });
        logger.info(`[WaitingList] Notified ${entry.customerName} about ${programName} opening`);
      } catch (smsError) {
        logger.error(`[WaitingList] Failed to send enrollment SMS: ${smsError.message}`);
      }
    }

    return { success: true, entry, deadline };
  } catch (error) {
    logger.error(`[WaitingList] Error notifying enrollment opening: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Handle enrollment response (YES/NO from parent)
 */
const handleEnrollmentResponse = async (customerPhone, response, smsHandler = null) => {
  try {
    const entry = await WaitingList.findNotifiedByPhone(customerPhone);
    if (!entry || entry.type !== WAITING_TYPE.ENROLLMENT) {
      return { success: false, action: 'not_found' };
    }

    if (response === 'yes') {
      entry.status = WAITING_STATUS.ENROLLED;
      await entry.save();
      logger.info(`[WaitingList] ${entry.customerName} accepted enrollment for ${entry.programName}`);

      if (smsHandler) {
        try {
          await smsHandler.sendCustomerNotification({
            tenantId: entry.tenantId,
            to: customerPhone,
            message: `Welcome! ${entry.childName || 'Your child'} is confirmed for the ${entry.programName} program. We'll be in touch with next steps for enrollment paperwork.`,
            type: 'enrollment_confirmation',
            skipConsentCheck: true,
          });
        } catch (smsError) {
          logger.error(`[WaitingList] Failed to send enrollment confirmation: ${smsError.message}`);
        }
      }

      return { success: true, action: 'enrolled', entry };
    } else {
      entry.status = WAITING_STATUS.NO_RESPONSE;
      await entry.save();
      logger.info(`[WaitingList] ${entry.customerName} declined enrollment for ${entry.programName}`);

      // Notify next parent in line
      await notifyEnrollmentOpening(entry.tenantId, entry.programName, smsHandler);

      return { success: true, action: 'passed', entry };
    }
  } catch (error) {
    logger.error(`[WaitingList] Error handling enrollment response: ${error.message}`);
    return { success: false, action: 'error', error: error.message };
  }
};

/**
 * Get enrollment waitlist for a specific program
 */
const getEnrollmentWaitlist = async (tenantId, programName = null) => {
  try {
    const { Op } = require('sequelize');
    const where = {
      tenantId,
      type: WAITING_TYPE.ENROLLMENT,
      status: { [Op.in]: [WAITING_STATUS.WAITING, WAITING_STATUS.NOTIFIED] },
    };
    if (programName) where.programName = programName;

    const entries = await WaitingList.findAll({
      where,
      order: [['createdAt', 'ASC']],
    });

    return {
      success: true,
      entries,
      count: entries.length,
    };
  } catch (error) {
    logger.error(`[WaitingList] Error getting enrollment waitlist: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all active timeouts (for graceful shutdown)
 */
const clearAllTimeouts = () => {
  for (const [, timeoutId] of activeTimeouts) {
    clearTimeout(timeoutId);
  }
  activeTimeouts.clear();
};

module.exports = {
  // Shared
  addToWaitingList,
  getWaitingList,
  getPosition,
  removeFromWaitingList,
  resetWaitingList,
  clearAllTimeouts,
  // Slot backfill (salon)
  calculateResponseWindow,
  getServiceDuration,
  notifyNextInLine,
  handleWaitingListResponse,
  // Enrollment (school)
  notifyEnrollmentOpening,
  handleEnrollmentResponse,
  getEnrollmentWaitlist,
};
