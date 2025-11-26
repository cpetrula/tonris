/**
 * Billing Service
 * Handles all billing business logic
 */
const { Subscription, SUBSCRIPTION_STATUS, BILLING_INTERVAL } = require('./subscription.model');
const { Tenant, TENANT_STATUS } = require('../tenants/tenant.model');
const stripeService = require('./stripe.service');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Get subscription for a tenant
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object|null>} - Subscription data or null
 */
const getSubscription = async (tenantId) => {
  const subscription = await Subscription.findOne({ where: { tenantId } });
  
  if (!subscription) {
    return null;
  }
  
  return subscription.toSafeObject();
};

/**
 * Get or create subscription record for a tenant
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Subscription>} - Subscription model instance
 */
const getOrCreateSubscription = async (tenantId) => {
  let subscription = await Subscription.findOne({ where: { tenantId } });
  
  if (!subscription) {
    subscription = await Subscription.create({
      tenantId,
      status: SUBSCRIPTION_STATUS.INCOMPLETE,
    });
    logger.info(`Created new subscription record for tenant: ${tenantId}`);
  }
  
  return subscription;
};

/**
 * Create a Stripe customer for a tenant
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Updated subscription with customer ID
 */
const createStripeCustomer = async (tenantId) => {
  // Get tenant info
  const tenant = await Tenant.findOne({ where: { tenantId } });
  if (!tenant) {
    throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
  }
  
  // Get or create subscription record
  const subscription = await getOrCreateSubscription(tenantId);
  
  // Return existing customer if already created
  if (subscription.stripeCustomerId) {
    return subscription.toSafeObject();
  }
  
  // Create Stripe customer
  const customer = await stripeService.createCustomer({
    email: tenant.contactEmail,
    tenantId,
    name: tenant.name,
    metadata: {
      slug: tenant.slug,
    },
  });
  
  // Update subscription with customer ID
  subscription.stripeCustomerId = customer.id;
  await subscription.save();
  
  logger.info(`Created Stripe customer ${customer.id} for tenant: ${tenantId}`);
  
  return subscription.toSafeObject();
};

/**
 * Create a checkout session for a tenant
 * @param {string} tenantId - Tenant identifier
 * @param {string} billingInterval - 'month' or 'year'
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if payment is cancelled
 * @returns {Promise<Object>} - Checkout session data
 */
const createCheckoutSession = async (tenantId, billingInterval, successUrl, cancelUrl) => {
  // Validate billing interval
  if (!Object.values(BILLING_INTERVAL).includes(billingInterval)) {
    throw new AppError(
      `Invalid billing interval. Must be one of: ${Object.values(BILLING_INTERVAL).join(', ')}`,
      400,
      'INVALID_BILLING_INTERVAL'
    );
  }
  
  // Ensure customer exists
  const subscription = await getOrCreateSubscription(tenantId);
  
  if (!subscription.stripeCustomerId) {
    // Create customer first
    const tenant = await Tenant.findOne({ where: { tenantId } });
    if (!tenant) {
      throw new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND');
    }
    
    const customer = await stripeService.createCustomer({
      email: tenant.contactEmail,
      tenantId,
      name: tenant.name,
    });
    
    subscription.stripeCustomerId = customer.id;
    await subscription.save();
  }
  
  // Check if already has active subscription
  if (subscription.isActive()) {
    throw new AppError(
      'Tenant already has an active subscription',
      400,
      'SUBSCRIPTION_ALREADY_ACTIVE'
    );
  }
  
  // Get price ID for the interval
  const priceId = stripeService.getPriceId(billingInterval);
  
  if (!priceId) {
    throw new AppError(
      'Stripe price not configured for this billing interval',
      500,
      'PRICE_NOT_CONFIGURED'
    );
  }
  
  // Create checkout session
  const session = await stripeService.createCheckoutSession({
    customerId: subscription.stripeCustomerId,
    priceId,
    tenantId,
    successUrl,
    cancelUrl,
  });
  
  return {
    sessionId: session.id,
    url: session.url,
  };
};

/**
 * Create a customer portal session
 * @param {string} tenantId - Tenant identifier
 * @param {string} returnUrl - URL to return after portal session
 * @returns {Promise<Object>} - Portal session data
 */
const createPortalSession = async (tenantId, returnUrl) => {
  const subscription = await Subscription.findOne({ where: { tenantId } });
  
  if (!subscription || !subscription.stripeCustomerId) {
    throw new AppError(
      'No billing account found for this tenant',
      404,
      'NO_BILLING_ACCOUNT'
    );
  }
  
  const session = await stripeService.createPortalSession({
    customerId: subscription.stripeCustomerId,
    returnUrl,
  });
  
  return {
    url: session.url,
  };
};

/**
 * Handle subscription creation/update from Stripe webhook
 * @param {Object} stripeSubscription - Stripe subscription object
 * @returns {Promise<Object>} - Updated subscription
 */
