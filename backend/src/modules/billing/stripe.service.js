/**
 * Stripe Service
 * Handles all direct interactions with the Stripe API
 */
const Stripe = require('stripe');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { PLAN_CONFIG, PLAN_TIER, BILLING_INTERVAL } = require('./subscription.model');

// Initialize Stripe with secret key
const stripe = env.STRIPE_SECRET_KEY 
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

/**
 * Verify Stripe is configured
 * @throws {Error} If Stripe is not configured
 */
const ensureStripeConfigured = () => {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }
};

/**
 * Create a Stripe customer
 * @param {Object} params - Customer parameters
 * @param {string} params.email - Customer email
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.name - Customer/business name
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} - Stripe customer object
 */
const createCustomer = async ({ email, tenantId, name, metadata = {} }) => {
  ensureStripeConfigured();
  
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenantId,
        ...metadata,
      },
    });
    
    logger.info(`Stripe customer created: ${customer.id} for tenant: ${tenantId}`);
    return customer;
  } catch (error) {
    logger.error(`Failed to create Stripe customer: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieve a Stripe customer
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} - Stripe customer object
 */
const getCustomer = async (customerId) => {
  ensureStripeConfigured();
  
  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error) {
    logger.error(`Failed to retrieve Stripe customer: ${error.message}`);
    throw error;
  }
};

/**
 * Create a checkout session for subscription
 * @param {Object} params - Checkout parameters
 * @param {string} params.customerId - Stripe customer ID
 * @param {string} params.priceId - Stripe price ID for base subscription
 * @param {string} params.meteredPriceId - Stripe price ID for metered overage (optional)
 * @param {string} params.planTier - Plan tier (starter, professional, business)
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.successUrl - URL to redirect after successful payment
 * @param {string} params.cancelUrl - URL to redirect if payment is cancelled
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} - Stripe checkout session
 */
const createCheckoutSession = async ({
  customerId,
  priceId,
  meteredPriceId,
  planTier,
  tenantId,
  successUrl,
  cancelUrl,
  metadata = {},
}) => {
  ensureStripeConfigured();
  
  try {
    // Build line items - base subscription
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];
    
    // Add metered price for overage if provided
    if (meteredPriceId) {
      lineItems.push({
        price: meteredPriceId,
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        planTier: planTier || PLAN_TIER.PROFESSIONAL,
        ...metadata,
      },
      subscription_data: {
        metadata: {
          tenantId,
          planTier: planTier || PLAN_TIER.PROFESSIONAL,
        },
      },
    });
    
    logger.info(`Checkout session created: ${session.id} for tenant: ${tenantId}, plan: ${planTier}`);
    return session;
  } catch (error) {
    logger.error(`Failed to create checkout session: ${error.message}`);
    throw error;
  }
};

/**
 * Create a customer portal session
 * @param {Object} params - Portal parameters
 * @param {string} params.customerId - Stripe customer ID
 * @param {string} params.returnUrl - URL to return after portal session
 * @returns {Promise<Object>} - Stripe portal session
 */
const createPortalSession = async ({ customerId, returnUrl }) => {
  ensureStripeConfigured();
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    logger.info(`Portal session created for customer: ${customerId}`);
    return session;
  } catch (error) {
    logger.error(`Failed to create portal session: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieve a subscription from Stripe
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} - Stripe subscription object
 */
const getSubscription = async (subscriptionId) => {
  ensureStripeConfigured();
  
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    logger.error(`Failed to retrieve subscription: ${error.message}`);
    throw error;
  }
};

/**
 * Update a subscription (e.g., change plan)
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {Object} updates - Update parameters
 * @returns {Promise<Object>} - Updated Stripe subscription
 */
const updateSubscription = async (subscriptionId, updates) => {
  ensureStripeConfigured();
  
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, updates);
    logger.info(`Subscription updated: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    logger.error(`Failed to update subscription: ${error.message}`);
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} cancelImmediately - If true, cancel immediately; otherwise at period end
 * @returns {Promise<Object>} - Updated Stripe subscription
 */
const cancelSubscription = async (subscriptionId, cancelImmediately = false) => {
  ensureStripeConfigured();
  
  try {
    let subscription;
    
    if (cancelImmediately) {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
    
    logger.info(`Subscription ${cancelImmediately ? 'cancelled' : 'set to cancel'}: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    logger.error(`Failed to cancel subscription: ${error.message}`);
    throw error;
  }
};

/**
 * Resume a subscription that was set to cancel at period end
 * @param {string} subscriptionId - Stripe subscription ID
 * @returns {Promise<Object>} - Updated Stripe subscription
 */
