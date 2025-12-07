/**
 * Appointment Controller
 * Handles HTTP requests for appointment endpoints
 */
const appointmentService = require('./appointment.service');
const availabilityService = require('./availability.service');
const { getTenantUUID } = require('../../utils/tenant');

/**
 * Validation patterns
 */
const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  TIME_REGEX: /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/,
};

/**
 * GET /api/appointments
 * Get all appointments for tenant
 */
const getAppointments = async (req, res, next) => {
  try {
    const { status, employeeId, startDate, endDate, customerEmail, limit, offset } = req.query;
    const tenantUUID = await getTenantUUID(req.tenantId);

    const result = await appointmentService.getAppointments(tenantUUID, {
      status,
      employeeId,
      startDate,
      endDate,
      customerEmail,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/appointments/:id
 * Get appointment by ID
 */
const getAppointment = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const appointment = await appointmentService.getAppointmentById(req.params.id, tenantUUID);

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/appointments
 * Create a new appointment
 */
const createAppointment = async (req, res, next) => {
  try {
    const {
      employeeId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      startTime,
      addOns,
      notes,
    } = req.body;

    // Validate required fields
    if (!employeeId || !serviceId || !customerName || !startTime) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID, service ID, customer name, and start time are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate email format if provided
    if (customerEmail && !VALIDATION.EMAIL_REGEX.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer email format',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate UUID formats
    if (!VALIDATION.UUID_REGEX.test(employeeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID format',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!VALIDATION.UUID_REGEX.test(serviceId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service ID format',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate startTime is a valid datetime
    const startDateTime = new Date(startTime);
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid start time format',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate appointment time is in the future
    if (startDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Appointment time must be in the future',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const appointment = await appointmentService.createAppointment({
      employeeId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      startTime,
      addOns,
      notes,
    }, tenantUUID);

    res.status(201).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/appointments/:id
 * Update appointment (reschedule)
 */
const updateAppointment = async (req, res, next) => {
  try {
    const {
      employeeId,
      startTime,
      addOns,
      notes,
      status,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    // Validate email format if provided
    if (customerEmail && !VALIDATION.EMAIL_REGEX.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer email format',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate UUID format if employee ID provided
    if (employeeId && !VALIDATION.UUID_REGEX.test(employeeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID format',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate startTime if provided
    if (startTime) {
      const startDateTime = new Date(startTime);
      if (isNaN(startDateTime.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid start time format',
          code: 'VALIDATION_ERROR',
        });
      }

      if (startDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Appointment time must be in the future',
          code: 'VALIDATION_ERROR',
        });
      }
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const appointment = await appointmentService.updateAppointment(req.params.id, tenantUUID, {
      employeeId,
      startTime,
      addOns,
      notes,
      status,
      customerName,
      customerEmail,
      customerPhone,
    });

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/appointments/:id
 * Cancel or delete appointment
 */
const deleteAppointment = async (req, res, next) => {
  try {
    const { reason, notes, hardDelete } = req.body;
    const tenantUUID = await getTenantUUID(req.tenantId);

    // If hardDelete is true, permanently delete the appointment
    if (hardDelete === true) {
      const result = await appointmentService.deleteAppointment(req.params.id, tenantUUID);
      return res.status(200).json({
        success: true,
        data: result,
      });
    }

    // Otherwise, cancel the appointment (soft delete)
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Cancellation reason is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      tenantUUID,
      reason,
      notes
    );

    res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/availability
 * Get availability for scheduling
 */
const getAvailability = async (req, res, next) => {
  try {
    const { serviceId, employeeId, date, startDate, endDate } = req.query;

    // Validate required fields
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        error: 'Service ID is required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate UUID format
    if (!VALIDATION.UUID_REGEX.test(serviceId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service ID format',
        code: 'VALIDATION_ERROR',
      });
    }

    if (employeeId && !VALIDATION.UUID_REGEX.test(employeeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid employee ID format',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);

    // If date range is provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format',
          code: 'VALIDATION_ERROR',
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          error: 'Start date must be before end date',
          code: 'VALIDATION_ERROR',
        });
      }

      const availability = await availabilityService.getAvailabilityForDateRange(
        tenantUUID,
        start,
        end,
        serviceId,
        employeeId
      );

      return res.status(200).json({
        success: true,
        data: { availability },
      });
    }

    // Single date query
    const targetDate = date ? new Date(date) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        code: 'VALIDATION_ERROR',
      });
    }

    const employeeIds = employeeId ? [employeeId] : null;
    const availability = await availabilityService.getAvailabilityForDate(
      tenantUUID,
      targetDate,
      serviceId,
      employeeIds
    );

    res.status(200).json({
      success: true,
      data: { availability },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailability,
};