const handleSubscriptionUpdate = async (stripeSubscription) => {
  const tenantId = stripeSubscription.metadata?.tenantId;
  
  if (!tenantId) {
    logger.warn(`Subscription ${stripeSubscription.id} has no tenantId in metadata`);
    // Try to find by customer ID
    const subscription = await Subscription.findOne({
      where: { stripeCustomerId: stripeSubscription.customer },
    });
    
    if (subscription) {
      await subscription.updateFromStripe(stripeSubscription);
      await syncTenantStatus(subscription);
      return subscription.toSafeObject();
    }
    
    throw new AppError('Cannot identify tenant for subscription', 400, 'TENANT_NOT_IDENTIFIED');
  }
  
  // Get or create subscription
  const subscription = await getOrCreateSubscription(tenantId);
  await subscription.updateFromStripe(stripeSubscription);
  await syncTenantStatus(subscription);
  
  logger.info(`Subscription updated for tenant ${tenantId}: status=${stripeSubscription.status}`);
  
  return subscription.toSafeObject();
};

/**
 * Handle subscription deletion from Stripe webhook
 * @param {Object} stripeSubscription - Stripe subscription object
 * @returns {Promise<Object>} - Updated subscription
 */
const handleSubscriptionDeleted = async (stripeSubscription) => {
  const subscription = await Subscription.findOne({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });
  
  if (!subscription) {
    logger.warn(`Subscription ${stripeSubscription.id} not found for deletion`);
    return null;
  }
  
  subscription.status = SUBSCRIPTION_STATUS.CANCELED;
  subscription.canceledAt = new Date();
  await subscription.save();
  
  await syncTenantStatus(subscription);
  
  logger.info(`Subscription deleted for tenant: ${subscription.tenantId}`);
  
  return subscription.toSafeObject();
};

/**
 * Handle checkout session completion
 * @param {Object} session - Stripe checkout session
 * @returns {Promise<void>}
 */
const handleCheckoutComplete = async (session) => {
  const tenantId = session.metadata?.tenantId;
  
  if (!tenantId) {
    logger.warn(`Checkout session ${session.id} has no tenantId in metadata`);
    return;
  }
  
  logger.info(`Checkout completed for tenant: ${tenantId}`);
  
  // The subscription.created/updated webhook will handle the actual update
  // This is just for logging/tracking purposes
};

/**
 * Sync tenant status based on subscription status
 * @param {Subscription} subscription - Subscription model instance
 * @returns {Promise<void>}
 */
const syncTenantStatus = async (subscription) => {
  const tenant = await Tenant.findOne({ where: { tenantId: subscription.tenantId } });
  
  if (!tenant) {
    logger.warn(`Tenant not found for subscription: ${subscription.tenantId}`);
    return;
  }
  
  const hasAccess = subscription.hasAccess();
  
  // Activate tenant if subscription is active and tenant is pending
  if (hasAccess && tenant.status === TENANT_STATUS.PENDING) {
    await tenant.transitionTo(TENANT_STATUS.ACTIVE);
    tenant.onboardingCompletedAt = new Date();
    await tenant.save();
    logger.info(`Tenant activated via subscription: ${subscription.tenantId}`);
  }
  
  // Suspend tenant if subscription is cancelled/unpaid
  if (!hasAccess && tenant.status === TENANT_STATUS.ACTIVE) {
    if ([SUBSCRIPTION_STATUS.CANCELED, SUBSCRIPTION_STATUS.UNPAID].includes(subscription.status)) {
      await tenant.transitionTo(TENANT_STATUS.SUSPENDED);
      logger.info(`Tenant suspended due to subscription status: ${subscription.tenantId}`);
    }
  }
  
  // Reactivate tenant if subscription becomes active again
  if (hasAccess && tenant.status === TENANT_STATUS.SUSPENDED) {
    await tenant.transitionTo(TENANT_STATUS.ACTIVE);
    logger.info(`Tenant reactivated via subscription: ${subscription.tenantId}`);
  }
};

/**
 * Check if tenant has active subscription access
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<boolean>} - True if tenant has access
 */
const hasActiveSubscription = async (tenantId) => {
  const subscription = await Subscription.findOne({ where: { tenantId } });
  
  if (!subscription) {
    return false;
  }
  
  return subscription.hasAccess();
};

/**
 * Cancel a subscription for a tenant
 * @param {string} tenantId - Tenant identifier
 * @param {boolean} immediate - If true, cancel immediately; otherwise at period end
 * @returns {Promise<Object>} - Updated subscription
 */
const cancelSubscription = async (tenantId, immediate = false) => {
  const subscription = await Subscription.findOne({ where: { tenantId } });
  
  if (!subscription || !subscription.stripeSubscriptionId) {
    throw new AppError(
      'No active subscription found for this tenant',
      404,
      'NO_SUBSCRIPTION'
    );
  }
  
  // Cancel in Stripe
  const stripeSubscription = await stripeService.cancelSubscription(
    subscription.stripeSubscriptionId,
    immediate
  );
  
  // Update local record
  await subscription.updateFromStripe(stripeSubscription);
  
  logger.info(`Subscription cancelled for tenant: ${tenantId}, immediate: ${immediate}`);
  
  return subscription.toSafeObject();
};

module.exports = {
  getSubscription,
  getOrCreateSubscription,
  createStripeCustomer,
  createCheckoutSession,
  createPortalSession,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
  handleCheckoutComplete,
  syncTenantStatus,
  hasActiveSubscription,
  cancelSubscription,
};
