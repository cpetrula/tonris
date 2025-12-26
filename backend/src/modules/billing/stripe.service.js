/**
 * Stripe Service
 * Handles all direct interactions with the Stripe API
 */
const Stripe = require('stripe');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { PLAN_CONFIG, BILLING_INTERVAL } = require('./subscription.model');

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
 * @param {string} params.priceId - Stripe price ID
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.successUrl - URL to redirect after successful payment
 * @param {string} params.cancelUrl - URL to redirect if payment is cancelled
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} - Stripe checkout session
 */
const createCheckoutSession = async ({
  customerId,
  priceId,
  tenantId,
  successUrl,
  cancelUrl,
  metadata = {},
}) => {
  ensureStripeConfigured();
  
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        ...metadata,
      },
      subscription_data: {
        metadata: {
          tenantId,
        },
      },
    });
    
    logger.info(`Checkout session created: ${session.id} for tenant: ${tenantId}`);
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
 * Get price ID based on billing interval
 * @param {string} interval - 'month' or 'year'
 * @returns {string} - Stripe price ID
 */
const getPriceId = (interval) => {
  // Only monthly pricing is supported now
  return env.STRIPE_MONTHLY_PRICE_ID;
};

/**
 * Get plan price based on interval
 * @param {string} interval - 'month' or 'year'
 * @returns {number} - Price in cents
 */
const getPlanPrice = (interval) => {
  // Only monthly pricing is supported now
  return PLAN_CONFIG.MONTHLY_PRICE;
};

module.exports = {
  createCustomer,
  getCustomer,
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  constructWebhookEvent,
  getPriceId,
  getPlanPrice,
};
