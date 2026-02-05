/**
 * Usage Service
 * Handles usage tracking, reporting to Stripe, and usage alerts
 */
const { UsageRecord, USAGE_TYPE } = require('./usageRecord.model');
const { Subscription, PLAN_CONFIG, PLAN_TIER } = require('./subscription.model');
const stripeService = require('./stripe.service');
const logger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Record call minutes usage for a tenant
 * @param {Object} params - Usage parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {number} params.durationSeconds - Call duration in seconds
 * @param {string} params.callLogId - Reference to the call log
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} - Usage record and subscription update result
 */
const recordCallUsage = async ({ tenantId, durationSeconds, callLogId, metadata = {} }) => {
  // Convert seconds to minutes (round up to nearest minute for billing)
  const minutes = Math.ceil(durationSeconds / 60);
  
  if (minutes <= 0) {
    logger.debug(`Skipping usage recording for zero-minute call: ${callLogId}`);
    return null;
  }
  
  // Get subscription
  const subscription = await Subscription.findOne({ where: { tenantId } });
  
  if (!subscription) {
    logger.warn(`No subscription found for tenant: ${tenantId}`);
    return null;
  }
  
  // Check if subscription has unlimited minutes (legacy plan)
  if (subscription.hasUnlimitedMinutes()) {
    logger.debug(`Tenant ${tenantId} has unlimited minutes, recording but not billing`);
  }
  
  // Determine period bounds
  const periodStart = subscription.currentPeriodStart || new Date();
  const periodEnd = subscription.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // Calculate if this usage includes overage
  const includedMinutes = subscription.includedMinutes || subscription.getPlanConfig().includedMinutes;
  const currentUsed = subscription.currentPeriodMinutesUsed || 0;
  const newTotal = currentUsed + minutes;
  
  let isOverage = false;
  let overageMinutes = 0;
  
  if (includedMinutes > 0) { // Not unlimited
    if (currentUsed >= includedMinutes) {
      // All new usage is overage
      isOverage = true;
      overageMinutes = minutes;
    } else if (newTotal > includedMinutes) {
      // Part of usage is overage
      isOverage = true;
      overageMinutes = newTotal - includedMinutes;
    }
  }
  
  // Create usage record
  const usageRecord = await UsageRecord.create({
    tenantId,
    subscriptionId: subscription.id,
    callLogId,
    usageType: USAGE_TYPE.CALL_MINUTES,
    quantity: minutes,
    periodStart,
    periodEnd,
    isOverage,
    metadata: {
      ...metadata,
      durationSeconds,
      previousTotal: currentUsed,
      newTotal,
      overageMinutes,
    },
  });
  
  // Update subscription usage counter
  subscription.currentPeriodMinutesUsed = newTotal;
  await subscription.save();
  
  logger.info(`Recorded ${minutes} minutes usage for tenant ${tenantId} (total: ${newTotal})`);
  
  // Report overage to Stripe if applicable
  if (isOverage && overageMinutes > 0 && subscription.stripeSubscriptionId) {
    try {
      await reportOverageToStripe(subscription, overageMinutes, usageRecord);
    } catch (error) {
      logger.error(`Failed to report overage to Stripe: ${error.message}`);
      // Don't fail the whole operation if Stripe reporting fails
    }
  }
  
  // Check and send usage alerts
  await checkAndSendUsageAlerts(subscription);
  
  return {
    usageRecord: usageRecord.toJSON(),
    currentUsage: {
      totalMinutes: newTotal,
      includedMinutes,
      remainingMinutes: subscription.getRemainingMinutes(),
      usagePercentage: subscription.getUsagePercentage(),
      overageMinutes: subscription.getOverageMinutes(),
    },
  };
};

/**
 * Report overage minutes to Stripe for metered billing
 * @param {Subscription} subscription - Subscription model instance
 * @param {number} overageMinutes - Number of overage minutes to report
 * @param {UsageRecord} usageRecord - Usage record for reference
 * @returns {Promise<Object>} - Stripe usage record
 */
const reportOverageToStripe = async (subscription, overageMinutes, usageRecord) => {
  if (!subscription.stripeSubscriptionId) {
    logger.warn(`No Stripe subscription ID for tenant ${subscription.tenantId}`);
    return null;
  }
  
  try {
    const stripeUsageRecord = await stripeService.reportUsage({
      subscriptionId: subscription.stripeSubscriptionId,
      quantity: overageMinutes,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    });
    
    // Update usage record with Stripe reference
    usageRecord.stripeUsageRecordId = stripeUsageRecord.id;
    usageRecord.reportedToStripeAt = new Date();
    await usageRecord.save();
    
    logger.info(`Reported ${overageMinutes} overage minutes to Stripe for tenant ${subscription.tenantId}`);
    
    return stripeUsageRecord;
  } catch (error) {
    logger.error(`Failed to report usage to Stripe: ${error.message}`);
    throw error;
  }
};

/**
 * Check usage levels and send alerts if thresholds are crossed
 * @param {Subscription} subscription - Subscription model instance
 * @returns {Promise<void>}
 */
