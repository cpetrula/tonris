/**
 * Billing Module Index
 * Central export for billing module
 */
const billingRoutes = require('./billing.routes');
const billingService = require('./billing.service');
const billingController = require('./billing.controller');
const stripeService = require('./stripe.service');
const webhookHandler = require('./webhook.handler');
const {
  Subscription,
  SUBSCRIPTION_STATUS,
  BILLING_INTERVAL,
  PLAN_CONFIG,
} = require('./subscription.model');

module.exports = {
  billingRoutes,
  billingService,
  billingController,
  stripeService,
  webhookHandler,
  Subscription,
  SUBSCRIPTION_STATUS,
  BILLING_INTERVAL,
  PLAN_CONFIG,
};
