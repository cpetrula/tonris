/**
 * Waiting List Controller
 * HTTP request handlers for waiting list operations
 */
const logger = require('../../utils/logger');
const waitingListService = require('./waitingList.service');
const { WAITING_TYPE } = require('./waitingList.model');

/**
 * GET /api/waiting-list
 * Get waiting list entries for the tenant
 * Query params: ?type=slot_backfill|enrollment&program=Infant
 */
const getWaitingList = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const { type, program } = req.query;

    if (type === WAITING_TYPE.ENROLLMENT && program) {
      const result = await waitingListService.getEnrollmentWaitlist(tenantId, program);
      return res.json({ success: true, data: result });
    }

    const result = await waitingListService.getWaitingList(tenantId, type || null);
    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/waiting-list
 * Add entry to waiting list
 */
const addToWaitingList = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const result = await waitingListService.addToWaitingList({
      tenantId,
      ...req.body,
    });

    if (!result.success) {
      return res.status(result.code === 'ALREADY_ON_LIST' ? 409 : 400).json(result);
    }

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/waiting-list/position
 * Get customer's position in queue
 * Query params: ?phone=+1234567890&type=slot_backfill|enrollment
 */
const getPosition = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const { phone, type } = req.query;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const result = await waitingListService.getPosition(tenantId, phone, type || WAITING_TYPE.SLOT_BACKFILL);
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/waiting-list
 * Remove customer from waiting list
 * Query params: ?phone=+1234567890&type=slot_backfill|enrollment
 */
const removeFromWaitingList = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const { phone, type } = req.query;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const result = await waitingListService.removeFromWaitingList(tenantId, phone, type || WAITING_TYPE.SLOT_BACKFILL);
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/waiting-list/notify-opening
 * Notify next person about a slot/enrollment opening
 * Body: { programName } for enrollment, { startTime, durationMinutes, serviceName } for slot_backfill
 */
const notifyOpening = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const { type, programName, startTime, durationMinutes, serviceName } = req.body;

    let result;
    if (type === WAITING_TYPE.ENROLLMENT) {
      if (!programName) {
        return res.status(400).json({ success: false, error: 'programName is required for enrollment notifications' });
      }
      result = await waitingListService.notifyEnrollmentOpening(tenantId, programName);
    } else {
      if (!startTime || !durationMinutes) {
        return res.status(400).json({ success: false, error: 'startTime and durationMinutes are required for slot notifications' });
      }
      result = await waitingListService.notifyNextInLine({
        tenantId,
        startTime: new Date(startTime),
        durationMinutes,
        serviceName,
      });
    }

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/waiting-list/respond
 * Handle customer response (YES/NO)
 * Body: { phone, response: 'yes'|'no', type }
 */
const handleResponse = async (req, res, next) => {
  try {
    const { phone, response, type } = req.body;

    if (!phone || !response) {
      return res.status(400).json({ success: false, error: 'phone and response are required' });
    }

    const normalizedResponse = response.toLowerCase().trim();
    if (!['yes', 'no'].includes(normalizedResponse)) {
      return res.status(400).json({ success: false, error: 'Response must be yes or no' });
    }

    let result;
    if (type === WAITING_TYPE.ENROLLMENT) {
      result = await waitingListService.handleEnrollmentResponse(phone, normalizedResponse);
    } else {
      result = await waitingListService.handleWaitingListResponse(phone, normalizedResponse);
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWaitingList,
  addToWaitingList,
  getPosition,
  removeFromWaitingList,
  notifyOpening,
  handleResponse,
};
