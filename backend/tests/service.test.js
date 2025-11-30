/**
 * Service Tests
 * Tests for service module functionality
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockServiceModel = {
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  generateDefaultServices: jest.fn(() => [
    {
      name: 'Haircut',
      description: 'Standard haircut service',
      category: 'hair',
      duration: 45,
      price: 35.00,
      addOns: [],
    },
  ]),
};

const mockUserModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockTenantModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  generateDefaultSettings: jest.fn(() => ({})),
  isValidTransition: jest.fn(),
};

// Mock models BEFORE requiring the app
jest.mock('../src/modules/services/service.model', () => ({
  Service: mockServiceModel,
  SERVICE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
  SERVICE_CATEGORIES: {
    HAIR: 'hair',
    NAILS: 'nails',
    SKIN: 'skin',
    MAKEUP: 'makeup',
    MASSAGE: 'massage',
    OTHER: 'other',
  },
}));

// Mock the tenant model used by service controller
jest.mock('../src/modules/tenants/tenant.model', () => ({
  Tenant: mockTenantModel,
  TENANT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
  },
  PLAN_TYPES: {
    FREE: 'free',
  },
}));

jest.mock('../src/models', () => ({
  User: mockUserModel,
  Service: mockServiceModel,
  SERVICE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
  SERVICE_CATEGORIES: {
    HAIR: 'hair',
    NAILS: 'nails',
    SKIN: 'skin',
    MAKEUP: 'makeup',
    MASSAGE: 'massage',
    OTHER: 'other',
  },
  Tenant: mockTenantModel,
  TENANT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
  },
  PLAN_TYPES: {
    FREE: 'free',
  },
  Employee: {
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    generateDefaultSchedule: jest.fn(() => ({})),
  },
  EMPLOYEE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
  EMPLOYEE_TYPES: {
    EMPLOYEE: 'employee',
  },
}));

// Now require the app AFTER the mocks are in place
const { app } = require('../src/app');
const jwtUtils = require('../src/modules/auth/jwt.utils');

describe('Service Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default tenant mock - returns a tenant with UUID id
    mockTenantModel.findOne.mockResolvedValue({
      id: 'tenant-uuid-123',
      tenantId: 'test-tenant',
    });
  });

  const validToken = () => jwtUtils.generateAccessToken({
    userId: '123',
    email: 'test@example.com',
    tenantId: 'test-tenant',
  });

  describe('GET /api/services', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should return services list with valid token', async () => {
      const mockServices = {
        rows: [
          {
            id: '123',
            name: 'Haircut',
            description: 'Standard haircut',
            price: 35.00,
            tenantId: 'tenant-uuid-123',
            toSafeObject: function() { return { id: this.id, name: this.name, description: this.description, price: this.price }; },
          },
        ],
        count: 1,
      };
      mockServiceModel.findAndCountAll.mockResolvedValue(mockServices);

      const response = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toBeDefined();
      expect(response.body.data.total).toBe(1);
    });

    it('should filter by status', async () => {
      const mockServices = {
        rows: [],
        count: 0,
      };
      mockServiceModel.findAndCountAll.mockResolvedValue(mockServices);

      const response = await request(app)
        .get('/api/services?status=active')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(mockServiceModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        })
      );
    });

    it('should filter by category', async () => {
      const mockServices = {
        rows: [],
        count: 0,
      };
      mockServiceModel.findAndCountAll.mockResolvedValue(mockServices);

      const response = await request(app)
        .get('/api/services?category=hair')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(mockServiceModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'hair' }),
        })
      );
    });
  });

  describe('POST /api/services', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('X-Tenant-ID', 'test-tenant')
        .send({ name: 'Haircut' });

      expect(response.status).toBe(401);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for negative price', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ name: 'Haircut', price: -10 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Price');
    });

    it('should return 400 for invalid duration', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ name: 'Haircut', duration: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Duration');
    });

    it('should return 400 when service with name already exists', async () => {
      mockServiceModel.findOne.mockResolvedValue({ id: '123', name: 'Haircut' });

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ name: 'Haircut', price: 35.00, duration: 45 });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('SERVICE_EXISTS');
    });

    it('should create service successfully with valid data', async () => {
      mockServiceModel.findOne.mockResolvedValue(null);
      
      const mockService = {
        id: '123',
        name: 'Haircut',
        description: 'Standard haircut',
        price: 35.00,
        duration: 45,
        category: 'hair',
        tenantId: 'tenant-uuid-123',
        status: 'active',
        toSafeObject: function() {
          return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            duration: this.duration,
            category: this.category,
            status: this.status,
          };
        },
      };
      mockServiceModel.create.mockResolvedValue(mockService);

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ name: 'Haircut', description: 'Standard haircut', price: 35.00, duration: 45, category: 'hair' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.service).toBeDefined();
      expect(response.body.data.service.name).toBe('Haircut');
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return 404 when service not found', async () => {
      mockServiceModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/services/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('SERVICE_NOT_FOUND');
    });

    it('should return service with valid ID', async () => {
      const mockService = {
        id: '123',
        name: 'Haircut',
        price: 35.00,
        toSafeObject: function() {
          return { id: this.id, name: this.name, price: this.price };
        },
      };
      mockServiceModel.findOne.mockResolvedValue(mockService);

      const response = await request(app)
        .get('/api/services/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.service.name).toBe('Haircut');
    });
  });

  describe('PATCH /api/services/:id', () => {
    it('should return 404 when service not found', async () => {
      mockServiceModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/services/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ name: 'New Haircut' });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('SERVICE_NOT_FOUND');
    });

    it('should return 400 for negative price', async () => {
      const response = await request(app)
        .patch('/api/services/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ price: -10 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Price');
    });

    it('should return 400 for invalid duration', async () => {
      const response = await request(app)
        .patch('/api/services/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ duration: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Duration');
    });

    it('should update service successfully', async () => {
      const mockService = {
        id: '123',
        name: 'Haircut',
        price: 35.00,
        update: jest.fn().mockResolvedValue(true),
        toSafeObject: function() {
          return { id: this.id, name: 'Premium Haircut', price: 45.00 };
        },
      };
      // First call returns the service (for finding by ID), second call returns null (no duplicate)
      mockServiceModel.findOne
        .mockResolvedValueOnce(mockService)
        .mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/services/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ name: 'Premium Haircut', price: 45.00 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockService.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should return 404 when service not found', async () => {
      mockServiceModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/services/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('SERVICE_NOT_FOUND');
    });

    it('should delete service successfully', async () => {
      const mockService = {
        id: '123',
        destroy: jest.fn().mockResolvedValue(true),
      };
      mockServiceModel.findOne.mockResolvedValue(mockService);

      const response = await request(app)
        .delete('/api/services/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockService.destroy).toHaveBeenCalled();
    });
  });
});
