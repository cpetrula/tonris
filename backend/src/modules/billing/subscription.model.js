/**
 * Subscription Model
 * Defines the Subscription schema for Stripe billing integration
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const logger = require('../../utils/logger');

/**
 * Valid subscription statuses (aligned with Stripe subscription statuses)
 */
const SUBSCRIPTION_STATUS = {
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  UNPAID: 'unpaid',
  PAUSED: 'paused',
  INACTIVE: 'inactive',
};

/**
 * Billing intervals
 */
const BILLING_INTERVAL = {
  MONTH: 'month',
  YEAR: 'year',
};

/**
 * Plan tiers
 */
const PLAN_TIER = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  BUSINESS: 'business',
  LEGACY: 'legacy', // For existing $295 unlimited customers
};

/**
 * Plan configuration - new hybrid pricing model
 */
const PLAN_CONFIG = {
  TRIAL_DAYS: 15, // 15-day free trial
  TRIAL_MINUTES: 100, // Minutes included in trial
  
  // Plan details (prices in cents)
  [PLAN_TIER.STARTER]: {
    name: 'Starter',
    monthlyPrice: 7900, // $79.00
    annualPrice: 80400, // $804.00/year ($67/mo)
    includedMinutes: 200,
    overageRate: 15, // $0.15/min in cents
    parallelCalls: 2,
  },
  [PLAN_TIER.PROFESSIONAL]: {
    name: 'Professional',
    monthlyPrice: 14900, // $149.00
    annualPrice: 152400, // $1,524.00/year ($127/mo)
    includedMinutes: 500,
    overageRate: 12, // $0.12/min in cents
    parallelCalls: 5,
  },
  [PLAN_TIER.BUSINESS]: {
    name: 'Business',
    monthlyPrice: 29900, // $299.00
    annualPrice: 304800, // $3,048.00/year ($254/mo)
    includedMinutes: 1500,
    overageRate: 10, // $0.10/min in cents
    parallelCalls: -1, // Unlimited
  },
  [PLAN_TIER.LEGACY]: {
    name: 'Legacy Unlimited',
    monthlyPrice: 29500, // $295.00 (old price)
    annualPrice: 354000, // $3,540.00/year
    includedMinutes: -1, // Unlimited
    overageRate: 0,
    parallelCalls: -1, // Unlimited
  },
  
  // Backward compatibility
  MONTHLY_PRICE: 14900, // Default to Professional plan
};

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id',
    },
  },
  stripeCustomerId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_customer_id',
  },
  stripeSubscriptionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    field: 'stripe_subscription_id',
  },
  stripePriceId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_price_id',
  },
  stripeMeteredPriceId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'stripe_metered_price_id',
    comment: 'Stripe price ID for overage minutes metered billing',
  },
  status: {
    type: DataTypes.ENUM(...Object.values(SUBSCRIPTION_STATUS)),
    defaultValue: SUBSCRIPTION_STATUS.INCOMPLETE,
    allowNull: false,
  },
  planTier: {
    type: DataTypes.ENUM(...Object.values(PLAN_TIER)),
    defaultValue: PLAN_TIER.PROFESSIONAL,
    allowNull: false,
    field: 'plan_tier',
    comment: 'Current subscription plan tier',
  },
  billingInterval: {
    type: DataTypes.ENUM(...Object.values(BILLING_INTERVAL)),
    allowNull: true,
    field: 'billing_interval',
  },
  includedMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'included_minutes',
    comment: 'Number of minutes included in the plan per billing period (-1 for unlimited)',
  },
  currentPeriodMinutesUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'current_period_minutes_used',
    comment: 'Minutes used in current billing period',
  },
  currentPeriodStart: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'current_period_start',
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'current_period_end',
  },
  cancelAtPeriodEnd: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'cancel_at_period_end',
  },
  canceledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'canceled_at',
  },
  trialStart: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'trial_start',
  },
  trialEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'trial_end',
  },
  usageAlertSent80: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'usage_alert_sent_80',
    comment: 'Whether 80% usage alert has been sent this period',
  },
  usageAlertSent100: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'usage_alert_sent_100',
    comment: 'Whether 100% usage alert has been sent this period',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'subscriptions',
  timestamps: true,
  indexes: [
    {
      fields: ['stripe_customer_id'],
    },
    {
      fields: ['stripe_subscription_id'],
      unique: true,
    },
    {
      fields: ['status'],
    },
    {
      fields: ['plan_tier'],
    },
  ],
});

