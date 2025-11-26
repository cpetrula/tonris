/**
 * AI Assistant Service
 * Handles conversation processing and intent recognition for the virtual assistant.
 * This is a business-agnostic implementation that works with the multi-tenant system.
 */

import { dataStore } from '../models/dataStore.js';
import { appointmentService } from './appointmentService.js';
import { availabilityService } from './availabilityService.js';
import type {
  AssistantContext,
  AssistantIntent,
  AssistantResponse,
  Business,
  Service,
  StaffMember,
  TimeSlot,
} from '../types/index.js';

interface ConversationState {
  context: AssistantContext;
  currentIntent?: AssistantIntent;
  collectedData: Record<string, unknown>;
  lastUpdated: Date;
}

export class AssistantService {
  private conversations: Map<string, ConversationState> = new Map();
  private readonly DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * Process an incoming message and generate a response
   */
  async processMessage(
    context: AssistantContext,
    message: string
  ): Promise<AssistantResponse> {
    // Get or create conversation state
    let state = this.conversations.get(context.conversationId);
    if (!state) {
      state = {
        context,
        collectedData: {},
        lastUpdated: new Date(),
      };
      this.conversations.set(context.conversationId, state);
    }

    // Detect intent
    const intent = this.detectIntent(message, state);
    state.currentIntent = intent;
    state.lastUpdated = new Date();

    // Process based on intent
    return this.handleIntent(state, intent, message);
  }

  /**
   * Simple intent detection based on keywords
   * In production, this would use NLP/ML models
   */
  private detectIntent(message: string, state: ConversationState): AssistantIntent {
    const lowerMessage = message.toLowerCase();

    // Appointment booking
    if (
      lowerMessage.includes('book') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('appointment') ||
      lowerMessage.includes('reserve')
    ) {
      if (lowerMessage.includes('cancel')) {
        return { type: 'cancel_appointment', confidence: 0.9, entities: {} };
      }
      if (lowerMessage.includes('change') || lowerMessage.includes('reschedule') || lowerMessage.includes('modify')) {
        return { type: 'modify_appointment', confidence: 0.9, entities: {} };
      }
      return { type: 'book_appointment', confidence: 0.9, entities: {} };
    }

    // Cancel appointment
    if (lowerMessage.includes('cancel')) {
      return { type: 'cancel_appointment', confidence: 0.9, entities: {} };
    }

    // Modify/reschedule
    if (
      lowerMessage.includes('reschedule') ||
      lowerMessage.includes('change') ||
      lowerMessage.includes('modify')
    ) {
      return { type: 'modify_appointment', confidence: 0.9, entities: {} };
    }

    // Check availability
    if (
      lowerMessage.includes('available') ||
      lowerMessage.includes('availability') ||
      lowerMessage.includes('open') ||
      lowerMessage.includes('free')
    ) {
      return { type: 'check_availability', confidence: 0.9, entities: {} };
    }

    // Pricing
    if (
      lowerMessage.includes('price') ||
      lowerMessage.includes('cost') ||
      lowerMessage.includes('how much') ||
      lowerMessage.includes('rate')
    ) {
      return { type: 'get_pricing', confidence: 0.9, entities: {} };
    }

    // Staff schedule
    if (
      lowerMessage.includes('when is') ||
      lowerMessage.includes('working') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('stylist') ||
      lowerMessage.includes('hairdresser')
    ) {
      return { type: 'get_staff_schedule', confidence: 0.8, entities: {} };
    }

    // Business hours
    if (
      lowerMessage.includes('hours') ||
      lowerMessage.includes('open') ||
      lowerMessage.includes('close') ||
      lowerMessage.includes('when are you')
    ) {
      return { type: 'get_business_hours', confidence: 0.9, entities: {} };
    }

    // FAQ
    if (
      lowerMessage.includes('?') ||
      lowerMessage.includes('what') ||
      lowerMessage.includes('where') ||
      lowerMessage.includes('how') ||
      lowerMessage.includes('do you')
    ) {
      return { type: 'faq', confidence: 0.6, entities: {} };
    }

    return { type: 'unknown', confidence: 0.3, entities: {} };
  }

