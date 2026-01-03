/**
 * Test to verify that tenant data is properly sent to ElevenLabs
 */
const {
  handleTwilioToElevenLabs,
  generateElevenLabsConnectTwiml,
} = require('../src/modules/ai-assistant/twilio-elevenlabs.handler');

// Mock dependencies
jest.mock('../src/modules/tenants/tenant.model');
jest.mock('../src/modules/business-types/businessType.model');
jest.mock('../src/modules/ai-assistant/elevenlabs.service');

describe('Tenant Dynamic Variables Flow to ElevenLabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should include all tenant fields in customParameters', async () => {
    // Mock tenant with comprehensive data
    const mockTenant = {
      id: 'tenant-123',
      name: 'Test Salon',
      status: 'active',
      planType: 'professional',
      twilioPhoneNumber: '+15551234567',
      contactEmail: 'contact@testsalon.com',
      contactPhone: '+15559999999',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      metadata: {
        elevenLabsAgentId: 'agent-456',
        aiGreeting: 'Welcome to Test Salon!',
        aiTone: 'friendly',
        website: 'https://testsalon.com',
        socialMedia: {
          instagram: '@testsalon',
          facebook: 'TestSalon',
        },
        customField1: 'custom value 1',
        customField2: 42,
      },
      businessHours: {
        businessHours: {
          monday: { open: '09:00', close: '17:00', enabled: true },
          tuesday: { open: '09:00', close: '17:00', enabled: true },
        },
      },
    };

    // Mock the Tenant.findAll to return our mock tenant
    const { Tenant } = require('../src/modules/tenants/tenant.model');
    Tenant.findAll = jest.fn().mockResolvedValue([mockTenant]);

    // Mock BusinessType
    const { BusinessType } = require('../src/modules/business-types/businessType.model');
    BusinessType.findByPk = jest.fn().mockResolvedValue(null);

    // Mock ElevenLabs service
    const { getElevenLabsService } = require('../src/modules/ai-assistant/elevenlabs.service');
    const mockService = {
      isAvailable: jest.fn().mockResolvedValue(true),
    };
    getElevenLabsService.mockReturnValue(mockService);

    // Call the handler
    const result = await handleTwilioToElevenLabs({
      CallSid: 'CA123',
      From: '+15558888888',
      To: '+15551234567',
      CallStatus: 'ringing',
    });

    expect(result.success).toBe(true);
    
    // Parse the TwiML to extract parameters
    const twiml = result.twiml;
    
    // Verify core fields are present
    expect(twiml).toContain('tenant_id');
    expect(twiml).toContain('tenant-123');
    expect(twiml).toContain('business_name');
    expect(twiml).toContain('Test Salon');
    
    // Verify contact information is present
    expect(twiml).toContain('contact_email');
    expect(twiml).toContain('contact@testsalon.com');
    expect(twiml).toContain('contact_phone');
    expect(twiml).toContain('+15559999999');
    
    // Verify address fields are present
    expect(twiml).toContain('address_street');
    expect(twiml).toContain('123 Main St');
    expect(twiml).toContain('address_city');
    expect(twiml).toContain('New York');
    expect(twiml).toContain('address_state');
    expect(twiml).toContain('NY');
    
    // Verify AI settings are present
    expect(twiml).toContain('ai_greeting');
    expect(twiml).toContain('Welcome to Test Salon!');
    expect(twiml).toContain('ai_tone');
    expect(twiml).toContain('friendly');
    
    // Verify metadata fields are present
    expect(twiml).toContain('website');
    expect(twiml).toContain('https://testsalon.com');
    expect(twiml).toContain('customField1');
    expect(twiml).toContain('custom value 1');
    expect(twiml).toContain('customField2');
    expect(twiml).toContain('42');
    
    // Verify tenant status fields are present
    expect(twiml).toContain('plan_type');
    expect(twiml).toContain('professional');
    expect(twiml).toContain('tenant_status');
    expect(twiml).toContain('active');
    
    // Verify business hours are present
    expect(twiml).toContain('business_hours');
  });

  it('should handle tenant with minimal data gracefully', async () => {
    // Mock tenant with minimal data
    const mockTenant = {
      id: 'tenant-456',
      name: 'Minimal Salon',
      status: 'active',
      planType: 'free',
      twilioPhoneNumber: '+15557777777',
      contactEmail: 'minimal@salon.com',
      contactPhone: null,
      address: null,
      metadata: {
        elevenLabsAgentId: 'agent-789',
      },
      businessHours: {},
    };

    // Mock the Tenant.findAll to return our mock tenant
    const { Tenant } = require('../src/modules/tenants/tenant.model');
    Tenant.findAll = jest.fn().mockResolvedValue([mockTenant]);

    // Mock BusinessType
    const { BusinessType } = require('../src/modules/business-types/businessType.model');
    BusinessType.findByPk = jest.fn().mockResolvedValue(null);

    // Mock ElevenLabs service
    const { getElevenLabsService } = require('../src/modules/ai-assistant/elevenlabs.service');
    const mockService = {
      isAvailable: jest.fn().mockResolvedValue(true),
    };
    getElevenLabsService.mockReturnValue(mockService);

    // Call the handler
    const result = await handleTwilioToElevenLabs({
      CallSid: 'CA456',
      From: '+15558888888',
      To: '+15557777777',
      CallStatus: 'ringing',
    });

    expect(result.success).toBe(true);
    
    // Verify essential fields are present
    const twiml = result.twiml;
    expect(twiml).toContain('tenant_id');
    expect(twiml).toContain('tenant-456');
    expect(twiml).toContain('business_name');
    expect(twiml).toContain('Minimal Salon');
  });

  it('generateElevenLabsConnectTwiml should include all custom parameters', () => {
    const customParameters = {
      tenant_id: 'test-tenant',
      tenant_name: 'Test Business',
      business_name: 'Test Business',
      contact_email: 'test@business.com',
      contact_phone: '+15551111111',
      address_street: '456 Test St',
      address_city: 'Boston',
      website: 'https://testbusiness.com',
      custom_field: 'custom value',
    };

    const twiml = generateElevenLabsConnectTwiml({
      mediaStreamUrl: 'wss://example.com/media-stream',
      agentId: 'agent-123',
      tenantId: 'test-tenant',
      callSid: 'CA789',
      customParameters,
    });

    // Verify all custom parameters are in the TwiML
    expect(twiml).toContain('tenant_id');
    expect(twiml).toContain('test-tenant');
    expect(twiml).toContain('tenant_name');
    expect(twiml).toContain('Test Business');
    expect(twiml).toContain('contact_email');
    expect(twiml).toContain('test@business.com');
    expect(twiml).toContain('contact_phone');
    expect(twiml).toContain('+15551111111');
    expect(twiml).toContain('address_street');
    expect(twiml).toContain('456 Test St');
    expect(twiml).toContain('website');
    expect(twiml).toContain('https://testbusiness.com');
    expect(twiml).toContain('custom_field');
    expect(twiml).toContain('custom value');
  });
});
