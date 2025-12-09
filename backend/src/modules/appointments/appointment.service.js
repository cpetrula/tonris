/**
 * Appointment Service
 * Handles all appointment business logic
 */
const { Op } = require('sequelize');
const { Appointment, APPOINTMENT_STATUS, CANCELLATION_REASONS } = require('./appointment.model');
const { checkSlotAvailability } = require('./availability.service');
const { Employee, EMPLOYEE_STATUS } = require('../employees/employee.model');
const { Service } = require('../services/service.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Calculate total price and duration for an appointment
 * @param {Object} service - Service object
 * @param {Array} addOnIds - Array of add-on IDs
 * @returns {Object} - { totalPrice, totalDuration }
 */
const calculateTotals = (service, addOnIds = []) => {
  let totalPrice = parseFloat(service.price);
  let totalDuration = service.duration;

  if (addOnIds.length > 0 && service.addOns) {
    for (const addOnId of addOnIds) {
      const addOn = service.addOns.find(a => a.id === addOnId);
      if (addOn) {
        totalPrice += parseFloat(addOn.price || 0);
        totalDuration += parseInt(addOn.duration || 0, 10);
      }
    }
  }

  return { totalPrice, totalDuration };
};

/**
 * Calculate end time from start time and duration
 * @param {Date} startTime - Start time as Date object
 * @param {number} durationMinutes - Duration in minutes
 * @returns {Date} - End time as Date object
 */
const calculateEndTime = (startTime, durationMinutes) => {
  const startDateTime = new Date(startTime);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
  return endDateTime;
};

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment creation data
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Created appointment
 */
const createAppointment = async (appointmentData, tenantId) => {
  const {
    employeeId,
    serviceId,
    customerName,
    customerEmail,
    customerPhone,
    startTime,
    addOns = [],
    notes,
  } = appointmentData;

  // Verify employee exists and is active
  const employee = await Employee.findOne({
    where: { id: employeeId, tenantId, status: EMPLOYEE_STATUS.ACTIVE },
  });
  if (!employee) {
    throw new AppError('Employee not found or not active', 404, 'EMPLOYEE_NOT_FOUND');
  }

  // Verify service exists
  const service = await Service.findOne({
    where: { id: serviceId, tenantId },
  });
  if (!service) {
    throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
  }

  // Verify employee can perform this service
  if (!employee.serviceIds || !employee.serviceIds.includes(serviceId)) {
    throw new AppError('Employee is not qualified for this service', 400, 'EMPLOYEE_NOT_QUALIFIED');
  }

  // Calculate totals
  const { totalPrice, totalDuration } = calculateTotals(service, addOns);

  // Calculate end time as Date object
  const startDateTime = new Date(startTime);
  const endDateTime = calculateEndTime(startDateTime, totalDuration);

  // Check for conflicts
  const availability = await checkSlotAvailability(
    employeeId,
    tenantId,
    startDateTime,
    endDateTime
  );

  if (!availability.available) {
    throw new AppError(
      'Time slot is not available. Employee already has an appointment during this time.',
      409,
      'TIME_SLOT_CONFLICT'
    );
  }

  // Create appointment
  const appointment = await Appointment.create({
    tenantId,
    employeeId,
    serviceId,
    customerName,
    customerEmail,
    customerPhone,
    startTime: startDateTime,
    endTime: endDateTime,
    addOns,
    notes,
    totalPrice,
    totalDuration,
    status: APPOINTMENT_STATUS.SCHEDULED,
  });

  logger.info(`New appointment created: ${appointment.id} for tenant: ${tenantId}`);

  return appointment.toSafeObject();
};

/**
 * Get all appointments for a tenant
 * @param {string} tenantId - Tenant identifier
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - List of appointments with pagination
 */
const getAppointments = async (tenantId, options = {}) => {
  const {
    status,
    employeeId,
    startDate,
    endDate,
    customerEmail,
    limit = 100,
    offset = 0,
  } = options;

  const where = { tenantId };

  if (status) {
    where.status = status;
  }

  if (employeeId) {
    where.employeeId = employeeId;
  }

  if (customerEmail) {
    where.customerEmail = customerEmail;
  }

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) {
      where.startTime[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      where.startTime[Op.lte] = new Date(endDate);
    }
  }

  const appointments = await Appointment.findAndCountAll({
    where,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: [['startTime', 'ASC']],
  });

  return {
    appointments: appointments.rows.map(apt => apt.toSafeObject()),
    total: appointments.count,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  };
};

/**
 * Get appointment by ID
 * @param {string} appointmentId - Appointment ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Appointment data
 */