  /**
   * Handle detected intent
   */
  private async handleIntent(
    state: ConversationState,
    intent: AssistantIntent,
    message: string
  ): Promise<AssistantResponse> {
    const business = dataStore.getBusiness(state.context.businessId);
    if (!business) {
      return {
        message: "I'm sorry, but I couldn't find the business information. Please try again later.",
        intent,
        requiresFollowUp: false,
      };
    }

    const tenant = dataStore.getTenant(state.context.tenantId);
    const greeting = tenant?.settings.customGreeting ?? `Welcome to ${business.name}!`;

    switch (intent.type) {
      case 'book_appointment':
        return this.handleBookAppointment(state, business, message);
      
      case 'modify_appointment':
        return this.handleModifyAppointment(state, business, message);
      
      case 'cancel_appointment':
        return this.handleCancelAppointment(state, business, message);
      
      case 'check_availability':
        return this.handleCheckAvailability(state, business, message);
      
      case 'get_pricing':
        return this.handleGetPricing(state, business, message);
      
      case 'get_staff_schedule':
        return this.handleGetStaffSchedule(state, business, message);
      
      case 'get_business_hours':
        return this.handleGetBusinessHours(state, business);
      
      case 'faq':
        return this.handleFAQ(state, business, message);
      
      default:
        return {
          message: `${greeting} How can I help you today? I can assist with:\n• Booking appointments\n• Checking availability\n• Getting pricing information\n• Finding out when specific staff are working\n• Answering questions about our services`,
          intent,
          requiresFollowUp: true,
          suggestedActions: ['Book an appointment', 'Check availability', 'View prices'],
        };
    }
  }

  /**
   * Handle appointment booking
   */
  private handleBookAppointment(
    state: ConversationState,
    business: Business,
    message: string
  ): AssistantResponse {
    const services = dataStore.getServicesByBusiness(business.id);
    const staff = dataStore.getStaffByBusiness(business.id);

    // Extract service from message
    const matchedService = this.findServiceInMessage(message, services);
    if (matchedService) {
      state.collectedData.serviceId = matchedService.id;
      state.collectedData.serviceName = matchedService.name;
    }

    // Extract staff from message
    const matchedStaff = this.findStaffInMessage(message, staff);
    if (matchedStaff) {
      state.collectedData.staffId = matchedStaff.id;
      state.collectedData.staffName = matchedStaff.name;
    }

    // If we have a service, find availability
    if (state.collectedData.serviceId) {
      const nextSlot = availabilityService.findNextAvailableSlot(
        business.id,
        state.collectedData.serviceId as string,
        state.collectedData.staffId as string | undefined
      );

      if (nextSlot) {
        const dateStr = this.formatDateTime(nextSlot.startTime);
        return {
          message: `Great! I found an available slot for ${state.collectedData.serviceName}${state.collectedData.staffName ? ` with ${state.collectedData.staffName}` : ''} on ${dateStr}. Would you like to book this time, or would you prefer a different time?`,
          intent: state.currentIntent!,
          requiresFollowUp: true,
          suggestedActions: ['Yes, book this time', 'Show other times'],
          data: { availableSlot: nextSlot },
        };
      } else {
        return {
          message: `I'm sorry, but I couldn't find any available slots for ${state.collectedData.serviceName} in the next 30 days. Would you like to try a different service or staff member?`,
          intent: state.currentIntent!,
          requiresFollowUp: true,
          suggestedActions: ['Show services', 'Show staff'],
        };
      }
    }

    // Ask for service selection
    const serviceList = services.map(s => `• ${s.name} (${s.duration} min, ${this.formatPrice(s.price, s.currency)})`).join('\n');
    return {
      message: `I'd be happy to help you book an appointment! Which service would you like?\n\n${serviceList}`,
      intent: state.currentIntent!,
      requiresFollowUp: true,
      suggestedActions: services.slice(0, 3).map(s => s.name),
    };
  }

  /**
   * Handle appointment modification
   */
  private handleModifyAppointment(
    state: ConversationState,
    business: Business,
    message: string
  ): AssistantResponse {
    // Try to find existing appointment
    if (state.context.customerPhone) {
      const appointment = appointmentService.findAppointmentByPhone(
        business.id,
        state.context.customerPhone
      );

      if (appointment) {
        const service = dataStore.getService(appointment.serviceId);
        const staff = dataStore.getStaffMember(appointment.staffId);
        const dateStr = this.formatDateTime(appointment.startTime);

        return {
          message: `I found your upcoming appointment:\n\n• Service: ${service?.name ?? 'Unknown'}\n• With: ${staff?.name ?? 'Unknown'}\n• When: ${dateStr}\n\nWhat would you like to change? You can reschedule to a different time or change the service.`,
          intent: state.currentIntent!,
          requiresFollowUp: true,
          suggestedActions: ['Change time', 'Change service', 'Never mind'],
          data: { appointment },
        };
      }
    }

    return {
      message: "I'd be happy to help you modify your appointment. Could you please provide your phone number so I can look up your booking?",
      intent: state.currentIntent!,
      requiresFollowUp: true,
    };
  }