/**
 * Check if subscription is in an active state
 * @returns {boolean} - True if subscription allows access
 */
Subscription.prototype.isActive = function() {
  return [
    SUBSCRIPTION_STATUS.ACTIVE,
    SUBSCRIPTION_STATUS.TRIALING,
  ].includes(this.status);
};

/**
 * Check if subscription is inactive (trial expired, no payment)
 * @returns {boolean} - True if subscription is inactive
 */
Subscription.prototype.isInactive = function() {
  return this.status === SUBSCRIPTION_STATUS.INACTIVE;
};

/**
 * Check if subscription has access (active or within grace period)
 * @returns {boolean} - True if tenant should have access
 */
Subscription.prototype.hasAccess = function() {
  // Active and trialing always have access
  if (this.isActive()) {
    return true;
  }
  
  // Past due subscriptions have limited grace period access
  if (this.status === SUBSCRIPTION_STATUS.PAST_DUE) {
    return true; // Allow access during past_due to allow payment recovery
  }
  
  return false;
};

/**
 * Get the plan configuration for this subscription
 * @returns {Object} - Plan configuration
 */
Subscription.prototype.getPlanConfig = function() {
  return PLAN_CONFIG[this.planTier] || PLAN_CONFIG[PLAN_TIER.PROFESSIONAL];
};

/**
 * Check if this subscription has unlimited minutes
 * @returns {boolean} - True if unlimited
 */
Subscription.prototype.hasUnlimitedMinutes = function() {
  const config = this.getPlanConfig();
  return config.includedMinutes === -1 || this.includedMinutes === -1;
};

/**
 * Get remaining minutes for this billing period
 * @returns {number} - Remaining minutes (-1 for unlimited)
 */
Subscription.prototype.getRemainingMinutes = function() {
  if (this.hasUnlimitedMinutes()) {
    return -1;
  }
  const included = this.includedMinutes || this.getPlanConfig().includedMinutes;
  return Math.max(0, included - this.currentPeriodMinutesUsed);
};

/**
 * Get usage percentage for this billing period
 * @returns {number} - Usage percentage (0-100+)
 */
Subscription.prototype.getUsagePercentage = function() {
  if (this.hasUnlimitedMinutes()) {
    return 0;
  }
  const included = this.includedMinutes || this.getPlanConfig().includedMinutes;
  if (included <= 0) return 0;
  return Math.round((this.currentPeriodMinutesUsed / included) * 100);
};

/**
 * Get overage minutes (minutes over the included amount)
 * @returns {number} - Overage minutes (0 if under limit or unlimited)
 */
Subscription.prototype.getOverageMinutes = function() {
  if (this.hasUnlimitedMinutes()) {
    return 0;
  }
  const included = this.includedMinutes || this.getPlanConfig().includedMinutes;
  return Math.max(0, this.currentPeriodMinutesUsed - included);
};

/**
 * Get subscription data safe for API response
 * @returns {Object} - Subscription data without sensitive fields
 */
