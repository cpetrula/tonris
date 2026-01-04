/**
 * ElevenLabs Conversation End Webhook Tests
 * Tests for the conversation end webhook endpoint
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockCallLog = {
  id: 'call-log-uuid-1',
  tenantId: 'tenant-uuid-1',
  twilioCallSid: 'CA1234567890abcdef1234567890abcdef',
  direction: 'inbound',
  status: 'in-progress',
  fromNumber: '+15551234567',
  toNumber: '+15559876543',
  duration: null,
  startedAt: new Date('2024-01-15T10:00:00Z'),
  endedAt: null,
  transcription: null,
  callSummary: null,
  callEndReason: null,
  metadata: {},
  save: jest.fn(function() {
    return Promise.resolve(this);
  }),
  updateFromElevenLabs: jest.fn(async function(data) {
    // Simulate the updateFromElevenLabs method
    if (data.status === 'done' || data.call_successful) {
      this.status = 'completed';
    } else if (data.status === 'failed') {
      this.status = 'failed';
    }
    
    if (data.call_duration_secs !== undefined) {
      this.duration = Math.floor(data.call_duration_secs);
    }
    
    if (data.end_reason) {
      this.callEndReason = data.end_reason;
    }
    
    if (data.transcript_summary) {
      this.callSummary = data.transcript_summary;
    }
    
    if (data.transcript) {
      if (Array.isArray(data.transcript)) {
        this.transcription = data.transcript
          .map(msg => `${msg.role || 'unknown'}: ${msg.message || msg.content || ''}`)
          .join('\n');
      } else if (typeof data.transcript === 'string') {
        this.transcription = data.transcript;
      }
    }
    
    if (data.end_timestamp) {
      this.endedAt = new Date(data.end_timestamp);
    }
    
    if (!this.metadata) {
      this.metadata = {};
    }
    
    if (data.conversation_id) {
      this.metadata.elevenLabsConversationId = data.conversation_id;
    }
    
    if (data.agent_id) {
      this.metadata.elevenLabsAgentId = data.agent_id;
    }
    
    this.metadata.elevenLabsCallSuccessful = data.call_successful;
    
    if (data.user_satisfaction_rating !== undefined) {
      this.metadata.elevenLabsUserSatisfactionRating = data.user_satisfaction_rating;
    }
    
    await this.save();
    return this;
  }),
};

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
}));

// Mock the models index
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Tenant: mockTenantModel,
  CallLog: mockCallLogModel,
}));

// Mock ElevenLabs service
jest.mock('../src/modules/ai-assistant/elevenlabs.service', () => ({
  getElevenLabsService: jest.fn(() => ({
    isAvailable: jest.fn(() => Promise.resolve(true)),
    getName: jest.fn(() => 'elevenlabs'),
  })),
}));

const { app } = require('../src/app');

describe('ElevenLabs Conversation End Webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock call log to initial state
    mockCallLog.status = 'in-progress';
    mockCallLog.duration = null;
    mockCallLog.endedAt = null;
    mockCallLog.transcription = null;
    mockCallLog.callSummary = null;
    mockCallLog.callEndReason = null;
    mockCallLog.metadata = {};
  });

  describe('POST /api/webhooks/elevenlabs/conversation-end', () => {
    it('should successfully process a conversation end webhook with complete data', async () => {
      // Mock finding the call log
      mockCallLogModel.findOne.mockResolvedValue(mockCallLog);

      const webhookPayload = {
        type: 'conversation_ended',
        conversation_id: 'conv-123',
        agent_id: 'agent-456',
        status: 'done',
        call_successful: true,
        call_duration_secs: 123.45,
        end_reason: 'user_hangup',
        transcript_summary: 'Customer called to book an appointment and successfully scheduled for Monday at 2 PM.',
        transcript: [
          { role: 'agent', message: 'Hello! How can I help you today?' },
          { role: 'user', message: 'I need to book an appointment' },
          { role: 'agent', message: 'I\'d be happy to help you book an appointment.' },
        ],
        metadata: {
          call_sid: 'CA1234567890abcdef1234567890abcdef',
          caller_number: '+15551234567',
          tenant_id: 'tenant-uuid-1',
        },
        end_timestamp: '2024-01-15T10:02:03Z',
        user_satisfaction_rating: 5,
      };

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-end')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Call log updated successfully');
      expect(response.body.data.callLogId).toBe('call-log-uuid-1');
      expect(response.body.data.conversationId).toBe('conv-123');

      // Verify the call log was found with correct SID
      expect(mockCallLogModel.findOne).toHaveBeenCalledWith({
        where: { twilioCallSid: 'CA1234567890abcdef1234567890abcdef' },
      });

      // Verify updateFromElevenLabs was called with correct data
      expect(mockCallLog.updateFromElevenLabs).toHaveBeenCalledWith({
        conversation_id: 'conv-123',
        agent_id: 'agent-456',
        status: 'done',
        call_successful: true,
        call_duration_secs: 123.45,
        end_reason: 'user_hangup',
        transcript_summary: 'Customer called to book an appointment and successfully scheduled for Monday at 2 PM.',
        transcript: [
          { role: 'agent', message: 'Hello! How can I help you today?' },
          { role: 'user', message: 'I need to book an appointment' },
          { role: 'agent', message: 'I\'d be happy to help you book an appointment.' },
        ],
        end_timestamp: '2024-01-15T10:02:03Z',
        user_satisfaction_rating: 5,
      });
    });

    it('should handle webhook when call log is not found', async () => {
      // Mock call log not found
      mockCallLogModel.findOne.mockResolvedValue(null);

      const webhookPayload = {
        type: 'conversation_ended',
        conversation_id: 'conv-123',
        agent_id: 'agent-456',
        status: 'done',
        call_successful: true,
        metadata: {
          call_sid: 'CA_NONEXISTENT',
        },
      };

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-end')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Call log not found');
      
      // Verify updateFromElevenLabs was not called
      expect(mockCallLog.updateFromElevenLabs).not.toHaveBeenCalled();
    });

    it('should handle webhook when no call SID is provided', async () => {
      const webhookPayload = {
        type: 'conversation_ended',
        conversation_id: 'conv-123',
        agent_id: 'agent-456',
        status: 'done',
        call_successful: true,
        metadata: {
          // No call_sid provided
        },
      };

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-end')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('No call SID found');
      
      // Verify findOne was not called
      expect(mockCallLogModel.findOne).not.toHaveBeenCalled();
    });

    it('should ignore webhook with wrong event type', async () => {
      const webhookPayload = {
        type: 'conversation_started', // Different event type
        conversation_id: 'conv-123',
        metadata: {
          call_sid: 'CA1234567890abcdef1234567890abcdef',
        },
      };

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-end')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Event type not handled');
      
      // Verify findOne was not called
      expect(mockCallLogModel.findOne).not.toHaveBeenCalled();
    });

    it('should process webhook with minimal data', async () => {
      mockCallLogModel.findOne.mockResolvedValue(mockCallLog);

      const webhookPayload = {
        type: 'conversation_ended',
        conversation_id: 'conv-minimal',
        status: 'done',
        metadata: {
          call_sid: 'CA1234567890abcdef1234567890abcdef',
        },
      };

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-end')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockCallLog.updateFromElevenLabs).toHaveBeenCalled();
    });

    it('should handle failed calls', async () => {
      mockCallLogModel.findOne.mockResolvedValue(mockCallLog);

      const webhookPayload = {
        type: 'conversation_ended',
        conversation_id: 'conv-failed',
        agent_id: 'agent-456',
        status: 'failed',
        call_successful: false,
        call_duration_secs: 10.5,
        end_reason: 'error',
        metadata: {
          call_sid: 'CA1234567890abcdef1234567890abcdef',
        },
      };

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-end')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockCallLog.updateFromElevenLabs).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          call_successful: false,
          end_reason: 'error',
        })
      );
    });

    it('should handle transcript as a string', async () => {
      mockCallLogModel.findOne.mockResolvedValue(mockCallLog);

      const webhookPayload = {
        type: 'conversation_ended',
        conversation_id: 'conv-string-transcript',
        status: 'done',
        call_successful: true,
        transcript: 'Agent: Hello!\nUser: Hi, I need help.\nAgent: Sure, how can I assist?',
        metadata: {
          call_sid: 'CA1234567890abcdef1234567890abcdef',
        },
      };

      const response = await request(app)
        .post('/api/webhooks/elevenlabs/conversation-end')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockCallLog.updateFromElevenLabs).toHaveBeenCalledWith(
        expect.objectContaining({
          transcript: 'Agent: Hello!\nUser: Hi, I need help.\nAgent: Sure, how can I assist?',
        })
      );
    });
  });
});