  /**
   * Handle appointment cancellation
   */
  private handleCancelAppointment(
    state: ConversationState,
    business: Business,
    message: string
  ): AssistantResponse {
    // Try to find existing appointment
    if (state.context.customerPhone) {
      const appointment = appointmentService.findAppointmentByPhone(
        business.id,
        state.context.customerPhone
      );

      if (appointment) {
        const service = dataStore.getService(appointment.serviceId);
        const dateStr = this.formatDateTime(appointment.startTime);

        const tenant = dataStore.getTenant(state.context.tenantId);
        const cancellationPolicy = tenant?.settings.cancellationPolicy ?? 'Please note our standard cancellation policy applies.';

        return {
          message: `I found your appointment for ${service?.name ?? 'Unknown'} on ${dateStr}.\n\n${cancellationPolicy}\n\nAre you sure you want to cancel this appointment?`,
          intent: state.currentIntent!,
          requiresFollowUp: true,
          suggestedActions: ['Yes, cancel it', 'No, keep it'],
          data: { appointment },
        };
      }
    }

    return {
      message: "I'd be happy to help you cancel your appointment. Could you please provide your phone number so I can look up your booking?",
      intent: state.currentIntent!,
      requiresFollowUp: true,
    };
  }

  /**
   * Handle availability check
   */
  private handleCheckAvailability(
    state: ConversationState,
    business: Business,
    message: string
  ): AssistantResponse {
    const services = dataStore.getServicesByBusiness(business.id);
    const staff = dataStore.getStaffByBusiness(business.id);

    // Try to find a date in the message
    const dateMatch = this.extractDateFromMessage(message);
    const date = dateMatch ?? new Date();

    // Try to find service and staff in message
    const matchedService = this.findServiceInMessage(message, services);
    const matchedStaff = this.findStaffInMessage(message, staff);

    const slots = availabilityService.getAvailableSlots({
      businessId: business.id,
      serviceId: matchedService?.id,
      staffId: matchedStaff?.id,
      date,
    });

    const availableSlots = slots.filter(s => s.isAvailable);

    if (availableSlots.length === 0) {
      return {
        message: `I'm sorry, but there are no available slots on ${this.formatDate(date)}${matchedService ? ` for ${matchedService.name}` : ''}${matchedStaff ? ` with ${matchedStaff.name}` : ''}. Would you like to check another day?`,
        intent: state.currentIntent!,
        requiresFollowUp: true,
        suggestedActions: ['Check tomorrow', 'Check next week'],
      };
    }

    const slotList = availableSlots
      .slice(0, 5)
      .map(s => `• ${this.formatTime(s.startTime)} with ${s.staffName}`)
      .join('\n');

    return {
      message: `Here are available times on ${this.formatDate(date)}${matchedService ? ` for ${matchedService.name}` : ''}:\n\n${slotList}\n\nWould you like to book one of these times?`,
      intent: state.currentIntent!,
      requiresFollowUp: true,
      suggestedActions: availableSlots.slice(0, 3).map(s => this.formatTime(s.startTime)),
      data: { availableSlots: availableSlots.slice(0, 10) },
    };
  }

  /**
   * Handle pricing inquiries
   */
  private handleGetPricing(
    state: ConversationState,
    business: Business,
    message: string
  ): AssistantResponse {
    const services = dataStore.getServicesByBusiness(business.id);

    // Try to find specific service in message
    const matchedService = this.findServiceInMessage(message, services);

    if (matchedService) {
      return {
        message: `${matchedService.name}:\n• Price: ${this.formatPrice(matchedService.price, matchedService.currency)}\n• Duration: ${matchedService.duration} minutes\n${matchedService.description ? `• ${matchedService.description}` : ''}\n\nWould you like to book this service?`,
        intent: state.currentIntent!,
        requiresFollowUp: true,
        suggestedActions: ['Book now', 'See other services'],
        data: { service: matchedService },
      };
    }

    // Show all services with pricing
    const priceList = services
      .map(s => `• ${s.name}: ${this.formatPrice(s.price, s.currency)} (${s.duration} min)`)
      .join('\n');

    return {
      message: `Here's our price list:\n\n${priceList}\n\nWould you like more details about any service?`,
      intent: state.currentIntent!,
      requiresFollowUp: true,
      suggestedActions: services.slice(0, 3).map(s => s.name),
    };
  }

