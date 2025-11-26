/**
 * Employee Tests
 * Tests for employee module functionality
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockEmployeeModel = {
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  generateDefaultSchedule: jest.fn(() => ({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '14:00', enabled: false },
    sunday: { start: '10:00', end: '14:00', enabled: false },
  })),
};

const mockUserModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

// Mock models BEFORE requiring the app
jest.mock('../src/modules/employees/employee.model', () => ({
  Employee: mockEmployeeModel,
  EMPLOYEE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ON_LEAVE: 'on_leave',
  },
  EMPLOYEE_TYPES: {
    EMPLOYEE: 'employee',
    CONTRACTOR: 'contractor',
  },
}));

jest.mock('../src/models', () => ({
  User: mockUserModel,
  Employee: mockEmployeeModel,
  EMPLOYEE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ON_LEAVE: 'on_leave',
  },
  EMPLOYEE_TYPES: {
    EMPLOYEE: 'employee',
    CONTRACTOR: 'contractor',
  },
  Tenant: {
    findOne: jest.fn(),
    create: jest.fn(),
    generateDefaultSettings: jest.fn(() => ({})),
    isValidTransition: jest.fn(),
  },
  TENANT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
  },
  PLAN_TYPES: {
    FREE: 'free',
  },
  Service: {
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    generateDefaultServices: jest.fn(() => []),
  },
  SERVICE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
  SERVICE_CATEGORIES: {
    OTHER: 'other',
  },
}));

// Now require the app AFTER the mocks are in place
const { app } = require('../src/app');
const jwtUtils = require('../src/modules/auth/jwt.utils');

describe('Employee Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validToken = () => jwtUtils.generateAccessToken({
    userId: '123',
    email: 'test@example.com',
    tenantId: 'test-tenant',
  });

  describe('GET /api/employees', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should return employees list with valid token', async () => {
      const mockEmployees = {
        rows: [
          {
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            tenantId: 'test-tenant',
            toSafeObject: function() { return { id: this.id, firstName: this.firstName, lastName: this.lastName, email: this.email }; },
          },
        ],
        count: 1,
      };
      mockEmployeeModel.findAndCountAll.mockResolvedValue(mockEmployees);

      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.employees).toBeDefined();
      expect(response.body.data.total).toBe(1);
    });
  });

  describe('POST /api/employees', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('X-Tenant-ID', 'test-tenant')
        .send({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });

      expect(response.status).toBe(401);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ firstName: 'John' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ firstName: 'John', lastName: 'Doe', email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    it('should return 400 when employee with email already exists', async () => {
      mockEmployeeModel.findOne.mockResolvedValue({ id: '123', email: 'john@example.com' });

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('EMPLOYEE_EXISTS');
    });

    it('should create employee successfully with valid data', async () => {
      mockEmployeeModel.findOne.mockResolvedValue(null);
      
      const mockEmployee = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        tenantId: 'test-tenant',
        status: 'active',
        toSafeObject: function() {
          return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            status: this.status,
          };
        },
      };
      mockEmployeeModel.create.mockResolvedValue(mockEmployee);

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.employee).toBeDefined();
      expect(response.body.data.employee.firstName).toBe('John');
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should return 404 when employee not found', async () => {
      mockEmployeeModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/employees/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('EMPLOYEE_NOT_FOUND');
    });

    it('should return employee with valid ID', async () => {
      const mockEmployee = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        toSafeObject: function() {
          return { id: this.id, firstName: this.firstName, lastName: this.lastName, email: this.email };
        },
      };
      mockEmployeeModel.findOne.mockResolvedValue(mockEmployee);

      const response = await request(app)
        .get('/api/employees/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.employee.firstName).toBe('John');
    });
  });

  describe('PATCH /api/employees/:id', () => {
    it('should return 404 when employee not found', async () => {
      mockEmployeeModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/employees/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ firstName: 'Jane' });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('EMPLOYEE_NOT_FOUND');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .patch('/api/employees/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    it('should update employee successfully', async () => {
      const mockEmployee = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        update: jest.fn().mockResolvedValue(true),
        toSafeObject: function() {
          return { id: this.id, firstName: 'Jane', lastName: this.lastName, email: this.email };
        },
      };
      mockEmployeeModel.findOne.mockResolvedValue(mockEmployee);

      const response = await request(app)
        .patch('/api/employees/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ firstName: 'Jane' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockEmployee.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should return 404 when employee not found', async () => {
      mockEmployeeModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/employees/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('EMPLOYEE_NOT_FOUND');
    });

    it('should delete employee successfully', async () => {
      const mockEmployee = {
        id: '123',
        destroy: jest.fn().mockResolvedValue(true),
      };
      mockEmployeeModel.findOne.mockResolvedValue(mockEmployee);

      const response = await request(app)
        .delete('/api/employees/123')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockEmployee.destroy).toHaveBeenCalled();
    });
  });

  describe('GET /api/employees/:id/schedule', () => {
    it('should return 404 when employee not found', async () => {
      mockEmployeeModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/employees/123/schedule')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('EMPLOYEE_NOT_FOUND');
    });

    it('should return employee schedule', async () => {
      const mockEmployee = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        schedule: {
          monday: { start: '09:00', end: '17:00', enabled: true },
        },
        getFullName: function() { return `${this.firstName} ${this.lastName}`; },
      };
      mockEmployeeModel.findOne.mockResolvedValue(mockEmployee);

      const response = await request(app)
        .get('/api/employees/123/schedule')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.schedule).toBeDefined();
    });
  });

  describe('PUT /api/employees/:id/schedule', () => {
    it('should return 400 when schedule is missing', async () => {
      const response = await request(app)
        .put('/api/employees/123/schedule')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when employee not found', async () => {
      mockEmployeeModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/employees/123/schedule')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ schedule: { monday: { start: '10:00', end: '18:00', enabled: true } } });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('EMPLOYEE_NOT_FOUND');
    });

    it('should update employee schedule successfully', async () => {
      const mockEmployee = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        schedule: {
          monday: { start: '09:00', end: '17:00', enabled: true },
        },
        getFullName: function() { return `${this.firstName} ${this.lastName}`; },
        updateSchedule: jest.fn().mockImplementation(function(newSchedule) {
          this.schedule = { ...this.schedule, ...newSchedule };
          return Promise.resolve(this);
        }),
      };
      mockEmployeeModel.findOne.mockResolvedValue(mockEmployee);

      const response = await request(app)
        .put('/api/employees/123/schedule')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ schedule: { monday: { start: '10:00', end: '18:00', enabled: true } } });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockEmployee.updateSchedule).toHaveBeenCalled();
    });
  });
});
