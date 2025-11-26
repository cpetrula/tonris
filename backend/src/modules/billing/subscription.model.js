/**
 * Subscription Model
 * Defines the Subscription schema for Stripe billing integration
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

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
};

/**
 * Billing intervals
 */
const BILLING_INTERVAL = {
  MONTH: 'month',
  YEAR: 'year',
};

/**
 * Plan configuration
 */
const PLAN_CONFIG = {
  MONTHLY_PRICE: 29500, // $295.00 in cents
  YEARLY_PRICE: 283200, // $2,832.00 in cents
};

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenantId: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    field: 'tenant_id',
    validate: {
      notEmpty: true,
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
  status: {
    type: DataTypes.ENUM(...Object.values(SUBSCRIPTION_STATUS)),
    defaultValue: SUBSCRIPTION_STATUS.INCOMPLETE,
    allowNull: false,
  },
  billingInterval: {
    type: DataTypes.ENUM(...Object.values(BILLING_INTERVAL)),
    allowNull: true,
    field: 'billing_interval',
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
 * Get subscription data safe for API response
 * @returns {Object} - Subscription data without sensitive fields
 */
Subscription.prototype.toSafeObject = function() {
  return {
    id: this.id,
    tenantId: this.tenantId,
    status: this.status,
    billingInterval: this.billingInterval,
    currentPeriodStart: this.currentPeriodStart,
    currentPeriodEnd: this.currentPeriodEnd,
    cancelAtPeriodEnd: this.cancelAtPeriodEnd,
    canceledAt: this.canceledAt,
    trialStart: this.trialStart,
    trialEnd: this.trialEnd,
    isActive: this.isActive(),
    hasAccess: this.hasAccess(),
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
  this.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
  this.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
  
  if (stripeSubscription.trial_start) {
    this.trialStart = new Date(stripeSubscription.trial_start * 1000);
  }
  if (stripeSubscription.trial_end) {
    this.trialEnd = new Date(stripeSubscription.trial_end * 1000);
  }
  
  // Get price/interval info from items
  if (stripeSubscription.items?.data?.[0]?.price) {
    const price = stripeSubscription.items.data[0].price;
    this.stripePriceId = price.id;
    this.billingInterval = price.recurring?.interval || null;
  }
  
  await this.save();
  return this;
};

module.exports = {
  Subscription,
  SUBSCRIPTION_STATUS,
  BILLING_INTERVAL,
  PLAN_CONFIG,
};
