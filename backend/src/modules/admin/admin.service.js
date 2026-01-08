/**
 * Admin Service
 * Business logic for admin operations
 */
const { Op, fn, col, literal } = require('sequelize');
const { Tenant } = require('../tenants/tenant.model');
const { CallLog } = require('../telephony/callLog.model');
const { Appointment, APPOINTMENT_STATUS } = require('../appointments/appointment.model');
const { Employee } = require('../employees/employee.model');
const { Service } = require('../services/service.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Get metrics for a specific tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Object>} - Tenant metrics
 */
const getMetricsForTenant = async (tenantId) => {
  try {
    logger.info(`Fetching metrics for tenant: ${tenantId}`);

    // Get call metrics using simpler count/sum methods
    let totalCalls = 0;
    let totalCallSeconds = 0;
    try {
      totalCalls = await CallLog.count({ where: { tenantId } });
      totalCallSeconds = await CallLog.sum('duration', { where: { tenantId } }) || 0;
      logger.info(`Call metrics for ${tenantId}: calls=${totalCalls}, seconds=${totalCallSeconds}`);
    } catch (err) {
      logger.error(`Error getting call stats for ${tenantId}: ${err.message}`);
    }

    // Get appointment counts by status
    let totalAppointments = 0;
    let upcomingAppointments = 0;
    let completedAppointments = 0;
    let cancelledAppointments = 0;
    let scheduledAppointments = 0;
    try {
      totalAppointments = await Appointment.count({ where: { tenantId } });
      completedAppointments = await Appointment.count({
        where: { tenantId, status: APPOINTMENT_STATUS.COMPLETED }
      });
      cancelledAppointments = await Appointment.count({
        where: { tenantId, status: APPOINTMENT_STATUS.CANCELLED }
      });
      scheduledAppointments = await Appointment.count({
        where: { tenantId, status: APPOINTMENT_STATUS.SCHEDULED }
      });
      upcomingAppointments = await Appointment.count({
        where: {
          tenantId,
          startTime: { [Op.gt]: new Date() },
          status: { [Op.in]: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED] },
        },
      });
      logger.info(`Appointment metrics for ${tenantId}: total=${totalAppointments}, upcoming=${upcomingAppointments}`);
    } catch (err) {
      logger.error(`Error getting appointment stats for ${tenantId}: ${err.message}`);
    }

    // Get employee count
    let employeeCount = 0;
    try {
      logger.info(`Querying employees for tenant: ${tenantId}`);
      const employees = await Employee.findAll({ where: { tenantId }, attributes: ['id'] });
      employeeCount = employees.length;
      logger.info(`Employee count for ${tenantId}: ${employeeCount} (found ${employees.length} records)`);
    } catch (err) {
      logger.error(`Error getting employee count for ${tenantId}: ${err.message}`, { stack: err.stack });
    }

    // Get service count
    let serviceCount = 0;
    try {
      serviceCount = await Service.count({ where: { tenantId } });
      logger.info(`Service count for ${tenantId}: ${serviceCount}`);
    } catch (err) {
      logger.error(`Error getting service count for ${tenantId}: ${err.message}`);
    }

    // Get tenant details for phone number and trial info
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['twilioPhoneNumber', 'trialEndsAt', 'planType', 'stripeCustomerId'],
    });

    // Calculate trial days remaining
    let trialDaysRemaining = null;
    if (tenant?.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(tenant.trialEndsAt);
      trialDaysRemaining = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
    }

    return {
      calls: {
        total: totalCalls,
        totalMinutes: Math.round(totalCallSeconds / 60), // Convert seconds to minutes
        avgDuration: totalCalls > 0 ? Math.round(totalCallSeconds / totalCalls) : 0, // In seconds
      },
      appointments: {
        total: totalAppointments,
        upcoming: upcomingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        scheduled: scheduledAppointments,
      },
      employees: employeeCount,
      services: serviceCount,
      phoneNumber: tenant?.twilioPhoneNumber || null,
      trialDaysRemaining,
      planType: tenant?.planType,
      stripeCustomerId: tenant?.stripeCustomerId || null,
    };
  } catch (error) {
    logger.error(`Error fetching metrics for tenant ${tenantId}: ${error.message}`, error.stack);
    // Return empty metrics instead of null so UI can still display
    return {
      calls: { total: 0, totalMinutes: 0, avgDuration: 0 },
      appointments: { total: 0, upcoming: 0, completed: 0, cancelled: 0, scheduled: 0 },
      employees: 0,
      services: 0,
      phoneNumber: null,
      trialDaysRemaining: null,
      planType: null,
      stripeCustomerId: null,
    };
  }
};

/**
 * Get all clients (tenants) with their details and metrics
 * @returns {Promise<Array>} - List of all clients with metrics
 */