const checkAndSendUsageAlerts = async (subscription) => {
  // Skip for unlimited plans
  if (subscription.hasUnlimitedMinutes()) {
    return;
  }
  
  const usagePercentage = subscription.getUsagePercentage();
  const tenantId = subscription.tenantId;
  
  // Check 80% threshold
  if (usagePercentage >= 80 && !subscription.usageAlertSent80) {
    await sendUsageAlert(subscription, 80);
    subscription.usageAlertSent80 = true;
    await subscription.save();
    logger.info(`Sent 80% usage alert for tenant ${tenantId}`);
  }
  
  // Check 100% threshold
  if (usagePercentage >= 100 && !subscription.usageAlertSent100) {
    await sendUsageAlert(subscription, 100);
    subscription.usageAlertSent100 = true;
    await subscription.save();
    logger.info(`Sent 100% usage alert for tenant ${tenantId}`);
  }
};

/**
 * Send usage alert notification to tenant
 * @param {Subscription} subscription - Subscription model instance
 * @param {number} threshold - Usage threshold (80 or 100)
 * @returns {Promise<void>}
 */
const sendUsageAlert = async (subscription, threshold) => {
  const { Tenant } = require('../tenants/tenant.model');
  
  const tenant = await Tenant.findOne({ where: { id: subscription.tenantId } });
  
  if (!tenant || !tenant.contactEmail) {
    logger.warn(`No contact email for tenant ${subscription.tenantId}, skipping usage alert`);
    return;
  }
  
  const planConfig = subscription.getPlanConfig();
  const includedMinutes = subscription.includedMinutes || planConfig.includedMinutes;
  const usedMinutes = subscription.currentPeriodMinutesUsed;
  const overageRate = (planConfig.overageRate / 100).toFixed(2);
  
  // Import notification service
  try {
    const { emailService } = require('../notifications');
    
    if (threshold === 80) {
      await emailService.sendEmail({
        to: tenant.contactEmail,
        subject: `CRITON.AI: You've used 80% of your included minutes`,
        html: `
          <h2>Usage Alert: 80% of Included Minutes Used</h2>
          <p>Hi ${tenant.name},</p>
          <p>You've used <strong>${usedMinutes}</strong> of your <strong>${includedMinutes}</strong> included minutes this billing period.</p>
          <p>Once you exceed your included minutes, overage charges of <strong>$${overageRate}/minute</strong> will apply.</p>
          <p>Consider upgrading your plan to get more included minutes at a lower overage rate.</p>
          <p><a href="${process.env.FRONTEND_URL || 'https://app.criton.ai'}/app/billing">View Usage & Upgrade</a></p>
          <p>Best,<br>The CRITON.AI Team</p>
        `,
      });
    } else if (threshold === 100) {
      await emailService.sendEmail({
        to: tenant.contactEmail,
        subject: `CRITON.AI: You've used all your included minutes`,
        html: `
          <h2>Usage Alert: Included Minutes Exceeded</h2>
          <p>Hi ${tenant.name},</p>
          <p>You've used all <strong>${includedMinutes}</strong> included minutes for this billing period.</p>
          <p>Additional usage will be charged at <strong>$${overageRate}/minute</strong>.</p>
          <p>To reduce overage charges, consider upgrading to a plan with more included minutes.</p>
          <p><a href="${process.env.FRONTEND_URL || 'https://app.criton.ai'}/app/billing">View Usage & Upgrade</a></p>
          <p>Best,<br>The CRITON.AI Team</p>
        `,
      });
    }
  } catch (error) {
    logger.error(`Failed to send usage alert email: ${error.message}`);
    // Don't throw - alert email failure shouldn't break the flow
  }
};

/**
 * Get current usage for a tenant
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Current usage data
 */
const getCurrentUsage = async (tenantId) => {
  const subscription = await Subscription.findOne({ where: { tenantId } });
  
  if (!subscription) {
    throw new AppError('No subscription found', 404, 'SUBSCRIPTION_NOT_FOUND');
  }
  
  const planConfig = subscription.getPlanConfig();
  const includedMinutes = subscription.includedMinutes || planConfig.includedMinutes;
  
  return {
    planTier: subscription.planTier,
    planName: planConfig.name,
    billingInterval: subscription.billingInterval,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    includedMinutes: includedMinutes === -1 ? 'Unlimited' : includedMinutes,
    minutesUsed: subscription.currentPeriodMinutesUsed,
    remainingMinutes: subscription.getRemainingMinutes(),
    usagePercentage: subscription.getUsagePercentage(),
    overageMinutes: subscription.getOverageMinutes(),
    overageRate: planConfig.overageRate / 100, // Convert cents to dollars
    estimatedOverageCharge: (subscription.getOverageMinutes() * planConfig.overageRate) / 100,
    hasUnlimitedMinutes: subscription.hasUnlimitedMinutes(),
  };
};

/**
 * Get usage history for a tenant
 * @param {string} tenantId - Tenant identifier
 * @param {number} periods - Number of periods to fetch
 * @returns {Promise<Array>} - Usage history
 */
const getUsageHistory = async (tenantId, periods = 6) => {
  return await UsageRecord.getUsageHistory(tenantId, periods);
};

/**
 * Reset usage counters for a new billing period
 * Called when a subscription's billing period changes
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<void>}
 */
const resetPeriodUsage = async (tenantId) => {
  const subscription = await Subscription.findOne({ where: { tenantId } });
  
  if (!subscription) {
    return;
  }
  
  subscription.currentPeriodMinutesUsed = 0;
  subscription.usageAlertSent80 = false;
  subscription.usageAlertSent100 = false;
  await subscription.save();
  
  logger.info(`Reset period usage for tenant ${tenantId}`);
};

module.exports = {
  recordCallUsage,
  reportOverageToStripe,
  checkAndSendUsageAlerts,
  sendUsageAlert,
  getCurrentUsage,
  getUsageHistory,
  resetPeriodUsage,
};
