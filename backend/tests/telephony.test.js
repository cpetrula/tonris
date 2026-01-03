/**
 * Telephony Tests
 * Tests for telephony module functionality
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockCallLogModel = {
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
};

const mockTenantModel = {
  findOne: jest.fn(),
};

// Mock the call log model
jest.mock('../src/modules/telephony/callLog.model', () => ({
  CallLog: mockCallLogModel,
  CALL_DIRECTION: {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
  },
  CALL_STATUS: {
    INITIATED: 'initiated',
    RINGING: 'ringing',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    BUSY: 'busy',
    NO_ANSWER: 'no-answer',
    CANCELED: 'canceled',
    FAILED: 'failed',
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

// Add findAll mock to tenant model
mockTenantModel.findAll = jest.fn();

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
  CallLog: mockCallLogModel,
  CALL_DIRECTION: {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
  },
  CALL_STATUS: {
    INITIATED: 'initiated',
    COMPLETED: 'completed',
  },
}));

// Mock the twilio service
jest.mock('../src/modules/telephony/twilio.service', () => ({
  provisionPhoneNumber: jest.fn(),
  updatePhoneNumberWebhooks: jest.fn(),
  releasePhoneNumber: jest.fn(),
  sendSms: jest.fn(),
  makeCall: jest.fn(),
  getCall: jest.fn(),
  validateWebhookSignature: jest.fn(() => true),
  generateForwardToAiTwiml: jest.fn(() => '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Welcome</Say></Response>'),
  generateVoiceResponse: jest.fn((msg) => `<?xml version="1.0" encoding="UTF-8"?><Response><Say>${msg}</Say></Response>`),
  generateSmsResponse: jest.fn((msg) => `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`),
  getIncomingPhoneNumber: jest.fn(),
}));

// Now require the app AFTER the mocks are in place
const { app } = require('../src/app');
const jwtUtils = require('../src/modules/auth/jwt.utils');
const twilioService = require('../src/modules/telephony/twilio.service');

describe('Telephony Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validToken = () => jwtUtils.generateAccessToken({
    userId: '123',
    email: 'test@example.com',
    tenantId: 'test-tenant',
  });

  describe('POST /api/webhooks/twilio/voice', () => {
    it('should handle incoming voice call and return TwiML', async () => {
      // Mock tenant lookup - findAll for matching phone number
      mockTenantModel.findAll.mockResolvedValue([{
        id: 'test-tenant-uuid',
        name: 'Test Salon',
        status: 'active',
        metadata: { twilioPhoneNumber: '+15551234567' },
        businessHours: {}, metadata: {},
      }]);

      // Mock call log creation
      mockCallLogModel.create.mockResolvedValue({
        id: 'call-log-123',
        tenantId: 'test-tenant',
        twilioCallSid: 'CA123456789',
        direction: 'inbound',
        status: 'initiated',
        fromNumber: '+15559876543',
        toNumber: '+15551234567',
      });

      const response = await request(app)
        .post('/api/webhooks/twilio/voice')
        .type('form')
        .send({
          CallSid: 'CA123456789',
          From: '+15559876543',
          To: '+15551234567',
          CallStatus: 'ringing',
          Direction: 'inbound',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<?xml');
      expect(response.text).toContain('Response');
    });

    it('should return error TwiML when no tenant found', async () => {
      mockTenantModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/webhooks/twilio/voice')
        .type('form')
        .send({
          CallSid: 'CA123456789',
          From: '+15559876543',
          To: '+15551234567',
          CallStatus: 'ringing',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('not in service');
    });
  });

  describe('POST /api/webhooks/twilio/sms', () => {
    it('should handle incoming SMS and return TwiML', async () => {
      // Mock tenant lookup - findAll for matching phone number
      mockTenantModel.findAll.mockResolvedValue([{
        id: 'test-tenant-uuid',
        name: 'Test Salon',
        status: 'active',
        metadata: { twilioPhoneNumber: '+15551234567' },
        businessHours: {}, metadata: {},
      }]);

      const response = await request(app)
        .post('/api/webhooks/twilio/sms')
        .type('form')
        .send({
          MessageSid: 'SM123456789',
          From: '+15559876543',
          To: '+15551234567',
          Body: 'Hello, I want to book an appointment',
          NumMedia: '0',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<?xml');
      expect(response.text).toContain('Response');
    });

    it('should handle CONFIRM command', async () => {
      mockTenantModel.findAll.mockResolvedValue([{
        id: 'test-tenant-uuid',
        name: 'Test Salon',
        status: 'active',
        metadata: { twilioPhoneNumber: '+15551234567' },
        businessHours: {}, metadata: {},
      }]);

      const response = await request(app)
        .post('/api/webhooks/twilio/sms')
        .type('form')
        .send({
          MessageSid: 'SM123456789',
          From: '+15559876543',
          To: '+15551234567',
          Body: 'CONFIRM',
          NumMedia: '0',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(twilioService.generateSmsResponse).toHaveBeenCalledWith(
        expect.stringContaining('confirming')
      );
    });

    it('should handle HELP command', async () => {
      mockTenantModel.findAll.mockResolvedValue([{
        id: 'test-tenant-uuid',
        name: 'Test Salon',
        status: 'active',
        metadata: { twilioPhoneNumber: '+15551234567' },
        businessHours: {}, metadata: {},
      }]);

      const response = await request(app)
        .post('/api/webhooks/twilio/sms')
        .type('form')
        .send({
          MessageSid: 'SM123456789',
          From: '+15559876543',
          To: '+15551234567',
          Body: 'HELP',
          NumMedia: '0',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(twilioService.generateSmsResponse).toHaveBeenCalledWith(
        expect.stringContaining('Test Salon')
      );
    });

    it('should return error TwiML when no tenant found', async () => {
      mockTenantModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/webhooks/twilio/sms')
        .type('form')
        .send({
          MessageSid: 'SM123456789',
          From: '+15559876543',
          To: '+15551234567',
          Body: 'Hello',
          NumMedia: '0',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('not in service');
    });
  });

  describe('POST /api/webhooks/twilio/status', () => {
    it('should handle call status callback', async () => {
      const mockCallLog = {
        id: 'call-log-123',
        tenantId: 'test-tenant',
        twilioCallSid: 'CA123456789',
        status: 'in-progress',
        updateFromTwilio: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
        save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
      };
      mockCallLogModel.findOne.mockResolvedValue(mockCallLog);

      const response = await request(app)
        .post('/api/webhooks/twilio/status')
        .type('form')
        .send({
          CallSid: 'CA123456789',
          CallStatus: 'completed',
          CallDuration: '120',
        });

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });

    it('should handle status callback for unknown call', async () => {
      mockCallLogModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/webhooks/twilio/status')
        .type('form')
        .send({
          CallSid: 'CA-unknown',
          CallStatus: 'completed',
        });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/telephony/send-sms', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/telephony/send-sms')
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          to: '+15559876543',
          message: 'Test message',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 when required fields missing', async () => {
      const response = await request(app)
        .post('/api/telephony/send-sms')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          to: '+15559876543',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should send SMS successfully', async () => {
      mockTenantModel.findOne.mockResolvedValue({
        id: 'test-tenant-uuid',
        name: 'Test Salon',
        metadata: { twilioPhoneNumber: '+15551234567' },
        businessHours: {}, metadata: {},
      });

      twilioService.sendSms.mockResolvedValue({
        sid: 'SM123456789',
        status: 'queued',
        to: '+15559876543',
        from: '+15551234567',
        body: 'Test message',
      });

      const response = await request(app)
        .post('/api/telephony/send-sms')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          to: '+15559876543',
          message: 'Test message',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.messageSid).toBe('SM123456789');
    });
  });

  describe('POST /api/telephony/send-appointment-reminder', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/telephony/send-appointment-reminder')
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          customerPhone: '+15559876543',
          customerName: 'John Doe',
          appointmentDate: '2024-12-01',
          appointmentTime: '10:00 AM',
          serviceName: 'Haircut',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 when required fields missing', async () => {
      const response = await request(app)
        .post('/api/telephony/send-appointment-reminder')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          customerPhone: '+15559876543',
          customerName: 'John Doe',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should send appointment reminder successfully', async () => {
      mockTenantModel.findOne.mockResolvedValue({
        id: 'test-tenant-uuid',
        name: 'Test Salon',
        metadata: { twilioPhoneNumber: '+15551234567' },
        businessHours: {}, metadata: {},
      });

      twilioService.sendSms.mockResolvedValue({
        sid: 'SM123456789',
        status: 'queued',
        to: '+15559876543',
        from: '+15551234567',
        body: 'Reminder message',
      });

      const response = await request(app)
        .post('/api/telephony/send-appointment-reminder')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          customerPhone: '+15559876543',
          customerName: 'John Doe',
          appointmentDate: '2024-12-01',
          appointmentTime: '10:00 AM',
          serviceName: 'Haircut',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('appointment_reminder');
    });
  });

  describe('GET /api/telephony/call-logs', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/telephony/call-logs')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should return call logs successfully', async () => {
      const mockCallLogs = [
        {
          id: 'call-1',
          tenantId: 'test-tenant',
          twilioCallSid: 'CA111',
          direction: 'inbound',
          status: 'completed',
          fromNumber: '+15559876543',
          toNumber: '+15551234567',
          duration: 120,
          toSafeObject: function() { return this; },
        },
        {
          id: 'call-2',
          tenantId: 'test-tenant',
          twilioCallSid: 'CA222',
          direction: 'outbound',
          status: 'completed',
          fromNumber: '+15551234567',
          toNumber: '+15559876543',
          duration: 60,
          toSafeObject: function() { return this; },
        },
      ];

      mockCallLogModel.findAndCountAll.mockResolvedValue({
        rows: mockCallLogs,
        count: 2,
      });

      const response = await request(app)
        .get('/api/telephony/call-logs')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.logs).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should filter call logs by direction', async () => {
      mockCallLogModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      const response = await request(app)
        .get('/api/telephony/call-logs')
        .query({ direction: 'inbound' })
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(mockCallLogModel.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('POST /api/telephony/provision-number', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/telephony/provision-number')
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          areaCode: '555',
          country: 'US',
        });

      expect(response.status).toBe(401);
    });

    it('should provision phone number successfully', async () => {
      twilioService.provisionPhoneNumber.mockResolvedValue({
        phoneNumber: '+15551234567',
        sid: 'PN123456789',
        friendlyName: '(555) 123-4567',
        capabilities: { voice: true, sms: true },
      });

      const response = await request(app)
        .post('/api/telephony/provision-number')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant')
        .send({
          areaCode: '555',
          country: 'US',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.phoneNumber).toBe('+15551234567');
    });
  });

  describe('DELETE /api/telephony/release-number/:sid', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/telephony/release-number/PN123456789')
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(401);
    });

    it('should release phone number successfully', async () => {
      twilioService.releasePhoneNumber.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/telephony/release-number/PN123456789')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Tenant-ID', 'test-tenant');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('released');
    });
  });
});

describe('CallLog Model Constants', () => {
  describe('CALL_DIRECTION', () => {
    it('should have correct direction values', () => {
      const { CALL_DIRECTION } = require('../src/modules/telephony/callLog.model');
      
      expect(CALL_DIRECTION.INBOUND).toBe('inbound');
      expect(CALL_DIRECTION.OUTBOUND).toBe('outbound');
    });
  });

  describe('POST /api/webhooks/twilio/outbound-voice', () => {
    it('should handle outbound voice call and return TwiML', async () => {
      // Mock tenant lookup - findAll for matching phone number (From for outbound)
      mockTenantModel.findAll.mockResolvedValue([{
        id: 'test-tenant-uuid',
        name: 'Test Salon',
        status: 'active',
        metadata: { twilioPhoneNumber: '+15551234567' },
        businessHours: {},
      }]);

      // Mock call log creation
      mockCallLogModel.findOne.mockResolvedValue(null); // No existing call log
      mockCallLogModel.create.mockResolvedValue({
        id: 'call-log-outbound-123',
        tenantId: 'test-tenant-uuid',
        twilioCallSid: 'CA987654321',
        direction: 'outbound',
        status: 'initiated',
        fromNumber: '+15551234567',
        toNumber: '+18059736595',
      });

      const response = await request(app)
        .post('/api/webhooks/twilio/outbound-voice')
        .type('form')
        .send({
          CallSid: 'CA987654321',
          From: '+15551234567',
          To: '+18059736595',
          CallStatus: 'initiated',
          Direction: 'outbound-api',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<?xml');
      expect(response.text).toContain('Response');
      expect(mockCallLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'test-tenant-uuid',
          twilioCallSid: 'CA987654321',
          direction: 'outbound',
          fromNumber: '+15551234567',
          toNumber: '+18059736595',
        })
      );
    });

    it('should not create duplicate call logs for same CallSid', async () => {
      // Clear previous mock calls
      jest.clearAllMocks();
      
      // Mock tenant lookup
      mockTenantModel.findAll.mockResolvedValue([{
        id: 'test-tenant-uuid',
        name: 'Test Salon',
        status: 'active',
        metadata: { twilioPhoneNumber: '+15551234567' },
        businessHours: {},
      }]);

      // Mock existing call log
      mockCallLogModel.findOne.mockResolvedValue({
        id: 'existing-call-log-123',
        tenantId: 'test-tenant-uuid',
        twilioCallSid: 'CA987654321',
        direction: 'outbound',
        status: 'initiated',
        fromNumber: '+15551234567',
        toNumber: '+18059736595',
      });

      const response = await request(app)
        .post('/api/webhooks/twilio/outbound-voice')
        .type('form')
        .send({
          CallSid: 'CA987654321',
          From: '+15551234567',
          To: '+18059736595',
          CallStatus: 'ringing',
          Direction: 'outbound-api',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(mockCallLogModel.create).not.toHaveBeenCalled();
    });

    it('should return error TwiML when no tenant found for outbound call', async () => {
      mockTenantModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/webhooks/twilio/outbound-voice')
        .type('form')
        .send({
          CallSid: 'CA987654321',
          From: '+15551234567',
          To: '+18059736595',
          CallStatus: 'initiated',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('not configured');
    });
  });

  describe('CALL_STATUS', () => {
    it('should have correct status values', () => {
      const { CALL_STATUS } = require('../src/modules/telephony/callLog.model');
      
      expect(CALL_STATUS.INITIATED).toBe('initiated');
      expect(CALL_STATUS.COMPLETED).toBe('completed');
      expect(CALL_STATUS.BUSY).toBe('busy');
      expect(CALL_STATUS.FAILED).toBe('failed');
    });
  });
});
