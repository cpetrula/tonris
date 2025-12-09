/**
 * Tenant Service
 * Handles all tenant business logic
 */
const { Tenant, TENANT_STATUS, PLAN_TYPES } = require('./tenant.model');
const { User } = require('../../models');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');
const { Appointment, APPOINTMENT_STATUS } = require('../appointments/appointment.model');
const { Employee, EMPLOYEE_STATUS } = require('../employees/employee.model');
const { Service } = require('../services/service.model');
const { CallLog, CALL_STATUS } = require('../telephony/callLog.model');
const { Op } = require('sequelize');

/**
 * Create a new tenant
 * @param {Object} tenantData - Tenant creation data
 * @param {string} tenantData.name - Business name
 * @param {string} tenantData.slug - URL-friendly slug
 * @param {string} tenantData.contactEmail - Contact email
 * @param {string} tenantData.contactPhone - Contact phone (optional)
 * @param {string} tenantData.planType - Plan type (optional)
 * @param {string} tenantData.businessTypeId - Business type ID (optional)
 * @returns {Promise<Object>} - Created tenant
 */
const createTenant = async (tenantData) => {
  const { name, slug, contactEmail, contactPhone, planType, businessTypeId } = tenantData;

  // Check if tenant with same slug exists
  const existingTenant = await Tenant.findOne({ where: { slug } });
  if (existingTenant) {
    throw new AppError('A tenant with this slug already exists', 400, 'TENANT_EXISTS');
  }

  // Create tenant with default settings
  const tenant = await Tenant.create({
    name,
    slug,
    contactEmail,
    contactPhone,
    planType: planType || PLAN_TYPES.FREE,
    settings: Tenant.generateDefaultSettings(),
    status: TENANT_STATUS.PENDING,
    businessTypeId: businessTypeId || null,
  });

  logger.info(`New tenant created: ${name} (${slug})`);

  return tenant.toSafeObject();
};

/**
 * Get tenant by ID (UUID)
 * @param {string} id - Tenant UUID
 * @returns {Promise<Object>} - Tenant data
 */
const getTenantById = async (id) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return tenant.toSafeObject();
};

/** 
 * Get tenant by twilio_phone_number
 * @param {string} phoneNumber - Twilio phone number
 * @returns {Promise<Object>} - Tenant data
 **/
const getTenantByPhoneNumber = async (phoneNumber) => {
  const tenant = await Tenant.findOne({ where: { twilioPhoneNumber: phoneNumber } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return tenant.toSafeObject();
}

/**
 * Get tenant settings
 * @param {string} id - Tenant UUID
 * @returns {Promise<Object>} - Tenant settings
 */
const getTenantSettings = async (id) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return {
    id: tenant.id,
    name: tenant.name,
    settings: tenant.settings,
    planType: tenant.planType,
    status: tenant.status,
  };
};

/**
 * Update tenant settings
 * @param {string} id - Tenant UUID
 * @param {Object} settings - New settings to merge
 * @returns {Promise<Object>} - Updated tenant settings
 */
const updateTenantSettings = async (id, settings) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  // Validate settings structure if needed
  if (settings && typeof settings !== 'object') {
    throw new AppError('Settings must be an object', 400, 'INVALID_SETTINGS');
  }

  await tenant.updateSettings(settings);

  logger.info(`Tenant settings updated: ${id}`);

  return {
    id: tenant.id,
    name: tenant.name,
    settings: tenant.settings,
    planType: tenant.planType,
    status: tenant.status,
  };
};

/**
 * Update tenant status
 * @param {string} id - Tenant UUID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} - Updated tenant
 */
const updateTenantStatus = async (id, newStatus) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  // Validate status
  if (!Object.values(TENANT_STATUS).includes(newStatus)) {
    throw new AppError(`Invalid status: ${newStatus}`, 400, 'INVALID_STATUS');
  }

  // Check if transition is valid
  if (!Tenant.isValidTransition(tenant.status, newStatus)) {
    throw new AppError(
      `Invalid status transition from ${tenant.status} to ${newStatus}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  const previousStatus = tenant.status;
  await tenant.transitionTo(newStatus);

  logger.info(`Tenant status changed: ${id} from ${previousStatus} to ${newStatus}`);

  return tenant.toSafeObject();
};

/**
 * Activate tenant (complete onboarding)
 * @param {string} id - Tenant UUID
 * @returns {Promise<Object>} - Updated tenant
 */
const activateTenant = async (id) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  if (tenant.status !== TENANT_STATUS.PENDING) {
    throw new AppError(
      `Cannot activate tenant with status ${tenant.status}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  await tenant.transitionTo(TENANT_STATUS.ACTIVE);
  tenant.onboardingCompletedAt = new Date();
  await tenant.save();

  logger.info(`Tenant activated: ${id}`);

  return tenant.toSafeObject();
};

/**
 * Get current user and tenant context
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant UUID
 * @returns {Promise<Object>} - User and tenant data
 */
const getCurrentUserAndTenant = async (userId, tenantId) => {
  // Get user data
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Get tenant data
  const tenant = await Tenant.findOne({ where: { id: tenantId } });
  
  // Tenant should exist
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  return {
    user: user.toSafeObject(),
    tenant: tenant.toSafeObject(),
  };
};

/**
 * Check if tenant exists
 * @param {string} id - Tenant UUID
 * @returns {Promise<boolean>} - True if tenant exists
 */
const tenantExists = async (id) => {
  const tenant = await Tenant.findOne({ where: { id } });
  return !!tenant;
};

/**
 * Update tenant information
 * @param {string} id - Tenant UUID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated tenant
 */
const updateTenant = async (id, updateData) => {
  const tenant = await Tenant.findOne({ where: { id } });
  
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  // Filter out fields that shouldn't be directly updated
  const allowedFields = ['name', 'contactEmail', 'contactPhone', 'address', 'metadata', 'twilioPhoneNumber'];
  const filteredData = {};
  
  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
    }
  }

  await tenant.update(filteredData);

  logger.info(`Tenant updated: ${id}`);

  return tenant.toSafeObject();
};

