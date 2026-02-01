/**
 * Billing Module
 * Exports all billing-related components
 */
const billingRoutes = require('./billing.routes');
const billingController = require('./billing.controller');
const billingService = require('./billing.service');
const stripeService = require('./stripe.service');
const usageService = require('./usage.service');
const webhookHandler = require('./webhook.handler');
const { Subscription, SUBSCRIPTION_STATUS, BILLING_INTERVAL, PLAN_TIER, PLAN_CONFIG } = require('./subscription.model');
const { UsageRecord, USAGE_TYPE } = require('./usageRecord.model');

module.exports = {
  billingRoutes,
  billingController,
  billingService,
  stripeService,
  usageService,
  webhookHandler,
  Subscription,
  SUBSCRIPTION_STATUS,
  BILLING_INTERVAL,
  PLAN_TIER,
  PLAN_CONFIG,
  UsageRecord,
  USAGE_TYPE,
};