Subscription.prototype.toSafeObject = function() {
  const planConfig = this.getPlanConfig();
  return {
    id: this.id,
    tenantId: this.tenantId,
    status: this.status,
    planTier: this.planTier,
    planName: planConfig.name,
    billingInterval: this.billingInterval,
    includedMinutes: this.includedMinutes || planConfig.includedMinutes,
    currentPeriodMinutesUsed: this.currentPeriodMinutesUsed,
    remainingMinutes: this.getRemainingMinutes(),
    usagePercentage: this.getUsagePercentage(),
    overageMinutes: this.getOverageMinutes(),
    overageRate: planConfig.overageRate,
    currentPeriodStart: this.currentPeriodStart,
    currentPeriodEnd: this.currentPeriodEnd,
    cancelAtPeriodEnd: this.cancelAtPeriodEnd,
    canceledAt: this.canceledAt,
    trialStart: this.trialStart,
    trialEnd: this.trialEnd,
    isActive: this.isActive(),
    isInactive: this.isInactive(),
    hasAccess: this.hasAccess(),
    hasUnlimitedMinutes: this.hasUnlimitedMinutes(),
  };
};

/**
 * Update subscription from Stripe webhook data
 * @param {Object} stripeSubscription - Stripe subscription object
 * @returns {Promise<Subscription>} - Updated subscription
 */
Subscription.prototype.updateFromStripe = async function(stripeSubscription) {
  this.stripeSubscriptionId = stripeSubscription.id;
  this.stripeCustomerId = stripeSubscription.customer;
  this.status = stripeSubscription.status;
  this.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
  this.canceledAt = stripeSubscription.canceled_at 
    ? new Date(stripeSubscription.canceled_at * 1000) 
    : null;
  
  const previousPeriodStart = this.currentPeriodStart;
  this.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
  this.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
  
  // Reset usage counters if we're in a new billing period
  if (!previousPeriodStart || 
      this.currentPeriodStart.getTime() > previousPeriodStart.getTime()) {
    this.currentPeriodMinutesUsed = 0;
    this.usageAlertSent80 = false;
    this.usageAlertSent100 = false;
    logger.info(`Reset usage counters for new billing period: ${this.tenantId}`);
  }
  
  if (stripeSubscription.trial_start) {
    this.trialStart = new Date(stripeSubscription.trial_start * 1000);
  }
  if (stripeSubscription.trial_end) {
    this.trialEnd = new Date(stripeSubscription.trial_end * 1000);
  }
  
  // Get price/interval info from items
  if (stripeSubscription.items?.data) {
    for (const item of stripeSubscription.items.data) {
      const price = item.price;
      if (!price) continue;
      
      // Check if this is a metered price (for overages)
      if (price.recurring?.usage_type === 'metered') {
        this.stripeMeteredPriceId = price.id;
      } else {
        // This is the base subscription price
        this.stripePriceId = price.id;
        this.billingInterval = price.recurring?.interval || null;
        
        // Determine plan tier from metadata or price
        if (price.metadata?.planTier) {
          this.planTier = price.metadata.planTier;
        } else if (stripeSubscription.metadata?.planTier) {
          this.planTier = stripeSubscription.metadata.planTier;
        }
        
        // Update included minutes from metadata or plan config
        if (price.metadata?.includedMinutes) {
          this.includedMinutes = parseInt(price.metadata.includedMinutes, 10);
        } else {
          const config = this.getPlanConfig();
          this.includedMinutes = config.includedMinutes;
        }
      }
    }
  }
  
  await this.save();
  return this;
};

/**
 * Check if trial has expired and mark as inactive if needed
 * @returns {Promise<boolean>} - True if status was changed to inactive
 */
Subscription.prototype.checkAndMarkTrialExpired = async function() {
  // Only check if currently trialing
  if (this.status !== SUBSCRIPTION_STATUS.TRIALING) {
    return false;
  }
  
  // Check if trial has ended
  if (this.trialEnd && new Date() > this.trialEnd) {
    this.status = SUBSCRIPTION_STATUS.INACTIVE;
    await this.save();
    logger.info(`Marked subscription as inactive after trial expiration: ${this.tenantId}`);
    return true;
  }
  
  return false;
};

module.exports = {
  Subscription,
  SUBSCRIPTION_STATUS,
  BILLING_INTERVAL,
  PLAN_TIER,
  PLAN_CONFIG,
};
