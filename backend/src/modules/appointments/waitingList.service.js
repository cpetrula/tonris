/**
 * Waiting List Service
 * Manages same-day waiting list for cancelled appointment slots
 * Ported from bolt-ai-node
 */
const logger = require('../../utils/logger');
const { WaitingList, WAITING_STATUS } = require('./waitingList.model');
const { Service } = require('../services/service.model');

// Track active timeouts for cleanup
const activeTimeouts = new Map();

/**
 * Calculate response window based on time until appointment
 * Shorter window for urgent slots
 * @param {Date} slotTime - Appointment start time
 * @returns {number} - Response window in minutes
 */
const calculateResponseWindow = (slotTime) => {
  const now = new Date();
  const minutesUntilSlot = (slotTime.getTime() - now.getTime()) / (1000 * 60);

  if (minutesUntilSlot < 30) {
    return 10; // 10 minutes to respond
  } else if (minutesUntilSlot < 120) {
    return 20; // 20 minutes
  } else if (minutesUntilSlot < 240) {
    return 45; // 45 minutes
  } else {
    return 120; // 2 hours
  }
};

/**
 * Get service duration from database
 * @param {string} tenantId - Tenant ID
 * @param {string} serviceName - Service name to look up
 * @returns {Promise<number|null>} - Duration in minutes or null
 */
