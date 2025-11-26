/**
 * Tests for the Availability Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AvailabilityService } from '../src/services/availabilityService.js';
import { DataStore, dataStore } from '../src/models/dataStore.js';

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(() => {
    dataStore.clear();
    service = new AvailabilityService();

    // Set up test data
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

    // Create schedule for Monday (day 1) - 9 AM to 5 PM
    dataStore.createStaffSchedule({
      id: 'schedule-1',
      staffId: 'staff-1',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    });

    // Create schedule for Tuesday (day 2) - 9 AM to 5 PM
    dataStore.createStaffSchedule({
      id: 'schedule-2',
      staffId: 'staff-1',
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    });

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

  describe('isStaffWorkingOnDay', () => {
    it('should return true when staff is working on a scheduled day', () => {
      expect(service.isStaffWorkingOnDay('staff-1', 1)).toBe(true);
      expect(service.isStaffWorkingOnDay('staff-1', 2)).toBe(true);
    });

    it('should return false when staff is not working', () => {
      expect(service.isStaffWorkingOnDay('staff-1', 0)).toBe(false);
      expect(service.isStaffWorkingOnDay('staff-1', 6)).toBe(false);
    });
  });

  describe('getStaffWorkingHours', () => {
    it('should return working hours for scheduled days', () => {
      const hours = service.getStaffWorkingHours('staff-1', 1);
      expect(hours).toEqual({ start: '09:00', end: '17:00' });
    });

    it('should return null for non-working days', () => {
      const hours = service.getStaffWorkingHours('staff-1', 0);
      expect(hours).toBeNull();
    });
  });

  describe('isTimeSlotAvailable', () => {
    it('should return true for available slots', () => {
      // Monday at 10 AM
      const monday = getNextDayOfWeek(1);
      monday.setHours(10, 0, 0, 0);
      const endTime = new Date(monday.getTime() + 30 * 60000);

      const available = service.isTimeSlotAvailable('staff-1', monday, endTime);
      expect(available).toBe(true);
    });

    it('should return false for slots outside working hours', () => {
      // Monday at 8 AM (before 9 AM start)
      const monday = getNextDayOfWeek(1);
      monday.setHours(8, 0, 0, 0);
      const endTime = new Date(monday.getTime() + 30 * 60000);

      const available = service.isTimeSlotAvailable('staff-1', monday, endTime);
      expect(available).toBe(false);
    });

    it('should return false for non-working days', () => {
      // Sunday at 10 AM
      const sunday = getNextDayOfWeek(0);
      sunday.setHours(10, 0, 0, 0);
      const endTime = new Date(sunday.getTime() + 30 * 60000);

      const available = service.isTimeSlotAvailable('staff-1', sunday, endTime);
      expect(available).toBe(false);
    });

    it('should return false for conflicting appointments', () => {
      const monday = getNextDayOfWeek(1);
      monday.setHours(10, 0, 0, 0);
      const existingEnd = new Date(monday.getTime() + 30 * 60000);

      // Create an existing appointment
      dataStore.createAppointment({
        id: 'appointment-1',
        businessId: 'business-1',
        customerId: 'customer-1',
        staffId: 'staff-1',
        serviceId: 'service-1',
        startTime: monday,
        endTime: existingEnd,
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Try to check the same slot
      const available = service.isTimeSlotAvailable('staff-1', monday, existingEnd);
      expect(available).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available slots for a working day', () => {
      const monday = getNextDayOfWeek(1);
      monday.setHours(0, 0, 0, 0);

      const slots = service.getAvailableSlots({
        businessId: 'business-1',
        serviceId: 'service-1',
        date: monday,
      });

      expect(slots.length).toBeGreaterThan(0);
      // All slots should be for staff-1
      expect(slots.every(s => s.staffId === 'staff-1')).toBe(true);
    });

    it('should return empty for non-working days', () => {
      const sunday = getNextDayOfWeek(0);
      sunday.setHours(0, 0, 0, 0);

      const slots = service.getAvailableSlots({
        businessId: 'business-1',
        serviceId: 'service-1',
        date: sunday,
      });

      // All slots should be unavailable or no slots returned for working staff
      const availableSlots = slots.filter(s => s.isAvailable);
      expect(availableSlots).toHaveLength(0);
    });
  });

  describe('getStaffWeeklySchedule', () => {
    it('should return schedule for all days', () => {
      const schedule = service.getStaffWeeklySchedule('staff-1');
      
      expect(schedule.size).toBe(7);
      expect(schedule.get(1)).toEqual({ start: '09:00', end: '17:00' });
      expect(schedule.get(2)).toEqual({ start: '09:00', end: '17:00' });
      expect(schedule.get(0)).toBeNull();
    });
  });
});

// Helper function to get the next occurrence of a specific day of week
function getNextDayOfWeek(dayOfWeek: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil <= 0) daysUntil += 7;
  const result = new Date(today);
  result.setDate(result.getDate() + daysUntil);
  return result;
}
