/**
 * Billing Controller
 * Handles HTTP requests for billing endpoints
 */
const billingService = require('./billing.service');
const webhookHandler = require('./webhook.handler');
const { BILLING_INTERVAL, PLAN_CONFIG } = require('./subscription.model');

/**
 * GET /api/billing/subscription
 * Get current subscription for the tenant
 */
const getSubscription = async (req, res, next) => {
  try {
    const subscription = await billingService.getSubscription(req.tenantId);
    
    res.status(200).json({
      success: true,
      data: {
        subscription,
        plans: {
          monthly: {
            price: PLAN_CONFIG.MONTHLY_PRICE,
            interval: BILLING_INTERVAL.MONTH,
            priceFormatted: `$${(PLAN_CONFIG.MONTHLY_PRICE / 100).toFixed(2)}`,
          },
          yearly: {
            price: PLAN_CONFIG.YEARLY_PRICE,
            interval: BILLING_INTERVAL.YEAR,
            priceFormatted: `$${(PLAN_CONFIG.YEARLY_PRICE / 100).toFixed(2)}`,
          },
        },
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
    const { billingInterval, successUrl, cancelUrl } = req.body;
    
    // Validate required fields
    if (!billingInterval) {
      return res.status(400).json({
        success: false,
        error: 'Billing interval is required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    if (!successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        error: 'Success URL and cancel URL are required',
        code: 'VALIDATION_ERROR',
      });
    }
    
    const session = await billingService.createCheckoutSession(
      req.tenantId,
      billingInterval,
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
    
    const session = await billingService.createPortalSession(
      req.tenantId,
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
    
    const subscription = await billingService.cancelSubscription(
      req.tenantId,
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
  res.status(200).json({
    success: true,
    data: {
      plans: [
        {
          id: 'monthly',
          name: 'Monthly Plan',
          price: PLAN_CONFIG.MONTHLY_PRICE,
          priceFormatted: `$${(PLAN_CONFIG.MONTHLY_PRICE / 100).toFixed(2)}`,
          interval: BILLING_INTERVAL.MONTH,
          intervalLabel: 'per month',
        },
        {
          id: 'yearly',
          name: 'Yearly Plan',
          price: PLAN_CONFIG.YEARLY_PRICE,
          priceFormatted: `$${(PLAN_CONFIG.YEARLY_PRICE / 100).toFixed(2)}`,
          interval: BILLING_INTERVAL.YEAR,
          intervalLabel: 'per year',
          savings: `Save $${((PLAN_CONFIG.MONTHLY_PRICE * 12 - PLAN_CONFIG.YEARLY_PRICE) / 100).toFixed(2)}`,
        },
      ],
    },
  });
};

module.exports = {
  getSubscription,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  handleStripeWebhook,
  getPlans,
};