const getServiceDuration = async (tenantId, serviceName) => {
  try {
    const { Op } = require('sequelize');
    const service = await Service.findOne({
      where: {
        tenantId,
        name: { [Op.iLike]: `%${serviceName}%` },
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
 * Add customer to waiting list
 * @param {Object} params - Entry parameters
 * @returns {Promise<Object>} - Result with entry and position
 */
const addToWaitingList = async ({
  tenantId,
  customerName,
  customerPhone,
  serviceName,
  serviceId,
  serviceDurationMinutes,
}) => {
  try {
    // Check if already on waiting list today
    const alreadyOnList = await WaitingList.isOnWaitingList(tenantId, customerPhone);
    if (alreadyOnList) {
      return {
        success: false,
        error: 'Already on waiting list for today',
        code: 'ALREADY_ON_LIST',
      };
    }

    // Try to get duration if not provided
    let duration = serviceDurationMinutes;
    if (!duration && serviceName) {
      duration = await getServiceDuration(tenantId, serviceName);
    }
    if (!duration) {
      duration = 30; // Default to 30 minutes
      logger.debug('[WaitingList] Using default 30-minute duration');
    }

    // Create entry
    const entry = await WaitingList.create({
      tenantId,
      customerName,
      customerPhone,
      serviceId,
      serviceName,
      serviceDurationMinutes: duration,
      status: WAITING_STATUS.WAITING,
    });

    // Get position
    const position = await WaitingList.getPosition(tenantId, customerPhone);

    logger.info(`[WaitingList] Added ${customerName} to waiting list for ${serviceName || 'service'} (${duration} min)`);

    return {
      success: true,
      entry,
      position,
    };
  } catch (error) {
    logger.error(`[WaitingList] Error adding to waiting list: ${error.message}`);
    return {
      success: false,
      error: 'Failed to add to waiting list',
      code: 'ADD_FAILED',
    };
  }
};

/**
 * Notify next person in line about a cancelled slot
 * @param {Object} slot - Cancelled slot info
 * @param {Object} smsHandler - SMS handler for sending notifications
 * @returns {Promise<Object>} - Result with notified entry
 */
const notifyNextInLine = async (slot, smsHandler = null) => {
  const { tenantId, startTime, durationMinutes, serviceName } = slot;

  try {
    // Find matching entries
    const matches = await WaitingList.findMatchingEntries(tenantId, durationMinutes);

    if (matches.length === 0) {
      logger.debug('[WaitingList] No matching entries for cancelled slot');
      return {
        success: false,
        error: 'No matching entries',
        code: 'NO_MATCHES',
      };
    }

    // Get the first one (first-come-first-served)
    const entry = matches[0];

    // Calculate response window
    const responseWindow = calculateResponseWindow(startTime);
    const deadline = new Date(Date.now() + responseWindow * 60 * 1000);

    // Format time nicely
    const timeStr = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Update entry status
    entry.status = WAITING_STATUS.NOTIFIED;
    entry.notifiedAt = new Date();
    entry.notifiedSlotTime = startTime;
    entry.responseDeadline = deadline;
    await entry.save();

    // Send SMS if handler provided
    if (smsHandler) {
      try {
        const message = `Great news! A ${timeStr} appointment just opened up for your ${entry.serviceName || 'service'}. Reply YES within ${responseWindow} minutes to grab it, or NO to pass.`;

        await smsHandler.sendCustomerNotification({
          tenantId: entry.tenantId,
          to: entry.customerPhone,
          message,
          type: 'waiting_list_notification',
          skipConsentCheck: true, // Transactional message
        });

        logger.info(`[WaitingList] Notified ${entry.customerName} about ${timeStr} slot`);
      } catch (smsError) {
        logger.error(`[WaitingList] Failed to send SMS: ${smsError.message}`);
      }
    } else {
      logger.warn('[WaitingList] No SMS handler provided, skipping notification');
    }

    // Schedule timeout check
    scheduleResponseTimeout(entry.id, slot, responseWindow, smsHandler);

    return {
      success: true,
      entry,
      responseWindowMinutes: responseWindow,
      deadline,
    };
  } catch (error) {
    logger.error(`[WaitingList] Error notifying waiting list: ${error.message}`);
    return {
      success: false,
      error: 'Failed to notify',
      code: 'NOTIFY_FAILED',
    };
  }
};

/**
 * Handle YES/NO response from customer
 * @param {string} customerPhone - Customer phone
 * @param {string} response - 'yes' or 'no'
 * @param {Object} smsHandler - Optional SMS handler
 * @returns {Promise<Object>} - Result with action taken
 */
const handleWaitingListResponse = async (customerPhone, response, smsHandler = null) => {
  try {
    // Find the notified entry
    const entry = await WaitingList.findNotifiedByPhone(customerPhone);

    if (!entry) {
      logger.debug(`[WaitingList] No notified entry found for ${customerPhone}`);
      return {
        success: false,
        action: 'not_found',
      };
    }

    const slotTime = entry.notifiedSlotTime;

    // Clear any pending timeout
    if (activeTimeouts.has(entry.id)) {
      clearTimeout(activeTimeouts.get(entry.id));
      activeTimeouts.delete(entry.id);
    }

    if (response === 'yes') {
      // Mark as booked
      entry.status = WAITING_STATUS.BOOKED;
      await entry.save();

      logger.info(`[WaitingList] ${entry.customerName} confirmed - booking slot`);

      // Send confirmation SMS
      if (smsHandler && slotTime) {
        try {
          const timeStr = slotTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
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

      return {
        success: true,
        action: 'booked',
        entry,
        slotTime,
      };
    } else {
      // Mark as passed
      entry.status = WAITING_STATUS.NO_RESPONSE;
      await entry.save();

      logger.info(`[WaitingList] ${entry.customerName} passed - notifying next in line`);

      // Notify next person if slot is still in future
      if (slotTime && slotTime > new Date()) {
        await notifyNextInLine({
          tenantId: entry.tenantId,
          startTime: slotTime,
          durationMinutes: entry.serviceDurationMinutes,
          serviceName: entry.serviceName,
        }, smsHandler);
      }

      return {
        success: true,
        action: 'passed',
        entry,
      };
    }
  } catch (error) {
    logger.error(`[WaitingList] Error handling response: ${error.message}`);
    return {
      success: false,
      action: 'error',
      error: error.message,
    };
  }
};

/**
 * Schedule a timeout check for response
 * @param {string} entryId - Entry ID
 * @param {Object} slot - Slot info
 * @param {number} responseWindowMinutes - Minutes to wait
 * @param {Object} smsHandler - Optional SMS handler
 */
const scheduleResponseTimeout = (entryId, slot, responseWindowMinutes, smsHandler) => {
  const timeoutMs = responseWindowMinutes * 60 * 1000;

  const timeoutId = setTimeout(async () => {
    try {
      // Check if still in 'notified' status
      const entry = await WaitingList.findByPk(entryId);

      if (entry && entry.status === WAITING_STATUS.NOTIFIED) {
        logger.info(`[WaitingList] ${entry.customerName} didn't respond in time`);

        // Mark as no_response
        entry.status = WAITING_STATUS.NO_RESPONSE;
        await entry.save();

        // Send timeout message
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

        // Notify next person if slot is still in future
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

/**
 * Get waiting list for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} - Waiting list data
 */
const getWaitingList = async (tenantId) => {
  try {
    const entries = await WaitingList.getTodayList(tenantId);

    return {
      success: true,
      entries,
      count: entries.length,
      waiting: entries.filter(e => e.status === WAITING_STATUS.WAITING).length,
      notified: entries.filter(e => e.status === WAITING_STATUS.NOTIFIED).length,
      booked: entries.filter(e => e.status === WAITING_STATUS.BOOKED).length,
    };
  } catch (error) {
    logger.error(`[WaitingList] Error getting waiting list: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get customer's position in queue
 * @param {string} tenantId - Tenant ID
 * @param {string} customerPhone - Customer phone
 * @returns {Promise<Object>} - Position info
 */
const getPosition = async (tenantId, customerPhone) => {
  try {
    const position = await WaitingList.getPosition(tenantId, customerPhone);

    if (position === null) {
      return {
        success: false,
        error: 'Not on waiting list',
        code: 'NOT_ON_LIST',
      };
    }

    return {
      success: true,
      position,
    };
  } catch (error) {
    logger.error(`[WaitingList] Error getting position: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Remove customer from waiting list
 * @param {string} tenantId - Tenant ID
 * @param {string} customerPhone - Customer phone
 * @returns {Promise<Object>} - Result
 */
const removeFromWaitingList = async (tenantId, customerPhone) => {
  try {
    const { Op } = require('sequelize');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deleted = await WaitingList.destroy({
      where: {
        tenantId,
        customerPhone,
        status: WAITING_STATUS.WAITING,
        createdAt: { [Op.gte]: today },
      },
    });

    if (deleted > 0) {
      logger.info(`[WaitingList] Removed ${customerPhone} from waiting list`);
      return { success: true };
    }

    return {
      success: false,
      error: 'Not on waiting list',
      code: 'NOT_ON_LIST',
    };
  } catch (error) {
    logger.error(`[WaitingList] Error removing from list: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Reset/clear old waiting list entries
 * Called daily (e.g., at 6 AM)
 * @param {string} tenantId - Optional tenant filter
 * @returns {Promise<Object>} - Result with count
 */
const resetWaitingList = async (tenantId = null) => {
  try {
    const deleted = await WaitingList.clearOldEntries(tenantId);
    logger.info(`[WaitingList] Reset complete - removed ${deleted} old entries`);

    return {
      success: true,
      deleted,
    };
  } catch (error) {
    logger.error(`[WaitingList] Error resetting list: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Clear all active timeouts (for graceful shutdown)
 */
const clearAllTimeouts = () => {
  for (const [entryId, timeoutId] of activeTimeouts) {
    clearTimeout(timeoutId);
  }
  activeTimeouts.clear();
  logger.info(`[WaitingList] Cleared ${activeTimeouts.size} active timeouts`);
};

module.exports = {
  calculateResponseWindow,
  getServiceDuration,
  addToWaitingList,
  notifyNextInLine,
  handleWaitingListResponse,
  getWaitingList,
  getPosition,
  removeFromWaitingList,
  resetWaitingList,
  clearAllTimeouts,
};
