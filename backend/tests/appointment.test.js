/**
 * Appointment Tests
 * Tests for appointment module functionality
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockAppointmentModel = {
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
};

const mockEmployeeModel = {
  findOne: jest.fn(),
  findAll: jest.fn(),
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

const mockServiceModel = {
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  generateDefaultServices: jest.fn(() => []),
};

const mockBusinessTypeModel = {
  findByPk: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockUserModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

// Mock models BEFORE requiring the app
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
  CANCELLATION_REASONS: {
    CUSTOMER_REQUEST: 'customer_request',
    EMPLOYEE_UNAVAILABLE: 'employee_unavailable',
    RESCHEDULE: 'reschedule',
    NO_SHOW: 'no_show',
    OTHER: 'other',
  },
}));

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

jest.mock('../src/modules/business-types/businessType.model', () => ({
  BusinessType: mockBusinessTypeModel,
}));

jest.mock('../src/models', () => ({
  User: mockUserModel,
  Appointment: mockAppointmentModel,
  APPOINTMENT_STATUS: {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  },
  CANCELLATION_REASONS: {
    CUSTOMER_REQUEST: 'customer_request',
    EMPLOYEE_UNAVAILABLE: 'employee_unavailable',
    RESCHEDULE: 'reschedule',
    NO_SHOW: 'no_show',
    OTHER: 'other',
  },
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
}));

// Mock tenant utility
jest.mock('../src/utils/tenant', () => ({
  getTenantUUID: jest.fn().mockResolvedValue('tenant-uuid-123'),
}));

// Now require the app AFTER the mocks are in place
const { app } = require('../src/app');
const jwtUtils = require('../src/modules/auth/jwt.utils');

describe('Appointment Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validToken = () => jwtUtils.generateAccessToken({
    userId: '123',
    email: 'test@example.com',
    tenantId: 'test-tenant',
  });

  const mockEmployeeId = '11111111-1111-1111-1111-111111111111';
  const mockServiceId = '22222222-2222-2222-2222-222222222222';
  const mockAppointmentId = '33333333-3333-3333-3333-333333333333';

  // Helper to create a future date (tomorrow at 10:00)
  const getFutureDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);
    return date;
  };

  describe('GET /api/appointments', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should return appointments list with valid token', async () => {
      const mockAppointments = {
        rows: [
          {
            id: mockAppointmentId,
            employeeId: mockEmployeeId,
            serviceId: mockServiceId,
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            startTime: getFutureDate(),
            status: 'scheduled',
            toSafeObject: function() {
              return {
                id: this.id,
                employeeId: this.employeeId,
                customerName: this.customerName,
                status: this.status,
              };
            },
          },
        ],
        count: 1,
      };
      mockAppointmentModel.findAndCountAll.mockResolvedValue(mockAppointments);

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.appointments).toBeDefined();
      expect(response.body.data.total).toBe(1);
    });

    it('should filter by status', async () => {
      const mockAppointments = {
        rows: [],
        count: 0,
      };
      mockAppointmentModel.findAndCountAll.mockResolvedValue(mockAppointments);

      const response = await request(app)
        .get('/api/appointments?status=scheduled')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(mockAppointmentModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'scheduled' }),
        })
      );
    });

    it('should filter by employeeId', async () => {
      const mockAppointments = {
        rows: [],
        count: 0,
      };
      mockAppointmentModel.findAndCountAll.mockResolvedValue(mockAppointments);

      const response = await request(app)
        .get(`/api/appointments?employeeId=${mockEmployeeId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(mockAppointmentModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ employeeId: mockEmployeeId }),
        })
      );
    });
  });

  describe('POST /api/appointments', () => {
    it('should accept requests without authentication', async () => {
      const futureDate = getFutureDate();
      
      mockEmployeeModel.findOne.mockResolvedValue({
        id: mockEmployeeId,
        serviceIds: [mockServiceId],
      });
      mockServiceModel.findOne.mockResolvedValue({
        id: mockServiceId,
        duration: 60,
        price: 50.00,
        addOns: [],
      });
      // No conflicts
      mockAppointmentModel.findAll.mockResolvedValue([]);
      
      const endDate = new Date(futureDate.getTime() + 60 * 60 * 1000);
      const mockAppointment = {
        id: mockAppointmentId,
        employeeId: mockEmployeeId,
        serviceId: mockServiceId,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startTime: futureDate,
        endTime: endDate,
        status: 'scheduled',
        toSafeObject: function() {
          return {
            id: this.id,
            employeeId: this.employeeId,
            serviceId: this.serviceId,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            startTime: this.startTime,
            endTime: this.endTime,
            status: this.status,
          };
        },
      };
      mockAppointmentModel.create.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .post('/api/appointments')
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ customerName: 'John Doe' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid email format', async () => {
      const futureDate = getFutureDate();
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'invalid-email',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    it('should return 400 for invalid UUID format', async () => {
      const futureDate = getFutureDate();
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: 'invalid-uuid',
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('employee ID');
    });

    it('should return 400 for past start time', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          startTime: pastDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('future');
    });

    it('should return 404 when employee not found', async () => {
      mockEmployeeModel.findOne.mockResolvedValue(null);
      const futureDate = getFutureDate();

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('EMPLOYEE_NOT_FOUND');
    });

    it('should return 404 when service not found', async () => {
      const futureDate = getFutureDate();
      mockEmployeeModel.findOne.mockResolvedValue({
        id: mockEmployeeId,
        serviceIds: [mockServiceId],
      });
      mockServiceModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('SERVICE_NOT_FOUND');
    });

    it('should return 400 when employee is not qualified for service', async () => {
      const futureDate = getFutureDate();
      mockEmployeeModel.findOne.mockResolvedValue({
        id: mockEmployeeId,
        serviceIds: ['other-service-id'],
      });
      mockServiceModel.findOne.mockResolvedValue({
        id: mockServiceId,
        duration: 60,
        price: 50.00,
      });

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('EMPLOYEE_NOT_QUALIFIED');
    });

    it('should return 409 when time slot has conflict', async () => {
      const futureDate = getFutureDate();
      
      mockEmployeeModel.findOne.mockResolvedValue({
        id: mockEmployeeId,
        serviceIds: [mockServiceId],
      });
      mockServiceModel.findOne.mockResolvedValue({
        id: mockServiceId,
        duration: 60,
        price: 50.00,
        addOns: [],
      });
      // Return a conflicting appointment
      mockAppointmentModel.findAll.mockResolvedValue([
        {
          id: 'existing-appointment',
          startTime: futureDate,
          endTime: new Date(futureDate.getTime() + 60 * 60 * 1000),
          toSafeObject: function() { return { id: this.id }; },
        },
      ]);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('TIME_SLOT_CONFLICT');
    });

    it('should create appointment successfully with valid data', async () => {
      const futureDate = getFutureDate();
      
      mockEmployeeModel.findOne.mockResolvedValue({
        id: mockEmployeeId,
        serviceIds: [mockServiceId],
      });
      mockServiceModel.findOne.mockResolvedValue({
        id: mockServiceId,
        duration: 60,
        price: 50.00,
        addOns: [],
      });
      // No conflicts
      mockAppointmentModel.findAll.mockResolvedValue([]);
      
      const endDate = new Date(futureDate.getTime() + 60 * 60 * 1000);
      const mockAppointment = {
        id: mockAppointmentId,
        employeeId: mockEmployeeId,
        serviceId: mockServiceId,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startTime: futureDate,
        endTime: endDate,
        status: 'scheduled',
        toSafeObject: function() {
          return {
            id: this.id,
            employeeId: this.employeeId,
            serviceId: this.serviceId,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            startTime: this.startTime,
            endTime: this.endTime,
            status: this.status,
          };
        },
      };
      mockAppointmentModel.create.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment).toBeDefined();
      expect(response.body.data.appointment.customerName).toBe('John Doe');
    });

    it('should create appointment successfully without customer email', async () => {
      const futureDate = getFutureDate();
      
      mockEmployeeModel.findOne.mockResolvedValue({
        id: mockEmployeeId,
        serviceIds: [mockServiceId],
      });
      mockServiceModel.findOne.mockResolvedValue({
        id: mockServiceId,
        duration: 60,
        price: 50.00,
        addOns: [],
      });
      // No conflicts
      mockAppointmentModel.findAll.mockResolvedValue([]);
      
      const endDate = new Date(futureDate.getTime() + 60 * 60 * 1000);
      const mockAppointment = {
        id: mockAppointmentId,
        employeeId: mockEmployeeId,
        serviceId: mockServiceId,
        customerName: 'Jane Doe',
        customerEmail: null,
        startTime: futureDate,
        endTime: endDate,
        status: 'scheduled',
        toSafeObject: function() {
          return {
            id: this.id,
            employeeId: this.employeeId,
            serviceId: this.serviceId,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            startTime: this.startTime,
            endTime: this.endTime,
            status: this.status,
          };
        },
      };
      mockAppointmentModel.create.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          employeeId: mockEmployeeId,
          serviceId: mockServiceId,
          customerName: 'Jane Doe',
          startTime: futureDate.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.customerName).toBe('Jane Doe');
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should return 404 when appointment not found', async () => {
      mockAppointmentModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('APPOINTMENT_NOT_FOUND');
    });

    it('should return appointment with valid ID', async () => {
      const mockAppointment = {
        id: mockAppointmentId,
        customerName: 'John Doe',
        status: 'scheduled',
        toSafeObject: function() {
          return { id: this.id, customerName: this.customerName, status: this.status };
        },
      };
      mockAppointmentModel.findOne.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .get(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.customerName).toBe('John Doe');
    });
  });

  describe('PATCH /api/appointments/:id', () => {
    it('should return 404 when appointment not found', async () => {
      mockAppointmentModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ notes: 'Updated notes' });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('APPOINTMENT_NOT_FOUND');
    });

    it('should return 400 when appointment cannot be modified', async () => {
      const mockAppointment = {
        id: mockAppointmentId,
        status: 'completed',
        canBeModified: jest.fn().mockReturnValue(false),
      };
      mockAppointmentModel.findOne.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .patch(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ notes: 'Updated notes' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('APPOINTMENT_NOT_MODIFIABLE');
    });

    it('should update appointment notes successfully', async () => {
      const mockAppointment = {
        id: mockAppointmentId,
        customerName: 'John Doe',
        notes: null,
        status: 'scheduled',
        canBeModified: jest.fn().mockReturnValue(true),
        save: jest.fn().mockResolvedValue(true),
        toSafeObject: function() {
          return { id: this.id, customerName: this.customerName, notes: this.notes };
        },
      };
      mockAppointmentModel.findOne.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .patch(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ notes: 'Updated notes' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockAppointment.save).toHaveBeenCalled();
    });

    it('should return 400 for invalid email format on update', async () => {
      const response = await request(app)
        .patch(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ customerEmail: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should return 400 when cancellation reason is missing', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when appointment not found', async () => {
      mockAppointmentModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ reason: 'customer_request' });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('APPOINTMENT_NOT_FOUND');
    });

    it('should return 400 when appointment cannot be cancelled', async () => {
      const mockAppointment = {
        id: mockAppointmentId,
        status: 'completed',
        canBeCancelled: jest.fn().mockReturnValue(false),
      };
      mockAppointmentModel.findOne.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .delete(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ reason: 'customer_request' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('APPOINTMENT_NOT_CANCELLABLE');
    });

    it('should return 400 for invalid cancellation reason', async () => {
      const mockAppointment = {
        id: mockAppointmentId,
        status: 'scheduled',
        canBeCancelled: jest.fn().mockReturnValue(true),
      };
      mockAppointmentModel.findOne.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .delete(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ reason: 'invalid_reason' });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_CANCELLATION_REASON');
    });

    it('should cancel appointment successfully with valid reason', async () => {
      const mockAppointment = {
        id: mockAppointmentId,
        status: 'scheduled',
        canBeCancelled: jest.fn().mockReturnValue(true),
        cancel: jest.fn().mockResolvedValue(true),
        toSafeObject: function() {
          return { id: this.id, status: 'cancelled', cancellationReason: 'customer_request' };
        },
      };
      mockAppointmentModel.findOne.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .delete(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ reason: 'customer_request', notes: 'Customer changed plans' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockAppointment.cancel).toHaveBeenCalledWith('customer_request', 'Customer changed plans');
    });

    it('should hard delete appointment when hardDelete is true', async () => {
      const mockAppointment = {
        id: mockAppointmentId,
        destroy: jest.fn().mockResolvedValue(true),
      };
      mockAppointmentModel.findOne.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .delete(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({ hardDelete: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockAppointment.destroy).toHaveBeenCalled();
    });
  });
});

describe('Availability Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validToken = () => jwtUtils.generateAccessToken({
    userId: '123',
    email: 'test@example.com',
    tenantId: 'test-tenant',
  });

  const mockEmployeeId = '11111111-1111-1111-1111-111111111111';
  const mockServiceId = '22222222-2222-2222-2222-222222222222';

  describe('GET /api/availability', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/availability')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should return 400 when serviceId is missing', async () => {
      const response = await request(app)
        .get('/api/availability')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid service ID format', async () => {
      const response = await request(app)
        .get('/api/availability?serviceId=invalid-uuid')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('service ID');
    });

    it('should return 404 when service not found', async () => {
      mockServiceModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/availability?serviceId=${mockServiceId}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('SERVICE_NOT_FOUND');
    });

    it('should return availability for a specific date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockEmployee = {
        id: mockEmployeeId,
        firstName: 'John',
        lastName: 'Doe',
        serviceIds: [mockServiceId],
        schedule: {
          monday: { start: '09:00', end: '17:00', enabled: true },
          tuesday: { start: '09:00', end: '17:00', enabled: true },
          wednesday: { start: '09:00', end: '17:00', enabled: true },
          thursday: { start: '09:00', end: '17:00', enabled: true },
          friday: { start: '09:00', end: '17:00', enabled: true },
          saturday: { start: '10:00', end: '14:00', enabled: true },
          sunday: { start: '10:00', end: '14:00', enabled: true },
        },
        getFullName: function() { return `${this.firstName} ${this.lastName}`; },
      };

      mockServiceModel.findOne.mockResolvedValue({
        id: mockServiceId,
        duration: 60,
      });
      mockEmployeeModel.findAll.mockResolvedValue([mockEmployee]);
      mockEmployeeModel.findOne.mockResolvedValue(mockEmployee);
      mockAppointmentModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/availability?serviceId=${mockServiceId}&date=${tomorrow.toISOString().split('T')[0]}`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.availability).toBeDefined();
    });

    it('should return 400 when start date is after end date', async () => {
      const response = await request(app)
        .get(`/api/availability?serviceId=${mockServiceId}&startDate=2024-12-31&endDate=2024-12-01`)
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Start date');
    });
  });
});
