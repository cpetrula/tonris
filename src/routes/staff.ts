/**
 * Staff Routes
 * API endpoints for managing staff members and their schedules
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../models/dataStore.js';
import { availabilityService } from '../services/availabilityService.js';
import { tenantMiddleware, type TenantRequest } from '../middleware/tenant.js';
import type { Response } from 'express';

const router = Router();

router.use(tenantMiddleware);

/**
 * Create a new staff member
 */
router.post('/businesses/:businessId/staff', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const { name, email, phone, role, specialties } = req.body as {
    name: string;
    email?: string;
    phone?: string;
    role: string;
    specialties?: string[];
  };

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  if (!name || !role) {
    res.status(400).json({ error: 'Name and role are required' });
    return;
  }

  const staffMember = dataStore.createStaffMember({
    id: uuidv4(),
    businessId,
    name,
    email,
    phone,
    role,
    specialties,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.status(201).json(staffMember);
});

/**
 * Get all staff for a business
 */
router.get('/businesses/:businessId/staff', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  
  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const staff = dataStore.getStaffByBusiness(businessId);
  res.json(staff);
});

/**
 * Get a specific staff member
 */
router.get('/staff/:id', (req: TenantRequest, res: Response) => {
  const staff = dataStore.getStaffMember(req.params.id);
  if (!staff) {
    res.status(404).json({ error: 'Staff member not found' });
    return;
  }
  res.json(staff);
});

/**
 * Update a staff member
 */
router.patch('/staff/:id', (req: TenantRequest, res: Response) => {
  const updates = req.body;
  const updated = dataStore.updateStaffMember(req.params.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Staff member not found' });
    return;
  }
  res.json(updated);
});

/**
 * Get staff schedule
 */
router.get('/staff/:id/schedule', (req: TenantRequest, res: Response) => {
  const staff = dataStore.getStaffMember(req.params.id);
  if (!staff) {
    res.status(404).json({ error: 'Staff member not found' });
    return;
  }

  const schedule = availabilityService.getStaffWeeklySchedule(req.params.id);
  res.json({
    staffId: req.params.id,
    staffName: staff.name,
    schedule: Object.fromEntries(schedule),
  });
});

/**
 * Set staff schedule for a day
 */
router.post('/staff/:id/schedule', (req: TenantRequest, res: Response) => {
  const staffId = req.params.id;
  const { dayOfWeek, startTime, endTime, isAvailable } = req.body as {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  };

  const staff = dataStore.getStaffMember(staffId);
  if (!staff) {
    res.status(404).json({ error: 'Staff member not found' });
    return;
  }

  if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
    res.status(400).json({ error: 'Valid dayOfWeek (0-6) is required' });
    return;
  }

  // Check if schedule exists for this day
  const existing = dataStore.getStaffScheduleForDay(staffId, dayOfWeek);
  
  if (existing) {
    const updated = dataStore.updateStaffSchedule(existing.id, {
      startTime,
      endTime,
      isAvailable,
    });
    res.json(updated);
  } else {
    const schedule = dataStore.createStaffSchedule({
      id: uuidv4(),
      staffId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable,
    });
    res.status(201).json(schedule);
  }
});

/**
 * Assign a service to a staff member
 */
router.post('/staff/:staffId/services/:serviceId', (req: TenantRequest, res: Response) => {
  const { staffId, serviceId } = req.params;

  const staff = dataStore.getStaffMember(staffId);
  if (!staff) {
    res.status(404).json({ error: 'Staff member not found' });
    return;
  }

  const service = dataStore.getService(serviceId);
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }

  dataStore.addStaffService(staffId, serviceId);
  res.json({ message: 'Service assigned to staff member' });
});

/**
 * Remove a service from a staff member
 */
router.delete('/staff/:staffId/services/:serviceId', (req: TenantRequest, res: Response) => {
  const { staffId, serviceId } = req.params;
  dataStore.removeStaffService(staffId, serviceId);
  res.json({ message: 'Service removed from staff member' });
});

/**
 * Get services a staff member can perform
 */
router.get('/staff/:id/services', (req: TenantRequest, res: Response) => {
  const staffId = req.params.id;
  
  const staff = dataStore.getStaffMember(staffId);
  if (!staff) {
    res.status(404).json({ error: 'Staff member not found' });
    return;
  }

  const serviceIds = dataStore.getStaffServices(staffId);
  const services = serviceIds.map(id => dataStore.getService(id)).filter(Boolean);
  
  res.json(services);
});

export default router;
