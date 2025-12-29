/**
 * Admin Module Tests
 * Tests for admin functionality
 */
const request = require('supertest');

// Set test environment first
process.env.NODE_ENV = 'test';
process.env.ADMIN_PASSWORD = 'test-admin-password';

// Define mocks before requiring anything else
const mockTenantModel = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockUserModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockAppointmentModel = {
  count: jest.fn(),
  findAll: jest.fn(),
};

const mockEmployeeModel = {
  count: jest.fn(),
  findAll: jest.fn(),
};

const mockServiceModel = {
  count: jest.fn(),
  findAll: jest.fn(),
};

const mockCallLogModel = {
  count: jest.fn(),
  findAll: jest.fn(),
};

const mockSubscriptionModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockBusinessTypeModel = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
};

// Mock all required models
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
}));

jest.mock('../src/modules/appointments/appointment.model', () => ({
  Appointment: mockAppointmentModel,
  APPOINTMENT_STATUS: {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  },
}));

jest.mock('../src/modules/employees/employee.model', () => ({
  Employee: mockEmployeeModel,
  EMPLOYEE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
}));

jest.mock('../src/modules/services/service.model', () => ({
  Service: mockServiceModel,
  SERVICE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
}));

jest.mock('../src/modules/telephony/callLog.model', () => ({
  CallLog: mockCallLogModel,
  CALL_STATUS: {
    RINGING: 'ringing',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    NO_ANSWER: 'no_answer',
    BUSY: 'busy',
    FAILED: 'failed',
  },
}));

jest.mock('../src/modules/billing/subscription.model', () => ({
  Subscription: mockSubscriptionModel,
  SUBSCRIPTION_STATUS: {
    TRIALING: 'trialing',
    ACTIVE: 'active',
  },
  PLAN_CONFIG: {
    TRIAL_DAYS: 15,
  },
}));

jest.mock('../src/modules/business-types/businessType.model', () => ({
  BusinessType: mockBusinessTypeModel,
}));

jest.mock('../src/utils/tenant', () => ({
  getTenantUUID: jest.fn().mockResolvedValue('tenant-uuid-123'),
}));

const { app } = require('../src/app');

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/clients', () => {
    const validPassword = 'test-admin-password';
    
    it('should return 401 when no admin password is provided', async () => {
      const response = await request(app).get('/api/admin/clients');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when invalid admin password is provided', async () => {
      const response = await request(app)
        .get('/api/admin/clients')
        .set('X-Admin-Password', 'wrong-password');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PASSWORD');
    });

    it('should return list of clients when valid admin password is provided', async () => {
      const mockTenants = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Business 1',
          slug: 'test-business-1',
          status: 'active',
          planType: 'free',
          contactEmail: 'test1@example.com',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Test Business 2',
          slug: 'test-business-2',
          status: 'pending',
          planType: 'basic',
          contactEmail: 'test2@example.com',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-16'),
        },
      ];

      mockTenantModel.findAll.mockResolvedValue(mockTenants);

      const response = await request(app)
        .get('/api/admin/clients')
        .set('X-Admin-Password', validPassword);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      
      // Verify first client data
      expect(response.body.data.clients[0]).toMatchObject({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Business 1',
        slug: 'test-business-1',
        status: 'active',
        planType: 'free',
        contactEmail: 'test1@example.com',
      });
      
      // Verify dates are included
      expect(response.body.data.clients[0].signUpDate).toBeDefined();
      expect(response.body.data.clients[0].lastUpdated).toBeDefined();

      // Verify findAll was called with correct parameters
      expect(mockTenantModel.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'name', 'slug', 'status', 'planType', 'contactEmail', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'DESC']],
      });
    });

    it('should return empty list when no clients exist', async () => {
      mockTenantModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/admin/clients')
        .set('X-Admin-Password', validPassword);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockTenantModel.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/admin/clients')
        .set('X-Admin-Password', validPassword);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('FETCH_CLIENTS_FAILED');
    });
  });

  describe('Admin Password Configuration', () => {
    it('should work with password from environment variable', async () => {
      mockTenantModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/admin/clients')
        .set('X-Admin-Password', process.env.ADMIN_PASSWORD);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