  /**
   * Handle staff schedule inquiries
   */
  private handleGetStaffSchedule(
    state: ConversationState,
    business: Business,
    message: string
  ): AssistantResponse {
    const staff = dataStore.getStaffByBusiness(business.id);

    // Try to find specific staff in message
    const matchedStaff = this.findStaffInMessage(message, staff);

    if (matchedStaff) {
      const schedule = availabilityService.getStaffWeeklySchedule(matchedStaff.id);
      const scheduleLines: string[] = [];

      schedule.forEach((hours, day) => {
        if (hours) {
          scheduleLines.push(`• ${this.DAY_NAMES[day]}: ${hours.start} - ${hours.end}`);
        } else {
          scheduleLines.push(`• ${this.DAY_NAMES[day]}: Off`);
        }
      });

      return {
        message: `${matchedStaff.name}'s schedule:\n\n${scheduleLines.join('\n')}\n\nWould you like to book an appointment with ${matchedStaff.name}?`,
        intent: state.currentIntent!,
        requiresFollowUp: true,
        suggestedActions: [`Book with ${matchedStaff.name}`, 'Check availability'],
        data: { staff: matchedStaff, schedule: Object.fromEntries(schedule) },
      };
    }

    // Show all staff
    const staffList = staff.map(s => `• ${s.name}${s.specialties?.length ? ` - Specializes in: ${s.specialties.join(', ')}` : ''}`).join('\n');

    return {
      message: `Our team:\n\n${staffList}\n\nWhose schedule would you like to see?`,
      intent: state.currentIntent!,
      requiresFollowUp: true,
      suggestedActions: staff.slice(0, 3).map(s => s.name),
    };
  }

  /**
   * Handle business hours inquiry
   */
  private handleGetBusinessHours(
    state: ConversationState,
    business: Business
  ): AssistantResponse {
    const hours = dataStore.getBusinessHours(business.id);
    const hoursLines: string[] = [];

    for (let day = 0; day <= 6; day++) {
      const dayHours = hours.find(h => h.dayOfWeek === day);
      if (dayHours && !dayHours.isClosed) {
        hoursLines.push(`• ${this.DAY_NAMES[day]}: ${dayHours.openTime} - ${dayHours.closeTime}`);
      } else {
        hoursLines.push(`• ${this.DAY_NAMES[day]}: Closed`);
      }
    }

    return {
      message: `${business.name} Hours:\n\n${hoursLines.join('\n')}\n\nIs there anything else I can help you with?`,
      intent: state.currentIntent!,
      requiresFollowUp: true,
      suggestedActions: ['Book appointment', 'Check prices', 'Ask a question'],
    };
  }

  /**
   * Handle FAQ
   */
  private handleFAQ(
    state: ConversationState,
    business: Business,
    message: string
  ): AssistantResponse {
    const faqs = dataStore.getFAQsByBusiness(business.id);
    
    // Try to find matching FAQ
    const lowerMessage = message.toLowerCase();
    const matchedFAQ = faqs.find(faq => {
      const lowerQuestion = faq.question.toLowerCase();
      const keywords = lowerQuestion.split(' ').filter(w => w.length > 3);
      return keywords.some(keyword => lowerMessage.includes(keyword));
    });

    if (matchedFAQ) {
      return {
        message: matchedFAQ.answer,
        intent: state.currentIntent!,
        requiresFollowUp: true,
        suggestedActions: ['Book appointment', 'More questions'],
        data: { faq: matchedFAQ },
      };
    }

    // Show FAQ list or general help
    if (faqs.length > 0) {
      const faqList = faqs.slice(0, 5).map(f => `• ${f.question}`).join('\n');
      return {
        message: `Here are some frequently asked questions:\n\n${faqList}\n\nOr feel free to ask me anything else!`,
        intent: state.currentIntent!,
        requiresFollowUp: true,
      };
    }

    return {
      message: `I'd be happy to help! You can ask me about:\n• Our services and pricing\n• Booking appointments\n• Staff schedules\n• Business hours\n\nWhat would you like to know?`,
      intent: state.currentIntent!,
      requiresFollowUp: true,
    };
  }

  // Helper methods

  private findServiceInMessage(message: string, services: Service[]): Service | undefined {
    const lowerMessage = message.toLowerCase();
    return services.find(s => lowerMessage.includes(s.name.toLowerCase()));
  }

  private findStaffInMessage(message: string, staff: StaffMember[]): StaffMember | undefined {
    const lowerMessage = message.toLowerCase();
    return staff.find(s => lowerMessage.includes(s.name.toLowerCase()));
  }

  private extractDateFromMessage(message: string): Date | null {
    const lowerMessage = message.toLowerCase();
    const today = new Date();

    if (lowerMessage.includes('today')) {
      return today;
    }
    if (lowerMessage.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    if (lowerMessage.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }

    // Check for day names
    for (let i = 0; i < this.DAY_NAMES.length; i++) {
      if (lowerMessage.includes(this.DAY_NAMES[i].toLowerCase())) {
        const targetDay = i;
        const currentDay = today.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + daysUntil);
        return targetDate;
      }
    }

    return null;
  }

  private formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  private formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }

  /**
   * Clear conversation state (for cleanup)
   */
  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
  }
}

export const assistantService = new AssistantService();
