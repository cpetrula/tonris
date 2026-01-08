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
    // Get call metrics
    const callStats = await CallLog.findOne({
      where: { tenantId },
      attributes: [
        [fn('COUNT', col('id')), 'totalCalls'],
        [fn('SUM', col('duration')), 'totalMinutes'],
        [fn('AVG', col('duration')), 'avgDuration'],
      ],
      raw: true,
    });

    // Get appointment metrics
    const appointmentStats = await Appointment.findAll({
      where: { tenantId },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const appointmentsByStatus = {};
    let totalAppointments = 0;
    appointmentStats.forEach(stat => {
      appointmentsByStatus[stat.status] = parseInt(stat.count, 10);
      totalAppointments += parseInt(stat.count, 10);
    });

    // Get upcoming appointments count
    const upcomingAppointments = await Appointment.count({
      where: {
        tenantId,
        startTime: { [Op.gt]: new Date() },
        status: { [Op.in]: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED] },
      },
    });

    // Get employee count
    const employeeCount = await Employee.count({ where: { tenantId } });

    // Get service count
    const serviceCount = await Service.count({ where: { tenantId } });

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
        total: parseInt(callStats?.totalCalls || 0, 10),
        totalMinutes: Math.round(parseFloat(callStats?.totalMinutes || 0) / 60), // Convert seconds to minutes
        avgDuration: Math.round(parseFloat(callStats?.avgDuration || 0)), // In seconds
      },
      appointments: {
        total: totalAppointments,
        upcoming: upcomingAppointments,
        completed: appointmentsByStatus[APPOINTMENT_STATUS.COMPLETED] || 0,
        cancelled: appointmentsByStatus[APPOINTMENT_STATUS.CANCELLED] || 0,
        scheduled: appointmentsByStatus[APPOINTMENT_STATUS.SCHEDULED] || 0,
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

    // Get metrics for each tenant
    const clientsWithMetrics = await Promise.all(
      tenants.map(async (tenant) => {
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

module.exports = {
  getAllClients,
  getAggregateMetrics,
  getMetricsForTenant,
};
