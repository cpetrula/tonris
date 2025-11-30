/**
 * Twilio-ElevenLabs Integration Tests
 * Tests for the Twilio to ElevenLabs webhook functionality
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockTenantModel = {
  findOne: jest.fn(),
  findAll: jest.fn(),
};

const mockAppointmentModel = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
};

const mockServiceModel = {
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  create: jest.fn(),
  generateDefaultServices: jest.fn(() => []),
};

const mockEmployeeModel = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
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

// Mock models BEFORE requiring the app
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
  CANCELLATION_REASONS: {
    CUSTOMER_REQUEST: 'customer_request',
    EMPLOYEE_UNAVAILABLE: 'employee_unavailable',
    RESCHEDULE: 'reschedule',
    NO_SHOW: 'no_show',
    OTHER: 'other',
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
  Service: mockServiceModel,
  SERVICE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  },
  Employee: mockEmployeeModel,
  EMPLOYEE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ON_LEAVE: 'on_leave',
  },
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

// Mock the ElevenLabs service
const mockElevenLabsService = {
  isAvailable: jest.fn(),
  getTwilioSignedUrl: jest.fn(),
  getAgentSignedUrl: jest.fn(),
  startSession: jest.fn(),
  endSession: jest.fn(),
  processInput: jest.fn(),
  detectIntent: jest.fn(),
  getName: jest.fn(() => 'elevenlabs'),
  getClient: jest.fn(() => null),
  getAgentConfig: jest.fn(() => ({
    agentId: 'test-agent-id',
    isConfigured: true,
  })),
};

jest.mock('../src/modules/ai-assistant/elevenlabs.service', () => ({
  ElevenLabsService: jest.fn().mockImplementation(() => mockElevenLabsService),
  getElevenLabsService: jest.fn(() => mockElevenLabsService),
}));

// Now require the app AFTER the mocks are in place
const { app } = require('../src/app');

describe('Twilio-ElevenLabs Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/webhooks/twilio/elevenlabs', () => {
    const mockTenant = {
      tenantId: 'test-tenant',
      name: 'Test Salon',
      status: 'active',
      twilioPhoneNumber: '+15551234567',
      metadata: {},
      settings: {
        elevenLabsAgentId: 'agent-123',
        businessHours: {
          monday: { open: '09:00', close: '17:00', enabled: true },
          tuesday: { open: '09:00', close: '17:00', enabled: true },
          wednesday: { open: '09:00', close: '17:00', enabled: true },
          thursday: { open: '09:00', close: '17:00', enabled: true },
          friday: { open: '09:00', close: '17:00', enabled: true },
          saturday: { open: '10:00', close: '14:00', enabled: false },
          sunday: { open: '10:00', close: '14:00', enabled: false },
        },
      },
    };

    it('should return TwiML to connect to ElevenLabs when tenant is found by twilioPhoneNumber', async () => {
      mockTenantModel.findAll.mockResolvedValue([mockTenant]);
      mockElevenLabsService.isAvailable.mockResolvedValue(true);
      mockElevenLabsService.getTwilioSignedUrl.mockResolvedValue({
        signedUrl: 'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=agent-123',
        agentId: 'agent-123',
      });

      const response = await request(app)
        .post('/api/webhooks/twilio/elevenlabs')
        .type('form')
        .send({
          CallSid: 'CA123456789',
          From: '+15559876543',
          To: '+15551234567',
          CallStatus: 'ringing',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<?xml');
      expect(response.text).toContain('Response');
      expect(response.text).toContain('Connect');
      expect(response.text).toContain('Stream');
      // Verify that the stream URL points to the application's media-stream endpoint
      expect(response.text).toContain('/media-stream');
      // Verify that the stream has a name attribute
      expect(response.text).toContain('name="ElevenLabsStream"');
    });

    it('should return TwiML to connect to ElevenLabs when tenant is found via metadata fallback', async () => {
      const mockTenantWithMetadata = {
        ...mockTenant,
        twilioPhoneNumber: null,
        metadata: { twilioPhoneNumber: '+15551234567' },
      };
      mockTenantModel.findAll.mockResolvedValue([mockTenantWithMetadata]);
      mockElevenLabsService.isAvailable.mockResolvedValue(true);
      mockElevenLabsService.getTwilioSignedUrl.mockResolvedValue({
        signedUrl: 'wss://api.elevenlabs.io/v1/convai/conversation?agent_id=agent-123',
        agentId: 'agent-123',
      });

      const response = await request(app)
        .post('/api/webhooks/twilio/elevenlabs')
        .type('form')
        .send({
          CallSid: 'CA123456789',
          From: '+15559876543',
          To: '+15551234567',
          CallStatus: 'ringing',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<?xml');
      expect(response.text).toContain('Response');
      expect(response.text).toContain('Connect');
      expect(response.text).toContain('Stream');
    });

    it('should return error TwiML when no tenant found', async () => {
      mockTenantModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/webhooks/twilio/elevenlabs')
        .type('form')
        .send({
          CallSid: 'CA123456789',
          From: '+15559876543',
          To: '+15559999999',
          CallStatus: 'ringing',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('<?xml');
      expect(response.text).toContain('not in service');
    });

    it('should return error TwiML when ElevenLabs is not configured', async () => {
      mockTenantModel.findAll.mockResolvedValue([mockTenant]);
      mockElevenLabsService.isAvailable.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/webhooks/twilio/elevenlabs')
        .type('form')
        .send({
          CallSid: 'CA123456789',
          From: '+15559876543',
          To: '+15551234567',
          CallStatus: 'ringing',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
      expect(response.text).toContain('temporarily unavailable');
    });

    it('should handle missing CallSid gracefully', async () => {
      mockTenantModel.findAll.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/webhooks/twilio/elevenlabs')
        .type('form')
        .send({
          From: '+15559876543',
          To: '+15559999999',
        });

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/xml');
    });
  });
});

describe('Twilio-ElevenLabs Handler Functions', () => {
  const {
    formatAvailabilityResponse,
    formatServicesResponse,
    formatBusinessHoursResponse,
    buildMediaStreamUrl,
  } = require('../src/modules/ai-assistant/twilio-elevenlabs.handler');

  describe('buildMediaStreamUrl', () => {
    it('should build WebSocket URL with wss protocol for HTTPS base URL', () => {
      const url = buildMediaStreamUrl(
        'https://example.com',
        'agent-123',
        'tenant-456',
        'CA789'
      );
      
      expect(url).toContain('wss://');
      expect(url).toContain('/media-stream');
      expect(url).toContain('agent_id=agent-123');
      expect(url).toContain('tenant_id=tenant-456');
      expect(url).toContain('call_sid=CA789');
    });

    it('should build WebSocket URL with ws protocol for HTTP base URL', () => {
      const url = buildMediaStreamUrl(
        'http://localhost:3000',
        'agent-123',
        'tenant-456',
        'CA789'
      );
      
      expect(url).toContain('ws://');
      expect(url).not.toContain('wss://');
      expect(url).toContain('localhost:3000/media-stream');
    });

    it('should URL encode special characters in parameters', () => {
      const url = buildMediaStreamUrl(
        'https://example.com',
        'agent with spaces',
        'tenant&special=chars',
        'CA+789'
      );
      
      expect(url).toContain('agent%20with%20spaces');
      expect(url).toContain('tenant%26special%3Dchars');
      expect(url).toContain('CA%2B789');
    });
  });

  describe('formatAvailabilityResponse', () => {
    it('should format availability with slots', () => {
      const availability = {
        slots: [
          { time: '09:00' },
          { time: '10:00' },
          { time: '11:00' },
        ],
      };
      
      const response = formatAvailabilityResponse(availability);
      expect(response).toContain('3 available time slots');
    });

    it('should handle no availability', () => {
      const response = formatAvailabilityResponse(null);
      expect(response).toContain("don't see any available");
    });

    it('should handle empty slots', () => {
      const availability = { slots: [] };
      const response = formatAvailabilityResponse(availability);
      expect(response).toContain("don't see any available");
    });

    it('should use singular for one slot', () => {
      const availability = { slots: [{ time: '09:00' }] };
      const response = formatAvailabilityResponse(availability);
      expect(response).toContain('1 available time slot');
      expect(response).not.toContain('slots');
    });
  });

  describe('formatServicesResponse', () => {
    it('should format services list', () => {
      const services = [
        { name: 'Haircut', price: 50, duration: 60 },
        { name: 'Styling', price: 30, duration: 30 },
      ];
      
      const response = formatServicesResponse(services);
      expect(response).toContain('Haircut');
      expect(response).toContain('Styling');
      expect(response).toContain('We offer:');
    });

    it('should handle empty services', () => {
      const response = formatServicesResponse([]);
      expect(response).toContain("don't have any services");
    });

    it('should truncate long service lists', () => {
      const services = [
        { name: 'Service1' },
        { name: 'Service2' },
        { name: 'Service3' },
        { name: 'Service4' },
        { name: 'Service5' },
        { name: 'Service6' },
        { name: 'Service7' },
      ];
      
      const response = formatServicesResponse(services);
      expect(response).toContain('and 2 more');
    });
  });

  describe('formatBusinessHoursResponse', () => {
    it('should format standard weekday hours', () => {
      const hours = {
        monday: { open: '09:00', close: '17:00', enabled: true },
        tuesday: { open: '09:00', close: '17:00', enabled: true },
        wednesday: { open: '09:00', close: '17:00', enabled: true },
        thursday: { open: '09:00', close: '17:00', enabled: true },
        friday: { open: '09:00', close: '17:00', enabled: true },
        saturday: { open: '10:00', close: '14:00', enabled: false },
        sunday: { open: '10:00', close: '14:00', enabled: false },
      };
      
      const response = formatBusinessHoursResponse(hours);
      expect(response).toContain('Monday through Friday');
      expect(response).toContain('09:00');
      expect(response).toContain('17:00');
    });

    it('should handle null hours', () => {
      const response = formatBusinessHoursResponse(null);
      expect(response).toContain("don't have business hours");
    });

    it('should handle all days closed', () => {
      const hours = {
        monday: { open: '09:00', close: '17:00', enabled: false },
        tuesday: { open: '09:00', close: '17:00', enabled: false },
        wednesday: { open: '09:00', close: '17:00', enabled: false },
        thursday: { open: '09:00', close: '17:00', enabled: false },
        friday: { open: '09:00', close: '17:00', enabled: false },
        saturday: { open: '10:00', close: '14:00', enabled: false },
        sunday: { open: '10:00', close: '14:00', enabled: false },
      };
      
      const response = formatBusinessHoursResponse(hours);
      expect(response).toContain('not currently available');
    });

    it('should include Saturday hours when enabled', () => {
      const hours = {
        monday: { open: '09:00', close: '17:00', enabled: true },
        tuesday: { open: '09:00', close: '17:00', enabled: true },
        wednesday: { open: '09:00', close: '17:00', enabled: true },
        thursday: { open: '09:00', close: '17:00', enabled: true },
        friday: { open: '09:00', close: '17:00', enabled: true },
        saturday: { open: '10:00', close: '14:00', enabled: true },
        sunday: { open: '10:00', close: '14:00', enabled: false },
      };
      
      const response = formatBusinessHoursResponse(hours);
      expect(response).toContain('Saturday');
      expect(response).toContain('10:00');
      expect(response).toContain('14:00');
    });
  });
});

describe('ElevenLabs Service', () => {
  // Reset the module to get the actual implementation
  beforeEach(() => {
    jest.resetModules();
  });

  it('should have getAgentConfig method', () => {
    // Re-import after reset to get actual implementation
    jest.unmock('../src/modules/ai-assistant/elevenlabs.service');
    const { ElevenLabsService } = require('../src/modules/ai-assistant/elevenlabs.service');
    
    const service = new ElevenLabsService({
      apiKey: 'test-key',
      agentId: 'test-agent',
    });
    
    const config = service.getAgentConfig();
    expect(config).toHaveProperty('agentId');
    expect(config).toHaveProperty('isConfigured');
  });
});

describe('ElevenLabs Conversation Initiation Webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/webhooks/elevenlabs/conversation-initiation', () => {
    it('should return conversation configuration with dynamic variables', async () => {
      const mockTenantData = {
        tenantId: 'test-tenant',
        name: 'Test Salon',
        status: 'active',
        settings: {
          businessHours: {
            monday: { open: '09:00', close: '17:00', enabled: true },
            tuesday: { open: '09:00', close: '17:00', enabled: true },
            wednesday: { open: '09:00', close: '17:00', enabled: true },
            thursday: { open: '09:00', close: '17:00', enabled: true },
            friday: { open: '09:00', close: '17:00', enabled: true },
            saturday: { open: '10:00', close: '14:00', enabled: false },
            sunday: { open: '10:00', close: '14:00', enabled: false },
          },
          timezone: 'America/New_York',
          aiGreeting: 'Hello! Welcome to Test Salon.',
          aiTone: 'friendly and professional',
        },
      };
      
      const mockTenant = {
        ...mockTenantData,
        toSafeObject: function() { return mockTenantData; },
      };

      mockTenantModel.findOne.mockResolvedValue(mockTenant);

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-initiation')
        .set('Content-Type', 'application/json')
        .send({
          type: 'conversation_initiation_client_data',
          conversation_id: 'conv-123',
          agent_id: 'agent-123',
          dynamic_variables: {
            tenant_id: 'test-tenant',
            caller_number: '+15551234567',
            call_sid: 'CA123',
            business_name: 'Test Salon',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dynamic_variables');
      expect(response.body).toHaveProperty('conversation_config_override');
      expect(response.body.dynamic_variables.tenant_id).toBe('test-tenant');
      expect(response.body.dynamic_variables.business_name).toBe('Test Salon');
      expect(response.body.conversation_config_override.agent.agent_output_audio_format).toBe('ulaw_8000');
      expect(response.body.conversation_config_override.agent.user_input_audio_format).toBe('ulaw_8000');
    });

    it('should return minimal configuration when tenant is not found', async () => {
      mockTenantModel.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-initiation')
        .set('Content-Type', 'application/json')
        .send({
          type: 'conversation_initiation_client_data',
          conversation_id: 'conv-123',
          agent_id: 'agent-123',
          dynamic_variables: {
            tenant_id: 'unknown-tenant',
            business_name: 'Unknown Business',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dynamic_variables');
      expect(response.body).toHaveProperty('conversation_config_override');
      expect(response.body.dynamic_variables.business_name).toBe('Unknown Business');
    });

    it('should return empty configuration for non-conversation_initiation_client_data type', async () => {
      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-initiation')
        .set('Content-Type', 'application/json')
        .send({
          type: 'other_event_type',
          data: {},
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dynamic_variables');
      expect(response.body.dynamic_variables).toEqual({});
    });

    it('should handle missing dynamic_variables gracefully', async () => {
      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-initiation')
        .set('Content-Type', 'application/json')
        .send({
          type: 'conversation_initiation_client_data',
          conversation_id: 'conv-123',
          agent_id: 'agent-123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dynamic_variables');
      expect(response.body).toHaveProperty('conversation_config_override');
    });

    it('should include custom greeting in response when configured', async () => {
      const mockTenantData = {
        tenantId: 'test-tenant',
        name: 'Test Salon',
        settings: {
          aiGreeting: 'Welcome to Test Salon! How can I help you today?',
        },
      };
      
      const mockTenant = {
        ...mockTenantData,
        toSafeObject: function() { return mockTenantData; },
      };

      mockTenantModel.findOne.mockResolvedValue(mockTenant);

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-initiation')
        .set('Content-Type', 'application/json')
        .send({
          type: 'conversation_initiation_client_data',
          conversation_id: 'conv-123',
          agent_id: 'agent-123',
          dynamic_variables: {
            tenant_id: 'test-tenant',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.conversation_config_override.agent.first_message)
        .toBe('Welcome to Test Salon! How can I help you today?');
    });
  });
});

describe('handleConversationInitiation Function', () => {
  const {
    handleConversationInitiation,
  } = require('../src/modules/ai-assistant/twilio-elevenlabs.handler');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success with dynamic variables', async () => {
    mockTenantModel.findOne.mockResolvedValue(null);

    const result = await handleConversationInitiation({
      conversation_id: 'conv-123',
      agent_id: 'agent-123',
      dynamic_variables: {
        tenant_id: 'test-tenant',
        caller_number: '+15551234567',
        call_sid: 'CA123',
        business_name: 'Test Business',
      },
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('dynamic_variables');
    expect(result.data).toHaveProperty('conversation_config_override');
    expect(result.data.dynamic_variables.caller_number).toBe('+15551234567');
    expect(result.data.dynamic_variables.call_sid).toBe('CA123');
  });

  it('should set audio format to ulaw_8000 for Twilio compatibility', async () => {
    mockTenantModel.findOne.mockResolvedValue(null);

    const result = await handleConversationInitiation({
      conversation_id: 'conv-123',
      agent_id: 'agent-123',
      dynamic_variables: {},
    });

    expect(result.data.conversation_config_override.agent.agent_output_audio_format).toBe('ulaw_8000');
    expect(result.data.conversation_config_override.agent.user_input_audio_format).toBe('ulaw_8000');
    expect(result.data.conversation_config_override.tts.output_format).toBe('ulaw_8000');
  });
});
