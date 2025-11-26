/**
 * Core type definitions for the multi-tenant AI assistant platform.
 * Designed to be business-type agnostic.
 */

export type BusinessType = 'hair_salon' | 'plumber' | 'electrician' | 'general';

export interface Tenant {
  id: string;
  name: string;
  businessType: BusinessType;
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  timezone: string;
  currency: string;
  appointmentBuffer: number; // minutes between appointments
  maxAdvanceBooking: number; // days in advance bookings allowed
  cancellationPolicy: string;
  customGreeting?: string;
  slotInterval?: number; // minutes between available slots (default: 30)
}

export interface Business {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  id: string;
  businessId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  isClosed: boolean;
}

export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  specialties?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  currency: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffService {
  staffId: string;
  serviceId: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment {
  id: string;
  businessId: string;
  customerId: string;
  staffId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  businessId: string;
  question: string;
  answer: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  staffId: string;
  staffName: string;
  isAvailable: boolean;
}

export interface AvailabilityQuery {
  businessId: string;
  serviceId?: string;
  staffId?: string;
  date: Date;
}

export interface AppointmentRequest {
  businessId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  staffId?: string;
  serviceId: string;
  preferredTime: Date;
  notes?: string;
}

export interface AssistantContext {
  tenantId: string;
  businessId: string;
  conversationId: string;
  customerPhone?: string;
  customerId?: string;
}

export interface AssistantIntent {
  type: 'book_appointment' | 'modify_appointment' | 'cancel_appointment' |
        'check_availability' | 'get_pricing' | 'get_staff_schedule' |
        'get_business_hours' | 'faq' | 'unknown';
  confidence: number;
  entities: Record<string, unknown>;
}

export interface AssistantResponse {
  message: string;
  intent: AssistantIntent;
  requiresFollowUp: boolean;
  suggestedActions?: string[];
  data?: Record<string, unknown>;
}
