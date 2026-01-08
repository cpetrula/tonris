/**
 * Appointment Service
 * Handles all appointment business logic
 */
const { Op } = require('sequelize');
const { Appointment, APPOINTMENT_STATUS, CANCELLATION_REASONS } = require('./appointment.model');
const { checkSlotAvailability } = require('./availability.service');
const { Employee, EMPLOYEE_STATUS } = require('../employees/employee.model');
const { Service } = require('../services/service.model');
const { Tenant } = require('../tenants/tenant.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const smsService = require('./sms.service');
const { emailService } = require('../notifications');
const employeeService = require('../employees/employee.service');

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
    logger.warn(`Appointment slot unavailable: ${availability.reason}`, {
      employeeId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      conflicts: availability.conflicts,
    });
    throw new AppError(
      `Time slot is not available. ${availability.reason}`,
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

  // Send SMS confirmation to customer asynchronously (don't wait for it to complete)
  smsService.sendAppointmentConfirmationSms(appointment, employee, service, tenantId)
    .catch(error => {
      logger.error(`Failed to send SMS for appointment ${appointment.id}: ${error.message}`);
    });

  // Send email notification to business owner asynchronously
  sendNewAppointmentEmailNotification(appointment, employee, service, tenantId)
    .catch(error => {
      logger.error(`Failed to send email for appointment ${appointment.id}: ${error.message}`);
    });

  // Send SMS notification to business owner asynchronously
  sendNewAppointmentSmsNotification(appointment, employee, service, tenantId)
    .catch(error => {
      logger.error(`Failed to send SMS notification for appointment ${appointment.id}: ${error.message}`);
    });

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
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: Service,
        as: 'service',
        attributes: ['id', 'name', 'duration', 'price']
      }
    ],
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
      logger.warn(`Reschedule slot unavailable: ${availability.reason}`, {
        employeeId: newEmployeeId,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        conflicts: availability.conflicts,
      });
      throw new AppError(
        `Time slot is not available. ${availability.reason}`,
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

  // Track if this is a cancellation
  const isCancellation = status === APPOINTMENT_STATUS.CANCELLED && appointment.status !== APPOINTMENT_STATUS.CANCELLED;

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

  // Send cancellation notifications if status was changed to cancelled
  if (isCancellation) {
    sendCancellationNotifications(appointment, tenantId, 'Status changed to cancelled')
      .catch(error => {
        logger.error(`Failed to send cancellation notifications for appointment ${appointmentId}: ${error.message}`);
      });
  }

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

  // Send cancellation email notification asynchronously
  sendCancellationEmailNotification(appointment, tenantId, reason)
    .catch(error => {
      logger.error(`Failed to send cancellation email for appointment ${appointmentId}: ${error.message}`);
    });

  // Send cancellation SMS notification asynchronously
  sendCancellationSmsNotification(appointment, tenantId, reason)
    .catch(error => {
      logger.error(`Failed to send cancellation SMS for appointment ${appointmentId}: ${error.message}`);
    });

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

/**
 * Send email notification to business owner for new appointment
 * @param {Object} appointment - Appointment object
 * @param {Object} employee - Employee object
 * @param {Object} service - Service object
 * @param {string} tenantId - Tenant ID
 */
const sendNewAppointmentEmailNotification = async (appointment, employee, service, tenantId) => {
  try {
    // Fetch tenant with notification settings
    const tenant = await Tenant.findOne({ where: { id: tenantId } });
    if (!tenant) {
      logger.warn(`Cannot send email notification: Tenant ${tenantId} not found`);
      return;
    }

    // Check if email notification is enabled at tenant level
    let notificationSettings = tenant.notificationSettings;
    if (typeof notificationSettings === 'string') {
      try {
        notificationSettings = JSON.parse(notificationSettings);
      } catch (e) {
        notificationSettings = {};
      }
    }

    // Default to true if not set
    const emailNewAppointment = notificationSettings?.emailNewAppointment !== false;

    if (!emailNewAppointment) {
      logger.debug(`Email notification for new appointments is disabled for tenant ${tenantId}`);
      return;
    }

    // Get employees with email notifications enabled for new appointments
    const recipients = await employeeService.getNotificationRecipients(
      tenantId,
      appointment.locationId || null,
      'new_appointment'
    );

    // Collect all email recipients
    const emailRecipients = [...recipients.emails];

    // Fallback to tenant contact email if no employees have notifications enabled
    if (emailRecipients.length === 0 && tenant.contactEmail) {
      emailRecipients.push(tenant.contactEmail);
      logger.debug(`No employees with email notifications - falling back to tenant contact: ${tenant.contactEmail}`);
    }

    if (emailRecipients.length === 0) {
      logger.warn(`No email recipients for new appointment notification for tenant ${tenantId}`);
      return;
    }

    // Format date and time for email (use tenant timezone, default to PST)
    const timezone = 'America/Los_Angeles';
    const appointmentDate = new Date(appointment.startTime);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone };
    const formattedDate = appointmentDate.toLocaleDateString('en-US', dateOptions);
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', timeOptions);

    // Send email to each recipient
    for (const toEmail of emailRecipients) {
      const result = await emailService.sendNewAppointmentEmail(toEmail, {
        businessName: tenant.name,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        serviceName: service.name,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        duration: appointment.totalDuration,
      });

      if (result.success) {
        logger.info(`New appointment email sent to ${toEmail} for appointment ${appointment.id}`);
      } else {
        logger.warn(`Email notification not sent to ${toEmail} for appointment ${appointment.id}: ${result.reason || result.error}`);
      }
    }
  } catch (error) {
    logger.error(`Error sending new appointment email for tenant ${tenantId}: ${error.message}`);
  }
};

