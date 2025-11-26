/**
 * Appointment Service
 * Handles creating, modifying, and cancelling appointments.
 */

import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../models/dataStore.js';
import { availabilityService } from './availabilityService.js';
import type { Appointment, AppointmentRequest, Customer } from '../types/index.js';

export interface BookingResult {
  success: boolean;
  appointment?: Appointment;
  error?: string;
}

export interface ModifyResult {
  success: boolean;
  appointment?: Appointment;
  error?: string;
}

export interface CancelResult {
  success: boolean;
  appointment?: Appointment;
  error?: string;
}

export class AppointmentService {
  /**
   * Book a new appointment
   */
  bookAppointment(request: AppointmentRequest): BookingResult {
    const {
      businessId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      staffId,
      serviceId,
      preferredTime,
      notes,
    } = request;

    // Validate business exists
    const business = dataStore.getBusiness(businessId);
    if (!business) {
      return { success: false, error: 'Business not found' };
    }

    // Validate service exists
    const service = dataStore.getService(serviceId);
    if (!service || service.businessId !== businessId) {
      return { success: false, error: 'Service not found' };
    }

    // Get or create customer
    let customer: Customer;
    const tenant = dataStore.getTenantByBusinessId(businessId);
    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    if (customerId) {
      const existingCustomer = dataStore.getCustomer(customerId);
      if (!existingCustomer) {
        return { success: false, error: 'Customer not found' };
      }
      customer = existingCustomer;
    } else {
      // Check if customer exists by phone
      const existingByPhone = dataStore.getCustomerByPhone(tenant.id, customerPhone);
      if (existingByPhone) {
        customer = existingByPhone;
      } else {
        // Create new customer
        customer = dataStore.createCustomer({
          id: uuidv4(),
          tenantId: tenant.id,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Determine staff member
    let assignedStaffId: string;
    if (staffId) {
      const staff = dataStore.getStaffMember(staffId);
      if (!staff || staff.businessId !== businessId) {
        return { success: false, error: 'Staff member not found' };
      }
      assignedStaffId = staffId;
    } else {
      // Find available staff for the service
      const staffForService = dataStore.getStaffForService(serviceId);
      if (staffForService.length === 0) {
        return { success: false, error: 'No staff available for this service' };
      }
      
      // Find first available staff
      const endTime = new Date(preferredTime.getTime() + service.duration * 60000);
      const availableStaff = staffForService.find(sid =>
        availabilityService.isTimeSlotAvailable(sid, preferredTime, endTime)
      );
      
      if (!availableStaff) {
        return { success: false, error: 'No staff available at the requested time' };
      }
      assignedStaffId = availableStaff;
    }

    // Calculate end time
    const endTime = new Date(preferredTime.getTime() + service.duration * 60000);

    // Check availability
    if (!availabilityService.isTimeSlotAvailable(assignedStaffId, preferredTime, endTime)) {
      return { success: false, error: 'Time slot is not available' };
    }

    // Create appointment
    const appointment: Appointment = {
      id: uuidv4(),
      businessId,
      customerId: customer.id,
      staffId: assignedStaffId,
      serviceId,
      startTime: preferredTime,
      endTime,
      status: 'confirmed',
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dataStore.createAppointment(appointment);

    return { success: true, appointment };
  }

  /**
   * Modify an existing appointment
   */
  modifyAppointment(
    appointmentId: string,
    newTime?: Date,
    newStaffId?: string,
    newServiceId?: string,
    newNotes?: string
  ): ModifyResult {
    const appointment = dataStore.getAppointment(appointmentId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    if (appointment.status === 'cancelled') {
      return { success: false, error: 'Cannot modify a cancelled appointment' };
    }

    if (appointment.status === 'completed') {
      return { success: false, error: 'Cannot modify a completed appointment' };
    }

    const updates: Partial<Appointment> = {};

    // Handle service change
    let serviceDuration: number;
    if (newServiceId) {
      const newService = dataStore.getService(newServiceId);
      if (!newService || newService.businessId !== appointment.businessId) {
        return { success: false, error: 'Service not found' };
      }
      updates.serviceId = newServiceId;
      serviceDuration = newService.duration;
    } else {
      const currentService = dataStore.getService(appointment.serviceId);
      serviceDuration = currentService?.duration ?? 30;
    }

    // Handle staff change
    if (newStaffId) {
      const newStaff = dataStore.getStaffMember(newStaffId);
      if (!newStaff || newStaff.businessId !== appointment.businessId) {
        return { success: false, error: 'Staff member not found' };
      }
      updates.staffId = newStaffId;
    }

    // Handle time change
    if (newTime) {
      const endTime = new Date(newTime.getTime() + serviceDuration * 60000);
      const staffToCheck = newStaffId ?? appointment.staffId;
      
      // Temporarily remove current appointment to check availability
      const currentAppointment = dataStore.getAppointment(appointmentId);
      if (currentAppointment) {
        dataStore.updateAppointment(appointmentId, { status: 'cancelled' });
      }

      const isAvailable = availabilityService.isTimeSlotAvailable(staffToCheck, newTime, endTime);
      
      // Restore the appointment
      if (currentAppointment) {
        dataStore.updateAppointment(appointmentId, { status: currentAppointment.status });
      }

      if (!isAvailable) {
        return { success: false, error: 'New time slot is not available' };
      }

      updates.startTime = newTime;
      updates.endTime = endTime;
    }

    // Handle notes change
    if (newNotes !== undefined) {
      updates.notes = newNotes;
    }

    const updatedAppointment = dataStore.updateAppointment(appointmentId, updates);
    if (!updatedAppointment) {
      return { success: false, error: 'Failed to update appointment' };
    }

    return { success: true, appointment: updatedAppointment };
  }

  /**
   * Cancel an appointment
   */
  cancelAppointment(appointmentId: string, reason?: string): CancelResult {
    const appointment = dataStore.getAppointment(appointmentId);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    if (appointment.status === 'cancelled') {
      return { success: false, error: 'Appointment is already cancelled' };
    }

    if (appointment.status === 'completed') {
      return { success: false, error: 'Cannot cancel a completed appointment' };
    }

    const notes = reason
      ? `${appointment.notes ?? ''}\nCancellation reason: ${reason}`.trim()
      : appointment.notes;

    const updatedAppointment = dataStore.updateAppointment(appointmentId, {
      status: 'cancelled',
      notes,
    });

    if (!updatedAppointment) {
      return { success: false, error: 'Failed to cancel appointment' };
    }

    return { success: true, appointment: updatedAppointment };
  }

  /**
   * Get appointment details
   */
  getAppointment(appointmentId: string): Appointment | undefined {
    return dataStore.getAppointment(appointmentId);
  }

  /**
   * Get appointments for a customer
   */
  getCustomerAppointments(customerId: string): Appointment[] {
    return dataStore.getAppointmentsByCustomer(customerId);
  }

  /**
   * Get upcoming appointments for a customer
   */
  getUpcomingAppointments(customerId: string): Appointment[] {
    const now = new Date();
    return dataStore
      .getAppointmentsByCustomer(customerId)
      .filter(a => new Date(a.startTime) > now && a.status !== 'cancelled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  /**
   * Find appointment by customer phone and upcoming date
   */
  findAppointmentByPhone(businessId: string, phone: string): Appointment | undefined {
    const tenant = dataStore.getTenantByBusinessId(businessId);
    if (!tenant) return undefined;

    const customer = dataStore.getCustomerByPhone(tenant.id, phone);
    if (!customer) return undefined;

    const now = new Date();
    const appointments = dataStore
      .getAppointmentsByCustomer(customer.id)
      .filter(
        a =>
          a.businessId === businessId &&
          new Date(a.startTime) > now &&
          a.status !== 'cancelled'
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return appointments[0];
  }
}

export const appointmentService = new AppointmentService();