const getAllClients = async () => {
  try {
    // Fetch all tenants ordered by creation date (newest first)
    const tenants = await Tenant.findAll({
      attributes: ['id', 'name', 'slug', 'status', 'planType', 'contactEmail', 'twilioPhoneNumber', 'trialEndsAt', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });

    logger.info(`Retrieved ${tenants.length} clients for admin view`);
    tenants.forEach(t => logger.info(`Tenant: id=${t.id}, name=${t.name}`));

    // Get metrics for each tenant
    const clientsWithMetrics = await Promise.all(
      tenants.map(async (tenant) => {
        logger.info(`Getting metrics for tenant: ${tenant.id} (${tenant.name})`);
        const metrics = await getMetricsForTenant(tenant.id);

        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          planType: tenant.planType,
          contactEmail: tenant.contactEmail,
          phoneNumber: tenant.twilioPhoneNumber,
          signUpDate: tenant.createdAt,
          lastUpdated: tenant.updatedAt,
          trialEndsAt: tenant.trialEndsAt,
          metrics,
        };
      })
    );

    return clientsWithMetrics;
  } catch (error) {
    logger.error(`Error fetching clients for admin: ${error.message}`);
    throw new AppError('Failed to fetch clients', 500, 'FETCH_CLIENTS_FAILED');
  }
};

/**
 * Get aggregate metrics across all tenants
 * @returns {Promise<Object>} - Aggregate metrics
 */
const getAggregateMetrics = async () => {
  try {
    // Get total call metrics across all tenants
    const callStats = await CallLog.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'totalCalls'],
        [fn('SUM', col('duration')), 'totalSeconds'],
        [fn('AVG', col('duration')), 'avgDuration'],
      ],
      raw: true,
    });

    // Get total appointment metrics across all tenants
    const appointmentStats = await Appointment.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'totalAppointments'],
      ],
      raw: true,
    });

    // Get total employees across all tenants
    const employeeStats = await Employee.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'totalEmployees'],
      ],
      raw: true,
    });

    // Get total services across all tenants
    const serviceStats = await Service.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'totalServices'],
      ],
      raw: true,
    });

    // Get trial statistics
    const now = new Date();
    const activeTrials = await Tenant.findAll({
      where: {
        status: 'active',
        planType: 'free',
        trialEndsAt: { [Op.gt]: now },
      },
      attributes: ['trialEndsAt'],
      raw: true,
    });

    let avgTrialDaysRemaining = 0;
    if (activeTrials.length > 0) {
      const totalDays = activeTrials.reduce((sum, tenant) => {
        const daysRemaining = Math.ceil((new Date(tenant.trialEndsAt) - now) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, daysRemaining);
      }, 0);
      avgTrialDaysRemaining = Math.round(totalDays / activeTrials.length);
    }

    // Get paid clients count
    const paidClients = await Tenant.count({
      where: {
        planType: { [Op.ne]: 'free' },
      },
    });

    return {
      calls: {
        total: parseInt(callStats?.totalCalls || 0, 10),
        totalMinutes: Math.round(parseFloat(callStats?.totalSeconds || 0) / 60),
        avgDuration: Math.round(parseFloat(callStats?.avgDuration || 0)),
      },
      appointments: {
        total: parseInt(appointmentStats?.totalAppointments || 0, 10),
      },
      employees: {
        total: parseInt(employeeStats?.totalEmployees || 0, 10),
      },
      services: {
        total: parseInt(serviceStats?.totalServices || 0, 10),
      },
      trials: {
        active: activeTrials.length,
        avgDaysRemaining: avgTrialDaysRemaining,
      },
      paidClients,
    };
  } catch (error) {
    logger.error(`Error fetching aggregate metrics: ${error.message}`);
    throw new AppError('Failed to fetch aggregate metrics', 500, 'FETCH_METRICS_FAILED');
  }
};

/**
 * Debug function to check tenant ID mappings
 * @returns {Promise<Object>} - Debug info
 */
const getDebugInfo = async () => {
  try {
    // Get all tenant IDs
    const tenants = await Tenant.findAll({
      attributes: ['id', 'name'],
      raw: true,
    });

    // For each tenant, check what IDs exist in related tables
    const debugInfo = await Promise.all(
      tenants.map(async (tenant) => {
        const employeeCount = await Employee.count({ where: { tenantId: tenant.id } });
        const serviceCount = await Service.count({ where: { tenantId: tenant.id } });
        const appointmentCount = await Appointment.count({ where: { tenantId: tenant.id } });
        const callCount = await CallLog.count({ where: { tenantId: tenant.id } });

        // Also get sample IDs from each table to compare
        const sampleEmployee = await Employee.findOne({ attributes: ['id', 'tenantId'], raw: true });
        const sampleService = await Service.findOne({ attributes: ['id', 'tenantId'], raw: true });

        return {
          tenantId: tenant.id,
          tenantName: tenant.name,
          counts: { employeeCount, serviceCount, appointmentCount, callCount },
          sampleEmployee,
          sampleService,
        };
      })
    );

    return debugInfo;
  } catch (error) {
    logger.error(`Debug info error: ${error.message}`);
    return { error: error.message };
  }
};

module.exports = {
  getAllClients,
  getAggregateMetrics,
  getMetricsForTenant,
  getDebugInfo,
};