/**
 * Send email notification to business owner for appointment cancellation
 * @param {Object} appointment - Appointment object
 * @param {string} tenantId - Tenant ID
 * @param {string} reason - Cancellation reason
 */
const sendCancellationEmailNotification = async (appointment, tenantId, reason) => {
  try {
    // Fetch tenant with notification settings
    const tenant = await Tenant.findOne({ where: { id: tenantId } });
    if (!tenant) {
      logger.warn(`Cannot send cancellation email: Tenant ${tenantId} not found`);
      return;
    }

    // Check if email notification is enabled at tenant level
    let notificationSettings = tenant.notificationSettings;
    if (typeof notificationSettings === 'string') {
      try {
        notificationSettings = JSON.parse(notificationSettings);
      } catch (e) {
        notificationSettings = {};
      }
    }

    // Default to true if not set
    const emailCancellation = notificationSettings?.emailCancellation !== false;

    if (!emailCancellation) {
      logger.debug(`Email notification for cancellations is disabled for tenant ${tenantId}`);
      return;
    }

    // Get employees with email notifications enabled for cancellations
    const recipients = await employeeService.getNotificationRecipients(
      tenantId,
      appointment.locationId || null,
      'cancellation'
    );

    // Collect all email recipients
    const emailRecipients = [...recipients.emails];

    // Fallback to tenant contact email if no employees have notifications enabled
    if (emailRecipients.length === 0 && tenant.contactEmail) {
      emailRecipients.push(tenant.contactEmail);
      logger.debug(`No employees with email notifications - falling back to tenant contact: ${tenant.contactEmail}`);
    }

    if (emailRecipients.length === 0) {
      logger.warn(`No email recipients for cancellation notification for tenant ${tenantId}`);
      return;
    }

    // Get service name
    const service = await Service.findOne({ where: { id: appointment.serviceId } });
    const serviceName = service?.name || 'Unknown Service';

    // Format date and time for email (use tenant timezone, default to PST)
    const timezone = 'America/Los_Angeles';
    const appointmentDate = new Date(appointment.startTime);
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone };
    const formattedDate = appointmentDate.toLocaleDateString('en-US', dateOptions);
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', timeOptions);

    // Send email to each recipient
    for (const toEmail of emailRecipients) {
      const result = await emailService.sendCancellationEmail(toEmail, {
        businessName: tenant.name,
        customerName: appointment.customerName,
        serviceName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        cancellationReason: reason,
      });

      if (result.success) {
        logger.info(`Cancellation email sent to ${toEmail} for appointment ${appointment.id}`);
      } else {
        logger.warn(`Cancellation email not sent to ${toEmail} for appointment ${appointment.id}: ${result.reason || result.error}`);
      }
    }
  } catch (error) {
    logger.error(`Error sending cancellation email for tenant ${tenantId}: ${error.message}`);
  }
};

