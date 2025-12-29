/**
 * Admin Service
 * Business logic for admin operations
 */
const { Tenant } = require('../tenants/tenant.model');
const { CallLog } = require('../telephony/callLog.model');
const { Appointment } = require('../appointments/appointment.model');
const { AppError } = require('../../middleware/errorHandler');
const { sequelize } = require('../../config/db');
const { Op } = require('sequelize');
const logger = require('../../utils/logger');

/**
 * Get the start of the current month
 * @returns {Date}
 */
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Get usage metrics for a specific tenant
 * @param {string} tenantId - Tenant UUID
 * @returns {Promise<Object>} - Usage metrics
 */
const getUsageMetrics = async (tenantId) => {
  const startOfMonth = getStartOfMonth();

  // Get call metrics
  const [callMetrics] = await sequelize.query(`
    SELECT
      COUNT(*) as total_calls,
      COALESCE(SUM(duration), 0) as total_seconds,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
      COUNT(CASE WHEN status = 'no-answer' THEN 1 END) as missed_calls
    FROM call_logs
    WHERE tenant_id = :tenantId
    AND created_at >= :startOfMonth
  `, {
    replacements: { tenantId, startOfMonth },
    type: sequelize.QueryTypes.SELECT,
  });

  // Get appointment metrics
  const [appointmentMetrics] = await sequelize.query(`
    SELECT
      COUNT(*) as total_appointments,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
      COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_appointments,
      COUNT(CASE WHEN status IN ('scheduled', 'confirmed') THEN 1 END) as upcoming_appointments
    FROM appointments
    WHERE tenant_id = :tenantId
    AND created_at >= :startOfMonth
  `, {
    replacements: { tenantId, startOfMonth },
    type: sequelize.QueryTypes.SELECT,
  });

  return {
    calls: {
      total: parseInt(callMetrics?.total_calls || 0, 10),
      totalMinutes: Math.round((parseInt(callMetrics?.total_seconds || 0, 10)) / 60),
      completed: parseInt(callMetrics?.completed_calls || 0, 10),
      missed: parseInt(callMetrics?.missed_calls || 0, 10),
    },
    appointments: {
      total: parseInt(appointmentMetrics?.total_appointments || 0, 10),
      completed: parseInt(appointmentMetrics?.completed_appointments || 0, 10),
      cancelled: parseInt(appointmentMetrics?.cancelled_appointments || 0, 10),
      noShow: parseInt(appointmentMetrics?.no_show_appointments || 0, 10),
      upcoming: parseInt(appointmentMetrics?.upcoming_appointments || 0, 10),
    },
  };
};

/**
 * Get all clients (tenants) with their details and usage metrics
 * @returns {Promise<Array>} - List of all clients with usage
 */
const getAllClients = async () => {
  try {
    // Fetch all tenants ordered by creation date (newest first)
    const tenants = await Tenant.findAll({
      attributes: ['id', 'name', 'slug', 'status', 'planType', 'contactEmail', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
    });

    logger.info(`Retrieved ${tenants.length} clients for admin view`);

    // Fetch usage metrics for all tenants in parallel
    const clientsWithUsage = await Promise.all(
      tenants.map(async (tenant) => {
        const usage = await getUsageMetrics(tenant.id);
        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          planType: tenant.planType,
          contactEmail: tenant.contactEmail,
          signUpDate: tenant.createdAt,
          lastUpdated: tenant.updatedAt,
          usage,
        };
      })
    );

    return clientsWithUsage;
  } catch (error) {
    logger.error(`Error fetching clients for admin: ${error.message}`);
    throw new AppError('Failed to fetch clients', 500, 'FETCH_CLIENTS_FAILED');
  }
};

/**
 * Get detailed usage for a specific client
 * @param {string} tenantId - Tenant UUID
 * @returns {Promise<Object>} - Detailed usage data
 */
const getClientUsageDetails = async (tenantId) => {
  try {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
    }

    const startOfMonth = getStartOfMonth();
    const now = new Date();

    // Get current month metrics
    const currentMonthUsage = await getUsageMetrics(tenantId);

    // Get last 6 months trend data
    const monthlyTrend = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [callData] = await sequelize.query(`
        SELECT
          COUNT(*) as total_calls,
          COALESCE(SUM(duration), 0) as total_seconds
        FROM call_logs
        WHERE tenant_id = :tenantId
        AND created_at >= :monthStart
        AND created_at <= :monthEnd
      `, {
        replacements: { tenantId, monthStart, monthEnd },
        type: sequelize.QueryTypes.SELECT,
      });

      const [appointmentData] = await sequelize.query(`
        SELECT COUNT(*) as total_appointments
        FROM appointments
        WHERE tenant_id = :tenantId
        AND created_at >= :monthStart
        AND created_at <= :monthEnd
      `, {
        replacements: { tenantId, monthStart, monthEnd },
        type: sequelize.QueryTypes.SELECT,
      });

      monthlyTrend.unshift({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        calls: parseInt(callData?.total_calls || 0, 10),
        minutes: Math.round((parseInt(callData?.total_seconds || 0, 10)) / 60),
        appointments: parseInt(appointmentData?.total_appointments || 0, 10),
      });
    }

    // Get recent calls (last 10)
    const recentCalls = await CallLog.findAll({
      where: { tenantId },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'direction', 'status', 'fromNumber', 'toNumber', 'duration', 'createdAt'],
    });

    // Get recent appointments (last 10)
    const recentAppointments = await Appointment.findAll({
      where: { tenantId },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'customerName', 'status', 'startTime', 'totalPrice', 'createdAt'],
    });

    return {
      client: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        planType: tenant.planType,
        contactEmail: tenant.contactEmail,
      },
      currentMonth: currentMonthUsage,
      monthlyTrend,
      recentCalls: recentCalls.map(call => ({
        id: call.id,
        direction: call.direction,
        status: call.status,
        from: call.fromNumber,
        to: call.toNumber,
        duration: call.duration,
        date: call.createdAt,
      })),
      recentAppointments: recentAppointments.map(apt => ({
        id: apt.id,
        customerName: apt.customerName,
        status: apt.status,
        startTime: apt.startTime,
        totalPrice: apt.totalPrice,
        date: apt.createdAt,
      })),
    };
  } catch (error) {
    logger.error(`Error fetching client usage details: ${error.message}`);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch client usage', 500, 'FETCH_USAGE_FAILED');
  }
};

module.exports = {
  getAllClients,
  getClientUsageDetails,
};