const getAppointmentById = async (appointmentId, tenantId) => {
  const appointment = await Appointment.findOne({
    where: { id: appointmentId, tenantId },
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
  }

  return appointment.toSafeObject();
};

/**
 * Update an appointment (reschedule)
 * @param {string} appointmentId - Appointment ID
 * @param {string} tenantId - Tenant identifier
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated appointment
 */
const updateAppointment = async (appointmentId, tenantId, updateData) => {
  console.log('Update data:', updateData);
  const appointment = await Appointment.findOne({
    where: { id: appointmentId, tenantId },
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
  }

  if (!appointment.canBeModified()) {
    throw new AppError(
      'Appointment cannot be modified in current status',
      400,
      'APPOINTMENT_NOT_MODIFIABLE'
    );
  }

  const {
    employeeId,
    startTime,
    addOns,
    notes,
    status,
    customerName,
    customerEmail,
    customerPhone,
  } = updateData;

  // If rescheduling (changing time or employee), check for conflicts
  if (startTime || employeeId) {
    const newEmployeeId = employeeId || appointment.employeeId;
    
    // Verify new employee if changed
    if (employeeId && employeeId !== appointment.employeeId) {
      const employee = await Employee.findOne({
        where: { id: employeeId, tenantId, status: EMPLOYEE_STATUS.ACTIVE },
      });
      if (!employee) {
        throw new AppError('Employee not found or not active', 404, 'EMPLOYEE_NOT_FOUND');
      }
      
      // Verify employee can perform this service
      if (!employee.serviceIds || !employee.serviceIds.includes(appointment.serviceId)) {
        throw new AppError('Employee is not qualified for this service', 400, 'EMPLOYEE_NOT_QUALIFIED');
      }
    }

    // Get the start time (use existing if not provided)
    const newStartTime = startTime ? new Date(startTime) : appointment.startTime;
    let newDuration = appointment.totalDuration;

    // Recalculate duration if add-ons changed
    if (addOns !== undefined) {
      const service = await Service.findOne({
        where: { id: appointment.serviceId, tenantId },
      });
      const { totalPrice, totalDuration } = calculateTotals(service, addOns);
      newDuration = totalDuration;
      appointment.totalPrice = totalPrice;
      appointment.addOns = addOns;
    }

    // Calculate end time as Date object
    const newEndTime = calculateEndTime(newStartTime, newDuration);
    
    // Check availability
    const availability = await checkSlotAvailability(
      newEmployeeId,
      tenantId,
      newStartTime,
      newEndTime,
      appointmentId // Exclude current appointment from conflict check
    );

    if (!availability.available) {
      throw new AppError(
        'Time slot is not available. Employee already has an appointment during this time.',
        409,
        'TIME_SLOT_CONFLICT'
      );
    }

    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.totalDuration = newDuration;
    
    if (employeeId) {
      appointment.employeeId = employeeId;
    }
  }

  // Update other fields
  if (notes !== undefined) {
    appointment.notes = notes;
  }

  if (status !== undefined) {
    appointment.status = status;
  }

  if (customerName !== undefined) {
    appointment.customerName = customerName;
  }

  if (customerEmail !== undefined) {
    appointment.customerEmail = customerEmail;
  }

  if (customerPhone !== undefined) {
    appointment.customerPhone = customerPhone;
  }

  await appointment.save();

  logger.info(`Appointment updated: ${appointmentId} for tenant: ${tenantId}`);

  return appointment.toSafeObject();
};

/**
 * Cancel an appointment
 * @param {string} appointmentId - Appointment ID
 * @param {string} tenantId - Tenant identifier
 * @param {string} reason - Cancellation reason
 * @param {string} notes - Additional notes
 * @returns {Promise<Object>} - Cancelled appointment
 */
const cancelAppointment = async (appointmentId, tenantId, reason, notes = null) => {
  const appointment = await Appointment.findOne({
    where: { id: appointmentId, tenantId },
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
  }

  if (!appointment.canBeCancelled()) {
    throw new AppError(
      'Appointment cannot be cancelled in current status',
      400,
      'APPOINTMENT_NOT_CANCELLABLE'
    );
  }

  if (!Object.values(CANCELLATION_REASONS).includes(reason)) {
    throw new AppError(
      'Invalid cancellation reason',
      400,
      'INVALID_CANCELLATION_REASON'
    );
  }

  await appointment.cancel(reason, notes);

  logger.info(`Appointment cancelled: ${appointmentId} for tenant: ${tenantId}, reason: ${reason}`);

  return appointment.toSafeObject();
};

/**
 * Delete an appointment (hard delete, use with caution)
 * @param {string} appointmentId - Appointment ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Success message
 */
const deleteAppointment = async (appointmentId, tenantId) => {
  const appointment = await Appointment.findOne({
    where: { id: appointmentId, tenantId },
  });

  if (!appointment) {
    throw new AppError('Appointment not found', 404, 'APPOINTMENT_NOT_FOUND');
  }

  await appointment.destroy();

  logger.info(`Appointment deleted: ${appointmentId} for tenant: ${tenantId}`);

  return { message: 'Appointment deleted successfully' };
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  calculateTotals,
  APPOINTMENT_STATUS,
  CANCELLATION_REASONS,
};