/**
 * Send SMS notification to business owner for new appointment
 * @param {Object} appointment - Appointment object
 * @param {Object} employee - Employee object
 * @param {Object} service - Service object
 * @param {string} tenantId - Tenant ID
 */
const sendNewAppointmentSmsNotification = async (appointment, employee, service, tenantId) => {
  try {
    // Fetch tenant with notification settings
    const tenant = await Tenant.findOne({ where: { id: tenantId } });
    if (!tenant) {
      logger.warn(`Cannot send SMS notification: Tenant ${tenantId} not found`);
      return;
    }

    // Check if SMS notification is enabled at tenant level
    let notificationSettings = tenant.notificationSettings;
    if (typeof notificationSettings === 'string') {
      try {
        notificationSettings = JSON.parse(notificationSettings);
      } catch (e) {
        notificationSettings = {};
      }
    }

    const smsNewAppointment = notificationSettings?.smsNewAppointment !== false;
    if (!smsNewAppointment) {
      logger.debug(`SMS notification for new appointments is disabled for tenant ${tenantId}`);
      return;
    }

    // Get employees with SMS notifications enabled for new appointments
    const recipients = await employeeService.getNotificationRecipients(
      tenantId,
      appointment.locationId || null,
      'new_appointment'
    );

    // Collect all phone recipients
    const phoneRecipients = [...recipients.phones];

    // Fallback to tenant contact phone if no employees have notifications enabled
    if (phoneRecipients.length === 0 && tenant.contactPhone) {
      phoneRecipients.push(tenant.contactPhone);
      logger.debug(`No employees with SMS notifications - falling back to tenant contact: ${tenant.contactPhone}`);
    }

    if (phoneRecipients.length === 0) {
      logger.warn(`No SMS recipients for new appointment notification for tenant ${tenantId}`);
      return;
    }

    // Send SMS to each recipient using SMS service function for employees
    for (const toPhone of phoneRecipients) {
      await smsService.sendNewAppointmentSmsNotificationToPhone(
        appointment,
        employee,
        service,
        tenant.name,
        toPhone
      );
    }
  } catch (error) {
    logger.error(`Error sending new appointment SMS for tenant ${tenantId}: ${error.message}`);
  }
};

/**
 * Send SMS notification to business owner for appointment cancellation
 * @param {Object} appointment - Appointment object
 * @param {string} tenantId - Tenant ID
 * @param {string} reason - Cancellation reason
 */
const sendCancellationSmsNotification = async (appointment, tenantId, reason) => {
  try {
    // Fetch tenant with notification settings
    const tenant = await Tenant.findOne({ where: { id: tenantId } });
    if (!tenant) {
      logger.warn(`Cannot send cancellation SMS: Tenant ${tenantId} not found`);
      return;
    }

    // Check if SMS notification is enabled at tenant level
    let notificationSettings = tenant.notificationSettings;
    if (typeof notificationSettings === 'string') {
      try {
        notificationSettings = JSON.parse(notificationSettings);
      } catch (e) {
        notificationSettings = {};
      }
    }

    const smsCancellation = notificationSettings?.smsCancellation !== false;
    if (!smsCancellation) {
      logger.debug(`SMS notification for cancellations is disabled for tenant ${tenantId}`);
      return;
    }

    // Get employees with SMS notifications enabled for cancellations
    const recipients = await employeeService.getNotificationRecipients(
      tenantId,
      appointment.locationId || null,
      'cancellation'
    );

    // Collect all phone recipients
    const phoneRecipients = [...recipients.phones];

    // Fallback to tenant contact phone if no employees have notifications enabled
    if (phoneRecipients.length === 0 && tenant.contactPhone) {
      phoneRecipients.push(tenant.contactPhone);
      logger.debug(`No employees with SMS notifications - falling back to tenant contact: ${tenant.contactPhone}`);
    }

    if (phoneRecipients.length === 0) {
      logger.warn(`No SMS recipients for cancellation notification for tenant ${tenantId}`);
      return;
    }

    // Get service name
    const service = await Service.findOne({ where: { id: appointment.serviceId } });

    // Send SMS to each recipient
    for (const toPhone of phoneRecipients) {
      await smsService.sendCancellationSmsNotificationToPhone(
        appointment,
        service,
        tenant.name,
        reason,
        toPhone
      );
    }
  } catch (error) {
    logger.error(`Error sending cancellation SMS for tenant ${tenantId}: ${error.message}`);
  }
};

