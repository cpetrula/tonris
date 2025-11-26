/**
 * Webhook Handler
 * Handles Stripe webhook events
 */
const stripeService = require('./stripe.service');
const billingService = require('./billing.service');
const logger = require('../../utils/logger');

/**
 * Stripe webhook event types we handle
 */
const HANDLED_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
};

/**
 * Process a Stripe webhook event
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Promise<Object>} - Processing result
 */
const processWebhook = async (payload, signature) => {
  let event;
  
  try {
    event = stripeService.constructWebhookEvent(payload, signature);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    throw err;
  }
  
  logger.info(`Processing webhook event: ${event.type}`);
  
  try {
    switch (event.type) {
      case HANDLED_EVENTS.CHECKOUT_SESSION_COMPLETED:
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case HANDLED_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
      case HANDLED_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionCreatedOrUpdated(event.data.object);
        break;
        
      case HANDLED_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case HANDLED_EVENTS.INVOICE_PAID:
        await handleInvoicePaid(event.data.object);
        break;
        
      case HANDLED_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }
    
    return {
      received: true,
      eventType: event.type,
      eventId: event.id,
    };
  } catch (error) {
    logger.error(`Error processing webhook event ${event.type}: ${error.message}`);
    throw error;
  }
};

/**
 * Handle checkout.session.completed event
 * @param {Object} session - Stripe checkout session
 */
const handleCheckoutSessionCompleted = async (session) => {
  logger.info(`Checkout session completed: ${session.id}`);
  
  if (session.mode === 'subscription') {
    await billingService.handleCheckoutComplete(session);
  }
};

/**
 * Handle subscription created or updated events
 * @param {Object} subscription - Stripe subscription object
 */
const handleSubscriptionCreatedOrUpdated = async (subscription) => {
  logger.info(`Subscription ${subscription.status}: ${subscription.id}`);
  
  await billingService.handleSubscriptionUpdate(subscription);
};

/**
 * Handle subscription deleted event
 * @param {Object} subscription - Stripe subscription object
 */
const handleSubscriptionDeleted = async (subscription) => {
  logger.info(`Subscription deleted: ${subscription.id}`);
  
  await billingService.handleSubscriptionDeleted(subscription);
};

/**
 * Handle invoice.paid event
 * @param {Object} invoice - Stripe invoice object
 */
const handleInvoicePaid = async (invoice) => {
  logger.info(`Invoice paid: ${invoice.id}, subscription: ${invoice.subscription}`);
  
  // Invoice payment triggers subscription update, which is handled separately
  // This is for additional tracking/notifications if needed
};

/**
 * Handle invoice.payment_failed event
 * @param {Object} invoice - Stripe invoice object
 */
const handleInvoicePaymentFailed = async (invoice) => {
  logger.warn(`Invoice payment failed: ${invoice.id}, subscription: ${invoice.subscription}`);
  
  // Payment failures will update subscription status to past_due via webhook
  // This is for additional tracking/notifications if needed
};

module.exports = {
  processWebhook,
  HANDLED_EVENTS,
};
