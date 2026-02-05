/**
 * Billing Controller
 * Handles HTTP requests for billing endpoints
 */
const billingService = require('./billing.service');
const usageService = require('./usage.service');
const webhookHandler = require('./webhook.handler');
const stripeService = require('./stripe.service');
const { BILLING_INTERVAL, PLAN_CONFIG, PLAN_TIER } = require('./subscription.model');
const { getTenantUUID } = require('../../utils/tenant');

/**
 * GET /api/billing/subscription
 * Get current subscription for the tenant
 */
const getSubscription = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    
    // Check and update subscription status (e.g., mark trial as expired)
    await billingService.checkSubscriptionStatus(tenantUUID);
    
    const subscription = await billingService.getSubscription(tenantUUID);
    
    // Format plans with price display strings
    const plans = stripeService.getAvailablePlans().map(plan => ({
      ...plan,
      monthlyPriceFormatted: `$${(plan.monthlyPrice / 100).toFixed(2)}`,
      annualPriceFormatted: `$${(plan.annualPrice / 100).toFixed(2)}`,
      annualMonthlyPriceFormatted: `$${((plan.annualPrice / 12) / 100).toFixed(2)}`,
      overageRateFormatted: `$${(plan.overageRate / 100).toFixed(2)}`,
      includedMinutesFormatted: plan.includedMinutes === -1 ? 'Unlimited' : plan.includedMinutes,
    }));

    res.status(200).json({
      success: true,
      data: {
        subscription,
        plans,
        trialDays: PLAN_CONFIG.TRIAL_DAYS,
        trialMinutes: PLAN_CONFIG.TRIAL_MINUTES,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/billing/create-checkout-session
 * Create a Stripe checkout session for subscription
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const { planTier, billingInterval, successUrl, cancelUrl } = req.body;
    
    // Default to professional plan and monthly billing
    const tier = planTier || PLAN_TIER.PROFESSIONAL;
    const interval = billingInterval || BILLING_INTERVAL.MONTH;
    
    if (!successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        error: 'Success URL and cancel URL are required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    const tenantUUID = await getTenantUUID(req.tenantId);
    const session = await billingService.createCheckoutSession(
      tenantUUID,
      tier,
      interval,
      successUrl,
      cancelUrl
    );
    
    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/billing/portal-session
 * Create a Stripe customer portal session
 */
const createPortalSession = async (req, res, next) => {
  try {
    const { returnUrl } = req.body;
    
    if (!returnUrl) {
      return res.status(400).json({
        success: false,
        error: 'Return URL is required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    const tenantUUID = await getTenantUUID(req.tenantId);
    const session = await billingService.createPortalSession(
      tenantUUID,
      returnUrl
    );
    
    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/billing/cancel
 * Cancel the current subscription
 */
const cancelSubscription = async (req, res, next) => {
  try {
    const { immediate } = req.body;
    
    const tenantUUID = await getTenantUUID(req.tenantId);
    const subscription = await billingService.cancelSubscription(
      tenantUUID,
      immediate === true
    );
    
    res.status(200).json({
      success: true,
      data: { subscription },
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at the end of the billing period',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/billing/change-plan
 * Change subscription plan
 */
const changePlan = async (req, res, next) => {
  try {
    const { planTier, billingInterval } = req.body;
    
    if (!planTier || !Object.values(PLAN_TIER).includes(planTier)) {
      return res.status(400).json({
        success: false,
        error: 'Valid plan tier is required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    const tenantUUID = await getTenantUUID(req.tenantId);
    const subscription = await billingService.changePlan(
      tenantUUID,
      planTier,
      billingInterval || BILLING_INTERVAL.MONTH
    );
    
    res.status(200).json({
      success: true,
      data: { subscription },
      message: `Plan changed to ${PLAN_CONFIG[planTier].name}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 * Note: This endpoint uses raw body parser
 */
const handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Stripe signature',
        code: 'MISSING_SIGNATURE',
      });
    }
    
    // req.rawBody should be set by middleware for this route
    const result = await webhookHandler.processWebhook(req.rawBody, signature);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Stripe expects a 400 response for webhook errors
    if (error.type === 'StripeSignatureVerificationError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid signature',
        code: 'INVALID_SIGNATURE',
      });
    }
    next(error);
  }
};

/**
 * GET /api/billing/plans
 * Get available subscription plans
 */
const getPlans = async (req, res) => {
  const plans = stripeService.getAvailablePlans();
  
  res.status(200).json({
    success: true,
    data: {
      plans: plans.map(plan => ({
        ...plan,
        monthlyPriceFormatted: `$${(plan.monthlyPrice / 100).toFixed(2)}`,
        annualPriceFormatted: `$${(plan.annualPrice / 100).toFixed(2)}`,
        annualMonthlyPriceFormatted: `$${((plan.annualPrice / 12) / 100).toFixed(2)}`,
        overageRateFormatted: `$${(plan.overageRate / 100).toFixed(2)}`,
        includedMinutesFormatted: plan.includedMinutes === -1 ? 'Unlimited' : plan.includedMinutes,
      })),
      trialDays: PLAN_CONFIG.TRIAL_DAYS,
      trialMinutes: PLAN_CONFIG.TRIAL_MINUTES,
    },
  });
};

/**
 * GET /api/billing/usage
 * Get current period usage for the tenant
 */
const getCurrentUsage = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const usage = await usageService.getCurrentUsage(tenantUUID);
    
    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/billing/usage/history
 * Get usage history for the tenant
 */
const getUsageHistory = async (req, res, next) => {
  try {
    const periods = parseInt(req.query.periods, 10) || 6;
    const tenantUUID = await getTenantUUID(req.tenantId);
    const history = await usageService.getUsageHistory(tenantUUID, periods);
    
    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscription,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  changePlan,
  handleStripeWebhook,
  getPlans,
  getCurrentUsage,
  getUsageHistory,
};
