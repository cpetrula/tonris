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
      appointmentDate,
      startTime,
      addOns,
      notes,
    } = req.body;

    // Validate required fields (customerEmail is now optional)
    if (!employeeId || !serviceId || !customerName || !appointmentDate || !startTime) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID, service ID, customer name, appointment date, and start time are required',
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

    // Validate appointment date and time are in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (isNaN(appointmentDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid appointment date format',
        code: 'VALIDATION_ERROR',
      });
    }

    // Combine date and time to check if in future
    const [hours, minutes] = startTime.split(':').map(Number);
    const fullDateTime = new Date(appointmentDateTime);
    fullDateTime.setHours(hours, minutes, 0, 0);

    if (fullDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Appointment date and time must be in the future',
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
      appointmentDate,
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
      appointmentDate,
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

    // Validate appointment date and time if provided
    if (appointmentDate && startTime) {
      const appointmentDateTime = new Date(appointmentDate);
      if (isNaN(appointmentDateTime.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid appointment date format',
          code: 'VALIDATION_ERROR',
        });
      }

      const [hours, minutes] = startTime.split(':').map(Number);
      const fullDateTime = new Date(appointmentDateTime);
      fullDateTime.setHours(hours, minutes, 0, 0);

      if (fullDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Appointment date and time must be in the future',
          code: 'VALIDATION_ERROR',
        });
      }
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const appointment = await appointmentService.updateAppointment(req.params.id, tenantUUID, {
      employeeId,
      appointmentDate,
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