/**
 * Send all cancellation notifications (email + SMS)
 * @param {Object} appointment - Appointment object
 * @param {string} tenantId - Tenant ID
 * @param {string} reason - Cancellation reason
 */
const sendCancellationNotifications = async (appointment, tenantId, reason) => {
  // Send email notification
  sendCancellationEmailNotification(appointment, tenantId, reason)
    .catch(error => {
      logger.error(`Failed to send cancellation email for appointment ${appointment.id}: ${error.message}`);
    });

  // Send SMS notification
  sendCancellationSmsNotification(appointment, tenantId, reason)
    .catch(error => {
      logger.error(`Failed to send cancellation SMS for appointment ${appointment.id}: ${error.message}`);
    });
};

/**
 * Get timezone offset in milliseconds for a given timezone
 * @param {string} timezone - IANA timezone string (e.g., 'America/Los_Angeles')
 * @param {Date} date - Date to calculate offset for (accounts for DST)
 * @returns {number} - Offset in milliseconds (positive = behind UTC)
 */
const getTimezoneOffsetMs = (timezone, date) => {
  // Get the time in the target timezone
  const tzTime = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  // Get the time in UTC
  const utcTime = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  // Return the difference (positive means timezone is behind UTC)
  return utcTime.getTime() - tzTime.getTime();
};

/**
 * Get today's appointments for a customer by phone number
 * Used for caller identification in voice AI
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} tenantId - Tenant ID
 * @param {string} timezone - Business timezone (default: America/Los_Angeles)
 * @returns {Promise<Array>} - Today's appointments with employee and service info
 */
const getTodayAppointmentsByPhone = async (phoneNumber, tenantId, timezone = 'America/Los_Angeles') => {
  if (!phoneNumber || !tenantId) {
    return [];
  }

  // Normalize phone number (remove formatting, keep digits and +)
  const normalized = phoneNumber.replace(/[^0-9+]/g, '');

  // Get today's date range in the business timezone
  // This ensures appointments at 4pm PST are found when searching for "today" in PST
  const now = new Date();

  // Get today's date string in the target timezone (e.g., "2026-01-08")
  const todayInTz = now.toLocaleDateString('en-CA', { timeZone: timezone }); // en-CA gives YYYY-MM-DD format

  // Create start and end of day in the target timezone, then convert to UTC for query
  // Parse the date parts and construct Date objects
  const [year, month, day] = todayInTz.split('-').map(Number);

  // Start of day in target timezone (e.g., midnight PST = 8am UTC)
  const startOfDayLocal = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  // Adjust for timezone offset - PST is UTC-8, so midnight PST = 8am UTC
  const tzOffsetMs = getTimezoneOffsetMs(timezone, startOfDayLocal);
  const startOfDay = new Date(startOfDayLocal.getTime() + tzOffsetMs);

  // End of day (23:59:59.999) in target timezone
  const endOfDayLocal = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  const endOfDay = new Date(endOfDayLocal.getTime() + tzOffsetMs);

  // Query all of today's scheduled/confirmed appointments
  const appointments = await Appointment.findAll({
    where: {
      tenantId,
      startTime: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay,
      },
      status: {
        [Op.in]: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED],
      },
    },
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName'] },
      { model: Service, as: 'service', attributes: ['id', 'name', 'duration'] },
    ],
    order: [['startTime', 'ASC']],
  });

  // Filter by phone number with flexible matching
  return appointments.filter(apt => {
    if (!apt.customerPhone) return false;
    const aptNormalized = apt.customerPhone.replace(/[^0-9+]/g, '');
    // Match exact or last 10 digits (handles +1 country code differences)
    return aptNormalized === normalized ||
           (aptNormalized.slice(-10) === normalized.slice(-10) && normalized.slice(-10).length === 10);
  });
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  calculateTotals,
  sendNewAppointmentEmailNotification,
  sendCancellationEmailNotification,
  getTodayAppointmentsByPhone,
  APPOINTMENT_STATUS,
  CANCELLATION_REASONS,
};
