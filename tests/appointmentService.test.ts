/**
 * Tests for the Appointment Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AppointmentService } from '../src/services/appointmentService.js';
import { dataStore } from '../src/models/dataStore.js';

describe('AppointmentService', () => {
  let service: AppointmentService;

  beforeEach(() => {
    dataStore.clear();
    service = new AppointmentService();
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
        cancellationPolicy: 'Standard',
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

    // Create staff
    dataStore.createStaffMember({
      id: 'staff-1',
      businessId: 'business-1',
      name: 'Jane Stylist',
      role: 'Senior Stylist',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create schedule for all weekdays
    for (let day = 1; day <= 5; day++) {
      dataStore.createStaffSchedule({
        id: `schedule-${day}`,
        staffId: 'staff-1',
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      });
    }

    // Create service
    dataStore.createService({
      id: 'service-1',
      businessId: 'business-1',
      name: 'Haircut',
      duration: 30,
      price: 25,
      currency: 'USD',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Assign service to staff
    dataStore.addStaffService('staff-1', 'service-1');
  }

  describe('bookAppointment', () => {
    it('should successfully book an appointment', () => {
      const preferredTime = getNextWeekday();
      preferredTime.setHours(10, 0, 0, 0);

      const result = service.bookAppointment({
        businessId: 'business-1',
        customerName: 'John Doe',
        customerPhone: '555-9999',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      expect(result.success).toBe(true);
      expect(result.appointment).toBeDefined();
      expect(result.appointment?.status).toBe('confirmed');
    });

    it('should create a new customer when booking', () => {
      const preferredTime = getNextWeekday();
      preferredTime.setHours(10, 0, 0, 0);

      service.bookAppointment({
        businessId: 'business-1',
        customerName: 'Jane Customer',
        customerPhone: '555-1111',
        customerEmail: 'jane@example.com',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      const customer = dataStore.getCustomerByPhone('tenant-1', '555-1111');
      expect(customer).toBeDefined();
      expect(customer?.name).toBe('Jane Customer');
    });

    it('should reuse existing customer by phone', () => {
      // Create existing customer
      dataStore.createCustomer({
        id: 'customer-existing',
        tenantId: 'tenant-1',
        name: 'Existing Customer',
        phone: '555-2222',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const preferredTime = getNextWeekday();
      preferredTime.setHours(10, 0, 0, 0);

      const result = service.bookAppointment({
        businessId: 'business-1',
        customerName: 'Different Name',
        customerPhone: '555-2222',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      expect(result.success).toBe(true);
      expect(result.appointment?.customerId).toBe('customer-existing');
    });

    it('should fail when business not found', () => {
      const result = service.bookAppointment({
        businessId: 'non-existent',
        customerName: 'John Doe',
        customerPhone: '555-9999',
        serviceId: 'service-1',
        preferredTime: new Date(),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Business not found');
    });

    it('should fail when service not found', () => {
      const result = service.bookAppointment({
        businessId: 'business-1',
        customerName: 'John Doe',
        customerPhone: '555-9999',
        serviceId: 'non-existent',
        preferredTime: new Date(),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service not found');
    });

    it('should fail when time slot is not available', () => {
      const preferredTime = getNextWeekday();
      preferredTime.setHours(10, 0, 0, 0);

      // Book the slot
      service.bookAppointment({
        businessId: 'business-1',
        customerName: 'First Customer',
        customerPhone: '555-1111',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      // Try to book the same slot
      const result = service.bookAppointment({
        businessId: 'business-1',
        customerName: 'Second Customer',
        customerPhone: '555-2222',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Time slot is not available');
    });
  });

  describe('cancelAppointment', () => {
    it('should successfully cancel an appointment', () => {
      const preferredTime = getNextWeekday();
      preferredTime.setHours(10, 0, 0, 0);

      const bookingResult = service.bookAppointment({
        businessId: 'business-1',
        customerName: 'John Doe',
        customerPhone: '555-9999',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      const cancelResult = service.cancelAppointment(
        bookingResult.appointment!.id,
        'Changed plans'
      );

      expect(cancelResult.success).toBe(true);
      expect(cancelResult.appointment?.status).toBe('cancelled');
    });

    it('should fail when appointment not found', () => {
      const result = service.cancelAppointment('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Appointment not found');
    });

    it('should fail when appointment already cancelled', () => {
      const preferredTime = getNextWeekday();
      preferredTime.setHours(10, 0, 0, 0);

      const bookingResult = service.bookAppointment({
        businessId: 'business-1',
        customerName: 'John Doe',
        customerPhone: '555-9999',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      service.cancelAppointment(bookingResult.appointment!.id);
      const secondCancel = service.cancelAppointment(bookingResult.appointment!.id);

      expect(secondCancel.success).toBe(false);
      expect(secondCancel.error).toBe('Appointment is already cancelled');
    });
  });

  describe('modifyAppointment', () => {
    it('should successfully modify appointment time', () => {
      const preferredTime = getNextWeekday();
      preferredTime.setHours(10, 0, 0, 0);

      const bookingResult = service.bookAppointment({
        businessId: 'business-1',
        customerName: 'John Doe',
        customerPhone: '555-9999',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      const newTime = new Date(preferredTime);
      newTime.setHours(14, 0, 0, 0);

      const modifyResult = service.modifyAppointment(
        bookingResult.appointment!.id,
        newTime
      );

      expect(modifyResult.success).toBe(true);
      expect(new Date(modifyResult.appointment!.startTime).getHours()).toBe(14);
    });

    it('should fail when modifying to unavailable time', () => {
      const preferredTime = getNextWeekday();
      preferredTime.setHours(10, 0, 0, 0);

      // Book two appointments
      const booking1 = service.bookAppointment({
        businessId: 'business-1',
        customerName: 'John Doe',
        customerPhone: '555-9999',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime,
      });

      const time2 = new Date(preferredTime);
      time2.setHours(14, 0, 0, 0);

      service.bookAppointment({
        businessId: 'business-1',
        customerName: 'Jane Doe',
        customerPhone: '555-8888',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime: time2,
      });

      // Try to move first appointment to second's time
      const modifyResult = service.modifyAppointment(booking1.appointment!.id, time2);

      expect(modifyResult.success).toBe(false);
      expect(modifyResult.error).toBe('New time slot is not available');
    });
  });

  describe('getUpcomingAppointments', () => {
    it('should return upcoming appointments sorted by date', () => {
      const time1 = getNextWeekday();
      time1.setHours(10, 0, 0, 0);

      const time2 = new Date(time1);
      time2.setDate(time2.getDate() + 1);
      if (time2.getDay() === 0) time2.setDate(time2.getDate() + 1);
      if (time2.getDay() === 6) time2.setDate(time2.getDate() + 2);

      // Create customer
      dataStore.createCustomer({
        id: 'customer-1',
        tenantId: 'tenant-1',
        name: 'Test Customer',
        phone: '555-1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Book two appointments
      service.bookAppointment({
        businessId: 'business-1',
        customerId: 'customer-1',
        customerName: 'Test Customer',
        customerPhone: '555-1234',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime: time2, // Later date
      });

      service.bookAppointment({
        businessId: 'business-1',
        customerId: 'customer-1',
        customerName: 'Test Customer',
        customerPhone: '555-1234',
        serviceId: 'service-1',
        staffId: 'staff-1',
        preferredTime: time1, // Earlier date
      });

      const upcoming = service.getUpcomingAppointments('customer-1');

      expect(upcoming).toHaveLength(2);
      expect(new Date(upcoming[0]!.startTime).getTime()).toBeLessThan(
        new Date(upcoming[1]!.startTime).getTime()
      );
    });
  });
});

// Helper function to get the next weekday
function getNextWeekday(): Date {
  const today = new Date();
  let result = new Date(today);
  result.setDate(result.getDate() + 1);
  
  // Skip to Monday if it's Friday, Saturday or Sunday
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
}
