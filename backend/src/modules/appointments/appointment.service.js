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
 * Parse a date/time string in the context of a specific timezone
 * ALWAYS interprets the time value as being in the specified timezone,
 * even if the string has a Z suffix (because ElevenLabs AI often incorrectly
 * appends Z when it means local time).
 * @param {string} dateTimeStr - Date/time string to parse
 * @param {string} timezone - Timezone to interpret the time in (e.g., 'America/Los_Angeles')
 * @returns {Date} - Date object in UTC
 */
const parseDateTimeInTimezone = (dateTimeStr, timezone = 'America/Los_Angeles') => {
  if (!dateTimeStr) return null;

  // Strip timezone indicators (Z, +00:00, etc.) because ElevenLabs AI
  // incorrectly adds Z when it means local time (e.g., "16:00Z" when it means 4pm PST)
  const strippedDateTimeStr = dateTimeStr.replace(/[Zz]$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/, '');

  // Try to parse the stripped date string to extract components
  const parsed = new Date(strippedDateTimeStr);
  if (isNaN(parsed.getTime())) {
    // If standard parsing fails, return null
    logger.warn(`Failed to parse date string: ${dateTimeStr}`);
    return null;
  }

  // Get the date/time components as they were intended (local interpretation)
  // We need to treat the parsed date as if it's in the target timezone
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const day = parsed.getDate();
  const hours = parsed.getHours();
  const minutes = parsed.getMinutes();
  const seconds = parsed.getSeconds();

  // Create a date string in ISO format and append the timezone
  // Then use Intl to figure out the offset for that timezone at that specific date/time
  const tempDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

  // Get the timezone offset for the target timezone at this date/time
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Calculate offset by comparing UTC time to local time in target timezone
  const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
  const tzParts = formatter.formatToParts(utcDate);
  const tzValues = {};
  tzParts.forEach(part => { tzValues[part.type] = part.value; });

  const tzDate = new Date(Date.UTC(
    parseInt(tzValues.year),
    parseInt(tzValues.month) - 1,
    parseInt(tzValues.day),
    parseInt(tzValues.hour),
    parseInt(tzValues.minute),
    parseInt(tzValues.second)
  ));

  // The offset is the difference between what we want (the local time) and UTC
  const offsetMs = utcDate.getTime() - tzDate.getTime();

  // Apply the offset to convert from "local timezone time" to UTC
  const resultDate = new Date(utcDate.getTime() + offsetMs);

  logger.info(`parseDateTimeInTimezone: "${dateTimeStr}" in ${timezone} => ${resultDate.toISOString()}`);

  return resultDate;
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

  // Get tenant timezone for proper date parsing
  const tenant = await Tenant.findByPk(tenantId);
  const tenantTimezone = tenant?.settings?.timezone || 'America/Los_Angeles';
  console.log(`CDP-Tenant timezone for tenant ${tenantId}: ${tenantTimezone}`);

  // Calculate end time as Date object
  // Parse in tenant's timezone to avoid UTC offset issues
  const startDateTime = parseDateTimeInTimezone(startTime, tenantTimezone);
  const endDateTime = calculateEndTime(startDateTime, totalDuration);

  // Validate business is open on the requested day
  const businessHours = tenant?.settings?.businessHours || tenant?.businessHours;
  //log business hours for debugging
  console.log(`CDP-Business hours for tenant ${tenantId}: ${JSON.stringify(businessHours)}`);
  if (businessHours) {
    // Get the day of week in tenant's timezone
    const dayOfWeekInTz = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: tenantTimezone,
    }).format(startDateTime).toLowerCase();
    //log day of week for debugging
    console.log(`CDP-Appointment start time day of week in ${tenantTimezone}: ${dayOfWeekInTz}`);

    console.log('CDP-typeof businessHours:', typeof businessHours);
    console.log(`CDP-Business hours for that day: ${JSON.stringify(businessHours["businessHours"][dayOfWeekInTz])}`);

    const dayHours = businessHours["businessHours"][dayOfWeekInTz];
    console.log('CDP-dayHours:', dayHours);
    console.log('CDP-typeof dayHours:', typeof dayHours);
    //log day hours for debugging
    console.log(`CDP-Business hours for ${dayOfWeekInTz}: ${JSON.stringify(dayHours)}`);

    // Check if business is closed on this day
    if (!dayHours || dayHours.enabled === false) {
      const dayName = dayOfWeekInTz.charAt(0).toUpperCase() + dayOfWeekInTz.slice(1);
      throw new AppError(
        `Cannot book appointment: Business is closed on ${dayName}`,
        400,
        'BUSINESS_CLOSED'
      );
    }
  }

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

  // Use tenant and tenantTimezone already fetched above for SMS formatting

  // Send SMS confirmation to customer asynchronously (don't wait for it to complete)
  smsService.sendAppointmentConfirmationSms(appointment, employee, service, tenantId, tenantTimezone)
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
    customerPhone,
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

  if (customerPhone) {
    // Normalize phone number for comparison (remove non-digits except leading +)
    const normalizedPhone = customerPhone.replace(/[^\d+]/g, '');
    where.customerPhone = {
      [Op.or]: [
        customerPhone,
        normalizedPhone,
        // Also match if stored without country code
        normalizedPhone.replace(/^\+1/, ''),
      ]
    };
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

    // Get tenant timezone for proper date parsing
    const tenant = await Tenant.findByPk(tenantId);
    const tenantTimezone = tenant?.settings?.timezone || 'America/Los_Angeles';

    // Get the start time (use existing if not provided)
    // Parse in tenant's timezone to avoid UTC offset issues
    const newStartTime = startTime ? parseDateTimeInTimezone(startTime, tenantTimezone) : appointment.startTime;
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

    // Validate business is open on the requested day (only if time is changing)
    if (startTime) {
      const businessHours = tenant?.settings?.businessHours || tenant?.businessHours;
      if (businessHours) {
        const dayOfWeekInTz = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          timeZone: tenantTimezone,
        }).format(newStartTime).toLowerCase();

        // Handle nested businessHours.businessHours structure
        const dayHours = businessHours["businessHours"]?.[dayOfWeekInTz] || businessHours[dayOfWeekInTz];

        if (!dayHours || dayHours.enabled === false) {
          const dayName = dayOfWeekInTz.charAt(0).toUpperCase() + dayOfWeekInTz.slice(1);
          throw new AppError(
            `Cannot reschedule appointment: Business is closed on ${dayName}`,
            400,
            'BUSINESS_CLOSED'
          );
        }
      }
    }

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

    // Get tenant timezone for SMS formatting
    let tenantSettings = tenant.settings;
    if (typeof tenantSettings === 'string') {
      try {
        tenantSettings = JSON.parse(tenantSettings);
      } catch (e) {
        tenantSettings = {};
      }
    }
    const tenantTimezone = tenantSettings?.timezone || 'America/Los_Angeles';

    // Send SMS to each recipient using SMS service function for employees
    for (const toPhone of phoneRecipients) {
      await smsService.sendNewAppointmentSmsNotificationToPhone(
        appointment,
        employee,
        service,
        tenant.name,
        toPhone,
        tenantTimezone
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

    // Get tenant timezone for SMS formatting
    let tenantSettings = tenant.settings;
    if (typeof tenantSettings === 'string') {
      try {
        tenantSettings = JSON.parse(tenantSettings);
      } catch (e) {
        tenantSettings = {};
      }
    }
    const tenantTimezone = tenantSettings?.timezone || 'America/Los_Angeles';

    // Send SMS to each recipient
    for (const toPhone of phoneRecipients) {
      await smsService.sendCancellationSmsNotificationToPhone(
        appointment,
        service,
        tenant.name,
        reason,
        toPhone,
        tenantTimezone
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
  APPOINTMENT_STATUS,
  CANCELLATION_REASONS,
};
