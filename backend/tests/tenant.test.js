/**
 * Tenant Tests
 * Tests for tenant module functionality
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockTenantModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  generateDefaultSettings: jest.fn(() => ({
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'USD',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    businessHours: {
      monday: { open: '09:00', close: '17:00', enabled: true },
      tuesday: { open: '09:00', close: '17:00', enabled: true },
      wednesday: { open: '09:00', close: '17:00', enabled: true },
      thursday: { open: '09:00', close: '17:00', enabled: true },
      friday: { open: '09:00', close: '17:00', enabled: true },
      saturday: { open: '10:00', close: '14:00', enabled: false },
      sunday: { open: '10:00', close: '14:00', enabled: false },
    },
  })),
  isValidTransition: jest.fn((from, to) => {
    const transitions = {
      pending: ['active', 'cancelled'],
      active: ['suspended', 'cancelled'],
      suspended: ['active', 'cancelled'],
      cancelled: [],
    };
    return transitions[from] && transitions[from].includes(to);
  }),
};

const mockUserModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

// Mock both the tenant model and the models index BEFORE requiring the app
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

jest.mock('../src/models', () => ({
  User: mockUserModel,
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

// Now require the app AFTER the mocks are in place
const { app } = require('../src/app');
const jwtUtils = require('../src/modules/auth/jwt.utils');
const { TENANT_STATUS, PLAN_TYPES, VALID_TRANSITIONS } = require('../src/modules/tenants/tenant.model');;

describe('Tenant Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/tenant (Create Tenant)', () => {
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/tenant')
        .send({ name: 'Test Salon' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid slug format', async () => {
      const response = await request(app)
        .post('/api/tenant')
        .send({
          name: 'Test Salon',
          slug: 'Invalid Slug!',
          contactEmail: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Slug');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/tenant')
        .send({
          name: 'Test Salon',
          slug: 'test-salon',
          contactEmail: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    it('should return 400 when tenant slug already exists', async () => {
      mockTenantModel.findOne.mockResolvedValue({ id: '123', slug: 'test-salon' });

      const response = await request(app)
        .post('/api/tenant')
        .send({
          name: 'Test Salon',
          slug: 'test-salon',
          contactEmail: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('TENANT_EXISTS');
    });

    it('should create tenant successfully with valid data', async () => {
      mockTenantModel.findOne.mockResolvedValue(null);
      
      const mockTenantInstance = {
        id: '123',
        tenantId: 'test-salon',
        name: 'Test Salon',
        slug: 'test-salon',
        contactEmail: 'test@example.com',
        status: 'pending',
        planType: 'free',
        settings: {},
        toSafeObject: () => ({
          id: '123',
          tenantId: 'test-salon',
          name: 'Test Salon',
          slug: 'test-salon',
          contactEmail: 'test@example.com',
          status: 'pending',
          planType: 'free',
          settings: {},
        }),
      };
      mockTenantModel.create.mockResolvedValue(mockTenantInstance);

      const response = await request(app)
        .post('/api/tenant')
        .send({
          name: 'Test Salon',
          slug: 'test-salon',
          contactEmail: 'test@example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tenant).toBeDefined();
      expect(response.body.data.tenant.name).toBe('Test Salon');
    });
  });

  describe('Protected Tenant Routes', () => {
    const validToken = () => jwtUtils.generateAccessToken({
      userId: '123',
      email: 'test@example.com',
      tenantId: 'test-tenant',
    });

    describe('GET /api/tenant', () => {
      it('should return 401 without authentication', async () => {
        const response = await request(app)
          .get('/api/tenant')
          .set('X-Tenant-ID', 'test-tenant');

        expect(response.status).toBe(401);
      });

      it('should return tenant info with valid token', async () => {
        const mockTenantInstance = {
          id: '123',
          tenantId: 'test-tenant',
          name: 'Test Salon',
          status: 'active',
          toSafeObject: () => ({
            id: '123',
            tenantId: 'test-tenant',
            name: 'Test Salon',
            status: 'active',
          }),
        };
        mockTenantModel.findOne.mockResolvedValue(mockTenantInstance);

        const response = await request(app)
          .get('/api/tenant')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.tenant).toBeDefined();
      });

      it('should return 404 when tenant not found', async () => {
        mockTenantModel.findOne.mockResolvedValue(null);

        const response = await request(app)
          .get('/api/tenant')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant');

        expect(response.status).toBe(404);
        expect(response.body.code).toBe('TENANT_NOT_FOUND');
      });
    });

    describe('GET /api/tenant/settings', () => {
      it('should return 401 without authentication', async () => {
        const response = await request(app)
          .get('/api/tenant/settings')
          .set('X-Tenant-ID', 'test-tenant');

        expect(response.status).toBe(401);
      });

      it('should return tenant settings with valid token', async () => {
        const mockTenantInstance = {
          tenantId: 'test-tenant',
          name: 'Test Salon',
          settings: { timezone: 'UTC' },
          planType: 'free',
          status: 'active',
        };
        mockTenantModel.findOne.mockResolvedValue(mockTenantInstance);

        const response = await request(app)
          .get('/api/tenant/settings')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.settings).toBeDefined();
      });
    });

    describe('PATCH /api/tenant/settings', () => {
      it('should return 401 without authentication', async () => {
        const response = await request(app)
          .patch('/api/tenant/settings')
          .set('X-Tenant-ID', 'test-tenant')
          .send({ settings: { timezone: 'America/New_York' } });

        expect(response.status).toBe(401);
      });

      it('should return 400 when settings object is missing', async () => {
        const response = await request(app)
          .patch('/api/tenant/settings')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should update settings successfully', async () => {
        const mockTenantInstance = {
          tenantId: 'test-tenant',
          name: 'Test Salon',
          settings: { timezone: 'UTC' },
          planType: 'free',
          status: 'active',
          updateSettings: jest.fn().mockImplementation(function(newSettings) {
            this.settings = { ...this.settings, ...newSettings };
            return Promise.resolve(this);
          }),
        };
        mockTenantModel.findOne.mockResolvedValue(mockTenantInstance);

        const response = await request(app)
          .patch('/api/tenant/settings')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant')
          .send({ settings: { timezone: 'America/New_York' } });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(mockTenantInstance.updateSettings).toHaveBeenCalled();
      });
    });

    describe('POST /api/tenant/activate', () => {
      it('should return 401 without authentication', async () => {
        const response = await request(app)
          .post('/api/tenant/activate')
          .set('X-Tenant-ID', 'test-tenant');

        expect(response.status).toBe(401);
      });

      it('should activate pending tenant', async () => {
        const mockTenantInstance = {
          tenantId: 'test-tenant',
          name: 'Test Salon',
          status: 'pending',
          transitionTo: jest.fn().mockImplementation(function(newStatus) {
            this.status = newStatus;
            return Promise.resolve(this);
          }),
          save: jest.fn().mockResolvedValue(true),
          toSafeObject: function() {
            return {
              tenantId: this.tenantId,
              name: this.name,
              status: this.status,
            };
          },
        };
        mockTenantModel.findOne.mockResolvedValue(mockTenantInstance);

        const response = await request(app)
          .post('/api/tenant/activate')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(mockTenantInstance.transitionTo).toHaveBeenCalledWith('active');
      });

      it('should return 400 for non-pending tenant', async () => {
        const mockTenantInstance = {
          tenantId: 'test-tenant',
          name: 'Test Salon',
          status: 'active',
        };
        mockTenantModel.findOne.mockResolvedValue(mockTenantInstance);

        const response = await request(app)
          .post('/api/tenant/activate')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant');

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('INVALID_STATUS_TRANSITION');
      });
    });

    describe('PATCH /api/tenant/status', () => {
      it('should return 400 when status is missing', async () => {
        const response = await request(app)
          .patch('/api/tenant/status')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should return 400 for invalid status', async () => {
        const mockTenantInstance = {
          tenantId: 'test-tenant',
          status: 'active',
        };
        mockTenantModel.findOne.mockResolvedValue(mockTenantInstance);

        const response = await request(app)
          .patch('/api/tenant/status')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant')
          .send({ status: 'invalid-status' });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('INVALID_STATUS');
      });
    });

    describe('PATCH /api/tenant', () => {
      it('should return 400 for invalid email format', async () => {
        const response = await request(app)
          .patch('/api/tenant')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant')
          .send({ contactEmail: 'invalid-email' });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('email');
      });

      it('should update tenant successfully', async () => {
        const mockTenantInstance = {
          tenantId: 'test-tenant',
          name: 'Test Salon',
          contactEmail: 'test@example.com',
          update: jest.fn().mockResolvedValue(true),
          toSafeObject: () => ({
            tenantId: 'test-tenant',
            name: 'Updated Salon',
            contactEmail: 'updated@example.com',
          }),
        };
        mockTenantModel.findOne.mockResolvedValue(mockTenantInstance);

        const response = await request(app)
          .patch('/api/tenant')
          .set('Authorization', `Bearer ${validToken()}`)
          .set('X-Tenant-ID', 'test-tenant')
          .send({ name: 'Updated Salon', contactEmail: 'updated@example.com' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(mockTenantInstance.update).toHaveBeenCalled();
      });
    });
  });

  describe('GET /api/me (Current User & Tenant)', () => {
    const validToken = () => jwtUtils.generateAccessToken({
      userId: '123',
      email: 'test@example.com',
      tenantId: 'test-tenant',
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should return user and tenant context with valid token', async () => {
      const mockUserInstance = {
        id: '123',
        email: 'test@example.com',
        tenantId: 'test-tenant',
        toSafeObject: () => ({
          id: '123',
          email: 'test@example.com',
          tenantId: 'test-tenant',
        }),
      };
      mockUserModel.findOne.mockResolvedValue(mockUserInstance);

      const mockTenantInstance = {
        tenantId: 'test-tenant',
        name: 'Test Salon',
        toSafeObject: () => ({
          tenantId: 'test-tenant',
          name: 'Test Salon',
        }),
      };
      mockTenantModel.findOne.mockResolvedValue(mockTenantInstance);

      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tenant).toBeDefined();
    });

    it('should return 404 when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('USER_NOT_FOUND');
    });

    it('should handle missing tenant gracefully', async () => {
      const mockUserInstance = {
        id: '123',
        email: 'test@example.com',
        tenantId: 'default',
        toSafeObject: () => ({
          id: '123',
          email: 'test@example.com',
          tenantId: 'default',
        }),
      };
      mockUserModel.findOne.mockResolvedValue(mockUserInstance);
      mockTenantModel.findOne.mockResolvedValue(null);

      const token = jwtUtils.generateAccessToken({
        userId: '123',
        email: 'test@example.com',
        tenantId: 'default',
      });

      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant-ID', 'default');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      // Should return basic tenant context even if tenant record doesn't exist
      expect(response.body.data.tenant.tenantId).toBe('default');
    });
  });
});
