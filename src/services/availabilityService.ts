/**
 * Availability Service
 * Handles checking staff availability and finding available time slots.
 */

import { dataStore } from '../models/dataStore.js';
import type { TimeSlot, AvailabilityQuery } from '../types/index.js';

export class AvailabilityService {
  /**
   * Parse time string (HH:mm) to minutes from midnight
   */
  private parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Create a Date object with specific time
   */
  private setTimeOnDate(date: Date, time: string): Date {
    const result = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  /**
   * Check if a staff member is working on a specific day
   */
  isStaffWorkingOnDay(staffId: string, dayOfWeek: number): boolean {
    const schedule = dataStore.getStaffScheduleForDay(staffId, dayOfWeek);
    return schedule !== undefined && schedule.isAvailable;
  }

  /**
   * Get staff working hours for a specific day
   */
  getStaffWorkingHours(staffId: string, dayOfWeek: number): { start: string; end: string } | null {
    const schedule = dataStore.getStaffScheduleForDay(staffId, dayOfWeek);
    if (!schedule || !schedule.isAvailable) return null;
    return { start: schedule.startTime, end: schedule.endTime };
  }

  /**
   * Check if a specific time slot is available for a staff member
   */
  isTimeSlotAvailable(
    staffId: string,
    startTime: Date,
    endTime: Date
  ): boolean {
    const dayOfWeek = startTime.getDay();
    
    // Check if staff is working that day
    const workingHours = this.getStaffWorkingHours(staffId, dayOfWeek);
    if (!workingHours) return false;

    // Check if time is within working hours
    const slotStartMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const slotEndMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const workStartMinutes = this.parseTimeToMinutes(workingHours.start);
    const workEndMinutes = this.parseTimeToMinutes(workingHours.end);

    if (slotStartMinutes < workStartMinutes || slotEndMinutes > workEndMinutes) {
      return false;
    }

    // Check for conflicting appointments
    const existingAppointments = dataStore.getAppointmentsByStaffAndDate(staffId, startTime);
    
    for (const appointment of existingAppointments) {
      const appointmentStart = new Date(appointment.startTime).getTime();
      const appointmentEnd = new Date(appointment.endTime).getTime();
      const requestedStart = startTime.getTime();
      const requestedEnd = endTime.getTime();

      // Check for overlap
      if (requestedStart < appointmentEnd && requestedEnd > appointmentStart) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get available time slots for a specific date
   */
  getAvailableSlots(query: AvailabilityQuery): TimeSlot[] {
    const { businessId, serviceId, staffId, date } = query;
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();

    // Get service duration
    let serviceDuration = 30; // default 30 minutes
    if (serviceId) {
      const service = dataStore.getService(serviceId);
      if (service) {
        serviceDuration = service.duration;
      }
    }

    // Get tenant settings for buffer time
    const tenant = dataStore.getTenantByBusinessId(businessId);
    const bufferTime = tenant?.settings.appointmentBuffer ?? 0;

    // Determine which staff to check
    let staffToCheck: string[] = [];
    if (staffId) {
      staffToCheck = [staffId];
    } else if (serviceId) {
      // Get staff who can perform this service
      staffToCheck = dataStore.getStaffForService(serviceId);
    } else {
      // Get all staff for the business
      staffToCheck = dataStore.getStaffByBusiness(businessId).map(s => s.id);
    }

    // For each staff member
    for (const currentStaffId of staffToCheck) {
      const staff = dataStore.getStaffMember(currentStaffId);
      if (!staff || !staff.isActive) continue;

      // Check if staff works this day
      const workingHours = this.getStaffWorkingHours(currentStaffId, dayOfWeek);
      if (!workingHours) continue;

      // Generate time slots
      const workStart = this.parseTimeToMinutes(workingHours.start);
      const workEnd = this.parseTimeToMinutes(workingHours.end);
      const slotInterval = 30; // 30-minute intervals

      for (let minutes = workStart; minutes + serviceDuration <= workEnd; minutes += slotInterval) {
        const slotStart = this.setTimeOnDate(date, `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`);
        const slotEnd = new Date(slotStart.getTime() + (serviceDuration + bufferTime) * 60000);

        const isAvailable = this.isTimeSlotAvailable(currentStaffId, slotStart, slotEnd);

        slots.push({
          startTime: slotStart,
          endTime: new Date(slotStart.getTime() + serviceDuration * 60000),
          staffId: currentStaffId,
          staffName: staff.name,
          isAvailable,
        });
      }
    }

    return slots;
  }

  /**
   * Find the next available slot for a service
   */
  findNextAvailableSlot(
    businessId: string,
    serviceId: string,
    staffId?: string,
    startingFrom: Date = new Date()
  ): TimeSlot | null {
    const maxDaysToSearch = 30;
    const currentDate = new Date(startingFrom);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < maxDaysToSearch; i++) {
      const searchDate = new Date(currentDate);
      searchDate.setDate(searchDate.getDate() + i);

      const slots = this.getAvailableSlots({
        businessId,
        serviceId,
        staffId,
        date: searchDate,
      });

      const availableSlot = slots.find(slot => 
        slot.isAvailable && 
        new Date(slot.startTime) > startingFrom
      );

      if (availableSlot) {
        return availableSlot;
      }
    }

    return null;
  }

  /**
   * Check staff availability for a given week
   */
  getStaffWeeklySchedule(staffId: string): Map<number, { start: string; end: string } | null> {
    const schedule = new Map<number, { start: string; end: string } | null>();
    
    for (let day = 0; day <= 6; day++) {
      schedule.set(day, this.getStaffWorkingHours(staffId, day));
    }
    
    return schedule;
  }
}

export const availabilityService = new AvailabilityService();
