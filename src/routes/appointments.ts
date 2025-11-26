/**
 * Appointment Routes
 * API endpoints for managing appointments
 */

import { Router } from 'express';
import { appointmentService } from '../services/appointmentService.js';
import { availabilityService } from '../services/availabilityService.js';
import { dataStore } from '../models/dataStore.js';
import { tenantMiddleware, type TenantRequest } from '../middleware/tenant.js';
import type { Response } from 'express';

const router = Router();

router.use(tenantMiddleware);

/**
 * Book a new appointment
 */
router.post('/appointments', (req: TenantRequest, res: Response) => {
  const {
    businessId,
    customerName,
    customerPhone,
    customerEmail,
    staffId,
    serviceId,
    preferredTime,
    notes,
  } = req.body as {
    businessId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    staffId?: string;
    serviceId: string;
    preferredTime: string;
    notes?: string;
  };

  if (!businessId || !customerName || !customerPhone || !serviceId || !preferredTime) {
    res.status(400).json({
      error: 'businessId, customerName, customerPhone, serviceId, and preferredTime are required',
    });
    return;
  }

  const result = appointmentService.bookAppointment({
    businessId,
    customerName,
    customerPhone,
    customerEmail,
    staffId,
    serviceId,
    preferredTime: new Date(preferredTime),
    notes,
  });

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.status(201).json(result.appointment);
});

/**
 * Get an appointment by ID
 */
router.get('/appointments/:id', (req: TenantRequest, res: Response) => {
  const appointment = appointmentService.getAppointment(req.params.id);
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }

  // Enrich with related data
  const service = dataStore.getService(appointment.serviceId);
  const staff = dataStore.getStaffMember(appointment.staffId);
  const customer = dataStore.getCustomer(appointment.customerId);

  res.json({
    ...appointment,
    service,
    staff,
    customer,
  });
});

/**
 * Modify an appointment
 */
router.patch('/appointments/:id', (req: TenantRequest, res: Response) => {
  const { newTime, newStaffId, newServiceId, notes } = req.body as {
    newTime?: string;
    newStaffId?: string;
    newServiceId?: string;
    notes?: string;
  };

  const result = appointmentService.modifyAppointment(
    req.params.id,
    newTime ? new Date(newTime) : undefined,
    newStaffId,
    newServiceId,
    notes
  );

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json(result.appointment);
});

/**
 * Cancel an appointment
 */
router.delete('/appointments/:id', (req: TenantRequest, res: Response) => {
  const { reason } = req.body as { reason?: string };

  const result = appointmentService.cancelAppointment(req.params.id, reason);

  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({ message: 'Appointment cancelled', appointment: result.appointment });
});

/**
 * Get appointments for a business
 */
router.get('/businesses/:businessId/appointments', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const { date, staffId, status } = req.query as {
    date?: string;
    staffId?: string;
    status?: string;
  };

  let appointments = dataStore.getAppointmentsByBusiness(businessId);

  // Filter by date if provided
  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    appointments = appointments.filter(
      a => new Date(a.startTime) >= targetDate && new Date(a.startTime) < nextDay
    );
  }

  // Filter by staff if provided
  if (staffId) {
    appointments = appointments.filter(a => a.staffId === staffId);
  }

  // Filter by status if provided
  if (status) {
    appointments = appointments.filter(a => a.status === status);
  }

  // Sort by start time
  appointments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  res.json(appointments);
});

/**
 * Check availability
 */
router.get('/businesses/:businessId/availability', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const { date, serviceId, staffId } = req.query as {
    date?: string;
    serviceId?: string;
    staffId?: string;
  };

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const slots = availabilityService.getAvailableSlots({
    businessId,
    serviceId,
    staffId,
    date: targetDate,
  });

  const availableSlots = slots.filter(s => s.isAvailable);

  res.json({
    date: targetDate.toISOString(),
    totalSlots: slots.length,
    availableCount: availableSlots.length,
    slots: availableSlots,
  });
});

/**
 * Find next available slot
 */
router.get('/businesses/:businessId/availability/next', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const { serviceId, staffId } = req.query as {
    serviceId?: string;
    staffId?: string;
  };

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  if (!serviceId) {
    res.status(400).json({ error: 'serviceId is required' });
    return;
  }

  const slot = availabilityService.findNextAvailableSlot(businessId, serviceId, staffId);

  if (!slot) {
    res.status(404).json({ error: 'No available slots found in the next 30 days' });
    return;
  }

  res.json(slot);
});

export default router;