/**
 * Get dashboard statistics for tenant
 * @param {string} tenantId - Tenant UUID
 * @returns {Promise<Object>} - Dashboard statistics
 */
const getDashboardStats = async (tenantId) => {
  // Get tenant to verify it exists
  const tenant = await Tenant.findOne({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }

  // Get today's date range (start of day to end of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get today's appointments count
  const todayAppointmentsCount = await Appointment.count({
    where: {
      tenantId,
      startTime: {
        [Op.gte]: today,
        [Op.lt]: tomorrow,
      },
      status: {
        [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
      },
    },
  });

  // Get pending calls count (ringing or in-progress)
  const pendingCallsCount = await CallLog.count({
    where: {
      tenantId,
      status: {
        [Op.in]: [CALL_STATUS.RINGING, CALL_STATUS.IN_PROGRESS],
      },
    },
  });

  // Get active employees count
  const activeEmployeesCount = await Employee.count({
    where: {
      tenantId,
      status: EMPLOYEE_STATUS.ACTIVE,
    },
  });

  // Get services offered count
  const servicesCount = await Service.count({
    where: {
      tenantId,
      status: 'active',
    },
  });

  // Get today's appointments list with details
  const todayAppointments = await Appointment.findAll({
    where: {
      tenantId,
      startTime: {
        [Op.gte]: today,
        [Op.lt]: tomorrow,
      },
      status: {
        [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW],
      },
    },
    order: [['startTime', 'ASC']],
    limit: 10,
  });

  // Get employee and service details for appointments
  const employeeIds = [...new Set(todayAppointments.map(apt => apt.employeeId))];
  const serviceIds = [...new Set(todayAppointments.map(apt => apt.serviceId))];

  const employees = employeeIds.length > 0 ? await Employee.findAll({
    where: { id: { [Op.in]: employeeIds } },
    attributes: ['id', 'firstName', 'lastName'],
  }) : [];

  const services = serviceIds.length > 0 ? await Service.findAll({
    where: { id: { [Op.in]: serviceIds } },
    attributes: ['id', 'name'],
  }) : [];

  // Create lookup maps
  const employeeMap = new Map(employees.map(e => [e.id, e]));
  const serviceMap = new Map(services.map(s => [s.id, s]));

  // Get recent activity (last 10 completed appointments and recent calls)
  const recentAppointments = await Appointment.findAll({
    where: {
      tenantId,
      status: APPOINTMENT_STATUS.COMPLETED,
    },
    order: [['updatedAt', 'DESC']],
    limit: 5,
  });

  // Get service details for recent appointments
  const recentServiceIds = [...new Set(recentAppointments.map(apt => apt.serviceId))];
  const recentServices = recentServiceIds.length > 0 ? await Service.findAll({
    where: { id: { [Op.in]: recentServiceIds } },
    attributes: ['id', 'name'],
  }) : [];
  const recentServiceMap = new Map(recentServices.map(s => [s.id, s]));

  const recentCalls = await CallLog.findAll({
    where: {
      tenantId,
      status: {
        [Op.in]: [CALL_STATUS.COMPLETED, CALL_STATUS.NO_ANSWER],
      },
    },
    order: [['createdAt', 'DESC']],
    limit: 5,
  });

  // Combine and format recent activity
  const recentActivity = [];

  // Add completed appointments
  recentAppointments.forEach((apt) => {
    const service = recentServiceMap.get(apt.serviceId);
    recentActivity.push({
      type: 'appointment_completed',
      action: 'Appointment completed',
      item: `${apt.customerName} - ${service?.name || 'Service'}`,
      timestamp: apt.updatedAt,
    });
  });

  // Add recent calls
  recentCalls.forEach((call) => {
    const action = call.status === CALL_STATUS.COMPLETED ? 'Call answered' : 'Missed call';
    recentActivity.push({
      type: 'call',
      action,
      item: `From ${call.fromNumber}`,
      timestamp: call.createdAt,
    });
  });

  // Sort by timestamp and take top 10
  recentActivity.sort((a, b) => b.timestamp - a.timestamp);
  const limitedActivity = recentActivity.slice(0, 10);

  // Format the response
  return {
    stats: {
      todayAppointments: todayAppointmentsCount,
      pendingCalls: pendingCallsCount,
      activeEmployees: activeEmployeesCount,
      servicesOffered: servicesCount,
    },
    todayAppointments: todayAppointments.map((apt) => {
      const employee = employeeMap.get(apt.employeeId);
      const service = serviceMap.get(apt.serviceId);
      return {
        id: apt.id,
        customerName: apt.customerName,
        service: service?.name || 'Unknown Service',
        time: apt.startTime,
        employee: employee
          ? `${employee.firstName} ${employee.lastName}`
          : 'Unknown Employee',
      };
    }),
    recentActivity: limitedActivity,
  };
};

module.exports = {
  createTenant,
  getTenantById,
  getTenantByPhoneNumber,
  getTenantSettings,
  updateTenantSettings,
  updateTenantStatus,
  activateTenant,
  getCurrentUserAndTenant,
  tenantExists,
  updateTenant,
  getDashboardStats,
  TENANT_STATUS,
  PLAN_TYPES,
};
