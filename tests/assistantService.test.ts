/**
 * Tests for the AI Assistant Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AssistantService } from '../src/services/assistantService.js';
import { dataStore } from '../src/models/dataStore.js';

describe('AssistantService', () => {
  let service: AssistantService;

  beforeEach(() => {
    dataStore.clear();
    service = new AssistantService();
    setupTestData();
  });

  function setupTestData() {
    // Create tenant
    dataStore.createTenant({
      id: 'tenant-1',
      name: 'Test Salon',
      businessType: 'hair_salon',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        appointmentBuffer: 0,
        maxAdvanceBooking: 30,
        cancellationPolicy: 'Cancellations must be made 24 hours in advance.',
        customGreeting: 'Welcome to Test Salon!',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create business
    dataStore.createBusiness({
      id: 'business-1',
      tenantId: 'tenant-1',
      name: 'Downtown Salon',
      address: '123 Main St',
      phone: '555-1234',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create business hours
    const weekdayHours = { openTime: '09:00', closeTime: '17:00', isClosed: false };
    for (let day = 1; day <= 5; day++) {
      dataStore.createBusinessHours({
        id: `hours-${day}`,
        businessId: 'business-1',
        dayOfWeek: day,
        ...weekdayHours,
      });
    }
    
    // Saturday shorter hours
    dataStore.createBusinessHours({
      id: 'hours-6',
      businessId: 'business-1',
      dayOfWeek: 6,
      openTime: '10:00',
      closeTime: '14:00',
      isClosed: false,
    });

    // Closed Sunday
    dataStore.createBusinessHours({
      id: 'hours-0',
      businessId: 'business-1',
      dayOfWeek: 0,
      openTime: '',
      closeTime: '',
      isClosed: true,
    });

    // Create staff
    dataStore.createStaffMember({
      id: 'staff-1',
      businessId: 'business-1',
      name: 'Jane',
      role: 'Senior Stylist',
      specialties: ['Coloring', 'Cutting'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    dataStore.createStaffMember({
      id: 'staff-2',
      businessId: 'business-1',
      name: 'Mike',
      role: 'Stylist',
      specialties: ['Men\'s Cuts'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create schedules
    for (let day = 1; day <= 5; day++) {
      dataStore.createStaffSchedule({
        id: `schedule-1-${day}`,
        staffId: 'staff-1',
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      });

      dataStore.createStaffSchedule({
        id: `schedule-2-${day}`,
        staffId: 'staff-2',
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      });
    }

    // Create services
    dataStore.createService({
      id: 'service-1',
      businessId: 'business-1',
      name: 'Haircut',
      description: 'Basic haircut service',
      duration: 30,
      price: 25,
      currency: 'USD',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    dataStore.createService({
      id: 'service-2',
      businessId: 'business-1',
      name: 'Coloring',
      description: 'Full hair coloring',
      duration: 90,
      price: 75,
      currency: 'USD',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Assign services to staff
    dataStore.addStaffService('staff-1', 'service-1');
    dataStore.addStaffService('staff-1', 'service-2');
    dataStore.addStaffService('staff-2', 'service-1');

    // Create FAQs
    dataStore.createFAQ({
      id: 'faq-1',
      businessId: 'business-1',
      question: 'Do you accept walk-ins?',
      answer: 'Yes, we accept walk-ins but appointments are recommended to ensure availability.',
      category: 'general',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    dataStore.createFAQ({
      id: 'faq-2',
      businessId: 'business-1',
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, credit cards, and mobile payments.',
      category: 'payment',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const context = {
    tenantId: 'tenant-1',
    businessId: 'business-1',
    conversationId: 'test-conversation',
  };

  describe('processMessage - Intent Detection', () => {
    it('should detect booking intent', async () => {
      const response = await service.processMessage(context, 'I want to book an appointment');
      expect(response.intent.type).toBe('book_appointment');
    });

    it('should detect cancel intent', async () => {
      const response = await service.processMessage(context, 'I need to cancel my appointment');
      expect(response.intent.type).toBe('cancel_appointment');
    });

    it('should detect modify intent', async () => {
      const response = await service.processMessage(context, 'Can I reschedule my appointment?');
      expect(response.intent.type).toBe('modify_appointment');
    });

    it('should detect availability intent', async () => {
      const response = await service.processMessage(context, 'What times are available tomorrow?');
      expect(response.intent.type).toBe('check_availability');
    });

    it('should detect pricing intent', async () => {
      const response = await service.processMessage(context, 'How much does a haircut cost?');
      expect(response.intent.type).toBe('get_pricing');
    });

    it('should detect staff schedule intent', async () => {
      const response = await service.processMessage(context, 'When is Jane working?');
      expect(response.intent.type).toBe('get_staff_schedule');
    });

    it('should detect business hours intent', async () => {
      const response = await service.processMessage(context, 'What are your hours?');
      expect(response.intent.type).toBe('get_business_hours');
    });

    it('should detect FAQ intent', async () => {
      const response = await service.processMessage(context, 'Do you accept walk-ins?');
      expect(response.intent.type).toBe('faq');
    });
  });

  describe('processMessage - Booking Flow', () => {
    it('should show services when booking without specific service', async () => {
      const response = await service.processMessage(context, 'I want to book an appointment');
      
      expect(response.message).toContain('Haircut');
      expect(response.message).toContain('Coloring');
      expect(response.requiresFollowUp).toBe(true);
    });

    it('should find availability when service is mentioned', async () => {
      const response = await service.processMessage(context, 'I want to book a haircut');
      
      expect(response.message.toLowerCase()).toContain('haircut');
      expect(response.requiresFollowUp).toBe(true);
    });
  });

  describe('processMessage - Pricing', () => {
    it('should show all prices when asking generically', async () => {
      const response = await service.processMessage(context, 'What are your prices?');
      
      expect(response.message).toContain('Haircut');
      expect(response.message).toContain('$25');
      expect(response.message).toContain('Coloring');
      expect(response.message).toContain('$75');
    });

    it('should show specific service price', async () => {
      const response = await service.processMessage(context, 'How much is a haircut?');
      
      expect(response.message).toContain('Haircut');
      expect(response.message).toContain('$25');
      expect(response.message).toContain('30 minutes');
    });
  });

  describe('processMessage - Business Hours', () => {
    it('should show business hours', async () => {
      const response = await service.processMessage(context, 'What are your hours?');
      
      expect(response.message).toContain('Monday');
      expect(response.message).toContain('09:00');
      expect(response.message).toContain('17:00');
      expect(response.message).toContain('Saturday');
    });
  });

  describe('processMessage - Staff Schedule', () => {
    it('should show all staff when asking generically', async () => {
      const response = await service.processMessage(context, 'Who is on your staff?');
      
      expect(response.message).toContain('Jane');
      expect(response.message).toContain('Mike');
    });

    it('should show specific staff schedule', async () => {
      const response = await service.processMessage(context, 'When is Jane working?');
      
      expect(response.message).toContain('Jane');
      expect(response.message).toContain('schedule');
    });
  });

  describe('processMessage - FAQ', () => {
    it('should answer FAQ questions', async () => {
      const response = await service.processMessage(context, 'Do you accept walk-ins?');
      
      expect(response.message).toContain('walk-ins');
    });
  });

  describe('processMessage - Unknown Intent', () => {
    it('should provide helpful response for unclear messages', async () => {
      const response = await service.processMessage(context, 'hello');
      
      expect(response.message).toContain('Welcome');
      expect(response.suggestedActions).toBeDefined();
      expect(response.suggestedActions?.length).toBeGreaterThan(0);
    });
  });

  describe('clearConversation', () => {
    it('should clear conversation state', async () => {
      // Start a conversation
      await service.processMessage(context, 'I want to book an appointment');
      
      // Clear it
      service.clearConversation('test-conversation');
      
      // Starting fresh should work without errors
      const response = await service.processMessage(context, 'hello');
      expect(response).toBeDefined();
    });
  });
});
