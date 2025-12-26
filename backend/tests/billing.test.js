/**
 * Billing Tests
 * Tests for billing module functionality
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockSubscriptionModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockTenantModel = {
  findOne: jest.fn(),
};

// Mock the subscription model
jest.mock('../src/modules/billing/subscription.model', () => ({
  Subscription: mockSubscriptionModel,
  SUBSCRIPTION_STATUS: {
    INCOMPLETE: 'incomplete',
    INCOMPLETE_EXPIRED: 'incomplete_expired',
    TRIALING: 'trialing',
    ACTIVE: 'active',
    PAST_DUE: 'past_due',
    CANCELED: 'canceled',
    UNPAID: 'unpaid',
    PAUSED: 'paused',
    INACTIVE: 'inactive',
  },
  BILLING_INTERVAL: {
    MONTH: 'month',
    YEAR: 'year',
  },
  PLAN_CONFIG: {
    MONTHLY_PRICE: 29500,
    TRIAL_DAYS: 15,
  },
}));

// Mock the tenant model
jest.mock('../src/modules/tenants/tenant.model', () => ({
  Tenant: mockTenantModel,
  TENANT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled',
  },
  PLAN_TYPES: {
    FREE: 'free',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
  },
  VALID_TRANSITIONS: {
    pending: ['active', 'cancelled'],
    active: ['suspended', 'cancelled'],
    suspended: ['active', 'cancelled'],
    cancelled: [],
  },
}));

// Mock the models index
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Tenant: mockTenantModel,
  TENANT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled',
  },
  PLAN_TYPES: {
    FREE: 'free',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
  },
  Subscription: mockSubscriptionModel,
  SUBSCRIPTION_STATUS: {
    INCOMPLETE: 'incomplete',
    ACTIVE: 'active',
    CANCELED: 'canceled',
  },
  BILLING_INTERVAL: {
    MONTH: 'month',
    YEAR: 'year',
  },
  PLAN_CONFIG: {
    MONTHLY_PRICE: 29500,
    TRIAL_DAYS: 15,
  },
}));

// Mock the stripe service
jest.mock('../src/modules/billing/stripe.service', () => ({
  createCustomer: jest.fn(),
  getCustomer: jest.fn(),
  createCheckoutSession: jest.fn(),
  createPortalSession: jest.fn(),
  getSubscription: jest.fn(),
  cancelSubscription: jest.fn(),
  resumeSubscription: jest.fn(),
  constructWebhookEvent: jest.fn(),
  getPriceId: jest.fn(() => 'price_monthly'),
  getPlanPrice: jest.fn(() => 29500),
}));

// Mock tenant utility
jest.mock('../src/utils/tenant', () => ({
  getTenantUUID: jest.fn().mockResolvedValue('tenant-uuid-123'),
}));

// Now require the app AFTER the mocks are in place
const { app } = require('../src/app');
const jwtUtils = require('../src/modules/auth/jwt.utils');
const stripeService = require('../src/modules/billing/stripe.service');

describe('Billing Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validToken = () => jwtUtils.generateAccessToken({
    userId: '123',
    email: 'test@example.com',
    tenantId: 'test-tenant',
  });

  describe('GET /api/billing/plans', () => {
    it('should return available subscription plans', async () => {
      const response = await request(app)
        .get('/api/billing/plans')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.plans).toBeDefined();
      expect(response.body.data.plans).toHaveLength(1);
      
      const monthlyPlan = response.body.data.plans.find(p => p.id === 'monthly');
      
      expect(monthlyPlan).toBeDefined();
      expect(monthlyPlan.price).toBe(29500);
      expect(monthlyPlan.interval).toBe('month');
      
      // Check for trial days in response
      expect(response.body.data.trialDays).toBe(15);
    });
  });

  describe('GET /api/billing/subscription', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/billing/subscription')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should return subscription data with valid token', async () => {
      const mockSubscriptionInstance = {
        id: '123',
        tenantId: 'test-tenant',
        status: 'active',
        billingInterval: 'month',
        isActive: () => true,
        hasAccess: () => true,
        toSafeObject: () => ({
          id: '123',
          tenantId: 'test-tenant',
          status: 'active',
          billingInterval: 'month',
          isActive: true,
          hasAccess: true,
        }),
      };
      mockSubscriptionModel.findOne.mockResolvedValue(mockSubscriptionInstance);

      const response = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subscription).toBeDefined();
      expect(response.body.data.plans).toBeDefined();
    });

    it('should return null subscription when none exists', async () => {
      mockSubscriptionModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/billing/subscription')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subscription).toBeNull();
    });
  });

  describe('POST /api/billing/create-checkout-session', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/billing/create-checkout-session')
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          billingInterval: 'month',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 when billing interval is missing', async () => {
      const response = await request(app)
        .post('/api/billing/create-checkout-session')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when URLs are missing', async () => {
      const response = await request(app)
        .post('/api/billing/create-checkout-session')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          billingInterval: 'month',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should create checkout session successfully', async () => {
      mockSubscriptionModel.findOne.mockResolvedValue(null);
      mockSubscriptionModel.create.mockResolvedValue({
        id: '123',
        tenantId: 'test-tenant',
        stripeCustomerId: null,
        isActive: () => false,
        save: jest.fn(),
      });
      
      mockTenantModel.findOne.mockResolvedValue({
        tenantId: 'test-tenant',
        name: 'Test Salon',
        contactEmail: 'test@example.com',
      });

      stripeService.createCustomer.mockResolvedValue({
        id: 'cus_123',
      });

      stripeService.createCheckoutSession.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/pay/cs_123',
      });

      const response = await request(app)
        .post('/api/billing/create-checkout-session')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          billingInterval: 'month',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBe('cs_123');
      expect(response.body.data.url).toBeDefined();
    });
  });

  describe('POST /api/billing/portal-session', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/billing/portal-session')
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          returnUrl: 'https://example.com/billing',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 when return URL is missing', async () => {
      const response = await request(app)
        .post('/api/billing/portal-session')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when no billing account exists', async () => {
      mockSubscriptionModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/billing/portal-session')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          returnUrl: 'https://example.com/billing',
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NO_BILLING_ACCOUNT');
    });

    it('should create portal session successfully', async () => {
      mockSubscriptionModel.findOne.mockResolvedValue({
        id: '123',
        tenantId: 'test-tenant',
        stripeCustomerId: 'cus_123',
      });

      stripeService.createPortalSession.mockResolvedValue({
        url: 'https://billing.stripe.com/session/123',
      });

      const response = await request(app)
        .post('/api/billing/portal-session')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          returnUrl: 'https://example.com/billing',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBeDefined();
    });
  });

  describe('POST /api/billing/cancel', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/billing/cancel')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should return 404 when no subscription exists', async () => {
      mockSubscriptionModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NO_SUBSCRIPTION');
    });

    it('should cancel subscription at period end by default', async () => {
      const mockSubscription = {
        id: '123',
        tenantId: 'test-tenant',
        stripeSubscriptionId: 'sub_123',
        status: 'active',
        cancelAtPeriodEnd: false,
        updateFromStripe: jest.fn().mockImplementation(function(data) {
          this.cancelAtPeriodEnd = data.cancel_at_period_end;
          return this;
        }),
        toSafeObject: function() {
          return {
            id: this.id,
            tenantId: this.tenantId,
            status: this.status,
            cancelAtPeriodEnd: this.cancelAtPeriodEnd,
          };
        },
      };
      mockSubscriptionModel.findOne.mockResolvedValue(mockSubscription);

      stripeService.cancelSubscription.mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: true,
        customer: 'cus_123',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 2592000,
        items: { data: [{ price: { id: 'price_123', recurring: { interval: 'month' } } }] },
      });

      const response = await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('end of the billing period');
      expect(stripeService.cancelSubscription).toHaveBeenCalledWith('sub_123', false);
    });

    it('should cancel subscription immediately when requested', async () => {
      const mockSubscription = {
        id: '123',
        tenantId: 'test-tenant',
        stripeSubscriptionId: 'sub_123',
        status: 'canceled',
        cancelAtPeriodEnd: false,
        canceledAt: new Date(),
        updateFromStripe: jest.fn().mockImplementation(function(data) {
          this.status = data.status;
          return this;
        }),
        toSafeObject: function() {
          return {
            id: this.id,
            tenantId: this.tenantId,
            status: this.status,
            cancelAtPeriodEnd: this.cancelAtPeriodEnd,
          };
        },
      };
      mockSubscriptionModel.findOne.mockResolvedValue(mockSubscription);

      stripeService.cancelSubscription.mockResolvedValue({
        id: 'sub_123',
        status: 'canceled',
        cancel_at_period_end: false,
        customer: 'cus_123',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000),
        canceled_at: Math.floor(Date.now() / 1000),
        items: { data: [{ price: { id: 'price_123', recurring: { interval: 'month' } } }] },
      });

      const response = await request(app)
        .post('/api/billing/cancel')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ immediate: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('immediately');
      expect(stripeService.cancelSubscription).toHaveBeenCalledWith('sub_123', true);
    });
  });

  describe('POST /api/webhooks/stripe', () => {
    it('should return 400 when signature is missing', async () => {
      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ type: 'test' }));

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('MISSING_SIGNATURE');
    });

    it('should return 400 when signature is invalid', async () => {
      stripeService.constructWebhookEvent.mockImplementation(() => {
        const error = new Error('Invalid signature');
        error.type = 'StripeSignatureVerificationError';
        throw error;
      });

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'invalid_signature')
        .send(JSON.stringify({ type: 'test' }));

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_SIGNATURE');
    });

    it('should process valid webhook events', async () => {
      stripeService.constructWebhookEvent.mockReturnValue({
        id: 'evt_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            metadata: { tenantId: 'test-tenant' },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000,
            items: { data: [{ price: { id: 'price_123', recurring: { interval: 'month' } } }] },
          },
        },
      });

      const mockSubscription = {
        id: '123',
        tenantId: 'test-tenant',
        status: 'active',
        updateFromStripe: jest.fn().mockImplementation(function() {
          return Promise.resolve(this);
        }),
        toSafeObject: function() {
          return {
            id: this.id,
            tenantId: this.tenantId,
            status: this.status,
          };
        },
        isActive: () => true,
        hasAccess: () => true,
      };

      mockSubscriptionModel.findOne.mockResolvedValue(null);
      mockSubscriptionModel.create.mockResolvedValue(mockSubscription);

      mockTenantModel.findOne.mockResolvedValue({
        tenantId: 'test-tenant',
        status: 'pending',
        transitionTo: jest.fn(),
        save: jest.fn(),
      });

      const response = await request(app)
        .post('/api/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .set('stripe-signature', 'valid_signature')
        .send(JSON.stringify({ type: 'test' }));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.received).toBe(true);
    });
  });
});

describe('Subscription Model', () => {
  describe('SUBSCRIPTION_STATUS', () => {
    it('should have correct status values', () => {
      const { SUBSCRIPTION_STATUS } = require('../src/modules/billing/subscription.model');
      
      expect(SUBSCRIPTION_STATUS.INCOMPLETE).toBe('incomplete');
      expect(SUBSCRIPTION_STATUS.ACTIVE).toBe('active');
      expect(SUBSCRIPTION_STATUS.CANCELED).toBe('canceled');
      expect(SUBSCRIPTION_STATUS.TRIALING).toBe('trialing');
      expect(SUBSCRIPTION_STATUS.PAST_DUE).toBe('past_due');
    });
  });

  describe('PLAN_CONFIG', () => {
    it('should have correct pricing', () => {
      const { PLAN_CONFIG } = require('../src/modules/billing/subscription.model');
      
      expect(PLAN_CONFIG.MONTHLY_PRICE).toBe(29500); // $295.00
      expect(PLAN_CONFIG.TRIAL_DAYS).toBe(15); // 15-day trial
    });
  });

  describe('BILLING_INTERVAL', () => {
    it('should have correct interval values', () => {
      const { BILLING_INTERVAL } = require('../src/modules/billing/subscription.model');
      
      expect(BILLING_INTERVAL.MONTH).toBe('month');
      expect(BILLING_INTERVAL.YEAR).toBe('year');
    });
  });
});