const resumeSubscription = async (subscriptionId) => {
  ensureStripeConfigured();
  
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    
    logger.info(`Subscription resumed: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    logger.error(`Failed to resume subscription: ${error.message}`);
    throw error;
  }
};

/**
 * Report usage for metered billing
 * @param {Object} params - Usage parameters
 * @param {string} params.subscriptionId - Stripe subscription ID
 * @param {number} params.quantity - Usage quantity (e.g., minutes)
 * @param {number} params.timestamp - Unix timestamp for the usage
 * @param {string} params.action - 'set' or 'increment'
 * @returns {Promise<Object>} - Stripe usage record
 */
const reportUsage = async ({ subscriptionId, quantity, timestamp, action = 'increment' }) => {
  ensureStripeConfigured();
  
  try {
    // First get the subscription to find the metered subscription item
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Find the metered subscription item
    const meteredItem = subscription.items.data.find(
      item => item.price.recurring?.usage_type === 'metered'
    );
    
    if (!meteredItem) {
      logger.warn(`No metered subscription item found for subscription: ${subscriptionId}`);
      return null;
    }
    
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      meteredItem.id,
      {
        quantity,
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        action,
      }
    );
    
    logger.info(`Usage reported: ${quantity} for subscription item: ${meteredItem.id}`);
    return usageRecord;
  } catch (error) {
    logger.error(`Failed to report usage: ${error.message}`);
    throw error;
  }
};

/**
 * Get usage records for a metered subscription
 * @param {string} subscriptionItemId - Stripe subscription item ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Stripe usage record summary
 */
const getUsageRecords = async (subscriptionItemId, options = {}) => {
  ensureStripeConfigured();
  
  try {
    const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId,
      options
    );
    
    return usageRecords;
  } catch (error) {
    logger.error(`Failed to get usage records: ${error.message}`);
    throw error;
  }
};

/**
 * Construct and verify a Stripe webhook event
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} - Verified Stripe event
 */
const constructWebhookEvent = (payload, signature) => {
  ensureStripeConfigured();
  
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook secret not configured');
  }
  
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
};

/**
 * Get price ID based on plan tier and billing interval
 * @param {string} planTier - Plan tier (starter, professional, business)
 * @param {string} interval - 'month' or 'year'
 * @returns {string} - Stripe price ID
 */
const getPriceId = (planTier, interval = 'month') => {
  // Map plan tiers to environment variable price IDs
  // These should be configured in environment variables
  const priceEnvVar = `STRIPE_${planTier.toUpperCase()}_${interval.toUpperCase()}_PRICE_ID`;
  const priceId = env[priceEnvVar];
  
  // Fallback to legacy price ID for backward compatibility
  if (!priceId && planTier === PLAN_TIER.LEGACY) {
    return env.STRIPE_MONTHLY_PRICE_ID;
  }
  
  // Default to professional monthly if specific price not found
  if (!priceId) {
    return env.STRIPE_PROFESSIONAL_MONTH_PRICE_ID || env.STRIPE_MONTHLY_PRICE_ID;
  }
  
  return priceId;
};

/**
 * Get metered price ID for overage billing
 * @returns {string} - Stripe metered price ID
 */
const getMeteredPriceId = () => {
  return env.STRIPE_OVERAGE_METERED_PRICE_ID;
};

/**
 * Get plan price based on tier and interval
 * @param {string} planTier - Plan tier
 * @param {string} interval - 'month' or 'year'
 * @returns {number} - Price in cents
 */
const getPlanPrice = (planTier, interval = 'month') => {
  const config = PLAN_CONFIG[planTier] || PLAN_CONFIG[PLAN_TIER.PROFESSIONAL];
  return interval === 'year' ? config.annualPrice : config.monthlyPrice;
};

/**
 * Get all available plans with pricing
 * @returns {Array} - Array of plan objects
 */
const getAvailablePlans = () => {
  return [
    {
      id: PLAN_TIER.STARTER,
      name: PLAN_CONFIG[PLAN_TIER.STARTER].name,
      monthlyPrice: PLAN_CONFIG[PLAN_TIER.STARTER].monthlyPrice,
      annualPrice: PLAN_CONFIG[PLAN_TIER.STARTER].annualPrice,
      includedMinutes: PLAN_CONFIG[PLAN_TIER.STARTER].includedMinutes,
      overageRate: PLAN_CONFIG[PLAN_TIER.STARTER].overageRate,
      parallelCalls: PLAN_CONFIG[PLAN_TIER.STARTER].parallelCalls,
    },
    {
      id: PLAN_TIER.PROFESSIONAL,
      name: PLAN_CONFIG[PLAN_TIER.PROFESSIONAL].name,
      monthlyPrice: PLAN_CONFIG[PLAN_TIER.PROFESSIONAL].monthlyPrice,
      annualPrice: PLAN_CONFIG[PLAN_TIER.PROFESSIONAL].annualPrice,
      includedMinutes: PLAN_CONFIG[PLAN_TIER.PROFESSIONAL].includedMinutes,
      overageRate: PLAN_CONFIG[PLAN_TIER.PROFESSIONAL].overageRate,
      parallelCalls: PLAN_CONFIG[PLAN_TIER.PROFESSIONAL].parallelCalls,
      popular: true,
    },
    {
      id: PLAN_TIER.BUSINESS,
      name: PLAN_CONFIG[PLAN_TIER.BUSINESS].name,
      monthlyPrice: PLAN_CONFIG[PLAN_TIER.BUSINESS].monthlyPrice,
      annualPrice: PLAN_CONFIG[PLAN_TIER.BUSINESS].annualPrice,
      includedMinutes: PLAN_CONFIG[PLAN_TIER.BUSINESS].includedMinutes,
      overageRate: PLAN_CONFIG[PLAN_TIER.BUSINESS].overageRate,
      parallelCalls: PLAN_CONFIG[PLAN_TIER.BUSINESS].parallelCalls,
    },
  ];
};

module.exports = {
  createCustomer,
  getCustomer,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  reportUsage,
  getUsageRecords,
  constructWebhookEvent,
  getPriceId,
  getMeteredPriceId,
  getPlanPrice,
  getAvailablePlans,
};
