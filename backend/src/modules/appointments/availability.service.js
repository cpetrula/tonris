/**
 * Availability Service
 * Handles availability calculation for employees based on schedules and existing appointments
 */
const { Op } = require('sequelize');
const { Appointment, APPOINTMENT_STATUS } = require('./appointment.model');
const { Employee, EMPLOYEE_STATUS } = require('../employees/employee.model');
const { Service } = require('../services/service.model');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Get day of week name from date
 * @param {Date} date - Date object
 * @returns {string} - Day name (lowercase)
 */
const getDayOfWeek = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

/**
 * Parse time string (HH:MM) to minutes from midnight
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {number} - Minutes from midnight
 */
const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two time ranges overlap
 * @param {Date} start1 - Start of first range
 * @param {Date} end1 - End of first range
 * @param {Date} start2 - Start of second range
 * @param {Date} end2 - End of second range
 * @returns {boolean} - True if ranges overlap
 */
const doTimesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

/**
 * Get existing appointments for an employee on a specific date
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant ID
 * @param {Date} date - Date to check
 * @returns {Promise<Array>} - List of appointments
 */
const getEmployeeAppointmentsForDate = async (employeeId, tenantId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.findAll({
    where: {
      tenantId,
      employeeId,
      startTime: { [Op.gte]: startOfDay },
      endTime: { [Op.lte]: endOfDay },
      status: {
        [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
      },
    },
    order: [['startTime', 'ASC']],
  });

  return appointments;
};

/**
 * Check if a specific time slot is available for an employee
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant ID
 * @param {Date} startTime - Proposed start time
 * @param {Date} endTime - Proposed end time
 * @param {string} excludeAppointmentId - Optional appointment ID to exclude (for rescheduling)
 * @returns {Promise<Object>} - Availability result { available, conflicts }
 */
const checkSlotAvailability = async (employeeId, tenantId, startTime, endTime, excludeAppointmentId = null) => {
  const whereClause = {
    tenantId,
    employeeId,
    status: {
      [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
    },
    [Op.or]: [
      // Overlapping appointments
      {
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime },
      },
    ],
  };

  // Exclude the current appointment when checking for rescheduling
  if (excludeAppointmentId) {
    whereClause.id = { [Op.ne]: excludeAppointmentId };
  }

  const conflictingAppointments = await Appointment.findAll({
    where: whereClause,
  });

  return {
    available: conflictingAppointments.length === 0,
    conflicts: conflictingAppointments.map(apt => apt.toSafeObject()),
  };
};

/**
 * Get employee working hours for a specific date
 * @param {Object} employee - Employee object
 * @param {Date} date - Date to check
 * @returns {Object|null} - Working hours { start, end } or null if not working
 */
const getEmployeeWorkingHours = (employee, date) => {
  if (!employee.schedule) {
    return null;
  }

  const dayOfWeek = getDayOfWeek(date);
  const schedule = employee.schedule[dayOfWeek];

  if (!schedule || !schedule.enabled) {
    return null;
  }

  return {
    start: schedule.start,
    end: schedule.end,
  };
};

/**
 * Generate available time slots for an employee on a specific date
 * @param {string} employeeId - Employee ID
 * @param {string} tenantId - Tenant ID
 * @param {Date} date - Date to check
 * @param {number} duration - Required duration in minutes
 * @param {number} slotInterval - Slot interval in minutes (default: 15)
 * @returns {Promise<Array>} - List of available time slots
 */
const getAvailableSlots = async (employeeId, tenantId, date, duration, slotInterval = 15) => {
  // Get employee
  const employee = await Employee.findOne({
    where: { id: employeeId, tenantId, status: EMPLOYEE_STATUS.ACTIVE },
  });

  if (!employee) {
    throw new AppError('Employee not found or not active', 404, 'EMPLOYEE_NOT_FOUND');
  }

  // Check if employee works on this day
  const workingHours = getEmployeeWorkingHours(employee, date);
  if (!workingHours) {
    return []; // Employee doesn't work on this day
  }

  // Get existing appointments for this date
  const existingAppointments = await getEmployeeAppointmentsForDate(employeeId, tenantId, date);

  // Generate potential slots
  const slots = [];
  const workStart = parseTimeToMinutes(workingHours.start);
  const workEnd = parseTimeToMinutes(workingHours.end);

  // Check if date is today and adjust start time if needed
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  let currentSlotStart = workStart;

  if (isToday) {
    // Add a 15-minute buffer to prevent booking slots that may be in the past by submission time
    const bufferMinutes = 15;
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + bufferMinutes;
    // Round up to next slot interval
    currentSlotStart = Math.max(workStart, Math.ceil(currentMinutes / slotInterval) * slotInterval);
  }

  while (currentSlotStart + duration <= workEnd) {
    const slotStartDate = new Date(date);
    slotStartDate.setHours(Math.floor(currentSlotStart / 60), currentSlotStart % 60, 0, 0);
    
    const slotEndDate = new Date(date);
    slotEndDate.setHours(Math.floor((currentSlotStart + duration) / 60), (currentSlotStart + duration) % 60, 0, 0);

    // Check for conflicts with existing appointments
    const hasConflict = existingAppointments.some(apt => 
      doTimesOverlap(slotStartDate, slotEndDate, new Date(apt.startTime), new Date(apt.endTime))
    );

    if (!hasConflict) {
      slots.push({
        startTime: slotStartDate.toISOString(),
        endTime: slotEndDate.toISOString(),
        startTimeFormatted: `${String(Math.floor(currentSlotStart / 60)).padStart(2, '0')}:${String(currentSlotStart % 60).padStart(2, '0')}`,
        endTimeFormatted: `${String(Math.floor((currentSlotStart + duration) / 60)).padStart(2, '0')}:${String((currentSlotStart + duration) % 60).padStart(2, '0')}`,
      });
    }

    currentSlotStart += slotInterval;
  }

  return slots;
};

/**
 * Get availability for multiple employees on a specific date
 * @param {string} tenantId - Tenant ID
 * @param {Date} date - Date to check
 * @param {string} serviceId - Service ID (to get duration)
 * @param {Array<string>} employeeIds - Optional list of employee IDs to filter
 * @returns {Promise<Array>} - List of employee availability
 */
const getAvailabilityForDate = async (tenantId, date, serviceId, employeeIds = null) => {
  // Get service to determine duration
  const service = await Service.findOne({
    where: { id: serviceId, tenantId },
  });

  if (!service) {
    throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND');
  }

  // Get employees who can perform this service
  const employeeWhere = {
    tenantId,
    status: EMPLOYEE_STATUS.ACTIVE,
  };

  if (employeeIds && employeeIds.length > 0) {
    employeeWhere.id = { [Op.in]: employeeIds };
  }

  const employees = await Employee.findAll({ where: employeeWhere });

  // Filter employees who can perform this service
  const qualifiedEmployees = employees.filter(emp => 
    emp.serviceIds && emp.serviceIds.includes(serviceId)
  );

  // Get availability for each employee
  const availabilityResults = await Promise.all(
    qualifiedEmployees.map(async (employee) => {
      const slots = await getAvailableSlots(
        employee.id,
        tenantId,
        date,
        service.duration
      );

      return {
        employeeId: employee.id,
        employeeName: employee.getFullName(),
        date: date.toISOString().split('T')[0],
        serviceDuration: service.duration,
        availableSlots: slots,
        isAvailable: slots.length > 0,
      };
    })
  );

  return availabilityResults;
};

/**
 * Get availability for a date range
 * @param {string} tenantId - Tenant ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} serviceId - Service ID
 * @param {string} employeeId - Optional employee ID
 * @returns {Promise<Object>} - Availability by date
 */
const getAvailabilityForDateRange = async (tenantId, startDate, endDate, serviceId, employeeId = null) => {
  const results = {};
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const employeeIds = employeeId ? [employeeId] : null;
    
    const availability = await getAvailabilityForDate(
      tenantId,
      new Date(currentDate),
      serviceId,
      employeeIds
    );

    results[dateKey] = availability;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return results;
};

module.exports = {
  checkSlotAvailability,
  getAvailableSlots,
  getAvailabilityForDate,
  getAvailabilityForDateRange,
  getEmployeeWorkingHours,
  getDayOfWeek,
  parseTimeToMinutes,
  doTimesOverlap,
};
