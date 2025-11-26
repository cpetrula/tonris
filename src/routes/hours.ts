/**
 * Business Hours Routes
 * API endpoints for managing business hours
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../models/dataStore.js';
import { tenantMiddleware, type TenantRequest } from '../middleware/tenant.js';
import type { Response } from 'express';

const router = Router();

router.use(tenantMiddleware);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Get business hours
 */
router.get('/businesses/:businessId/hours', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const hours = dataStore.getBusinessHours(businessId);
  
  // Format response with day names
  const formattedHours = DAY_NAMES.map((name, index) => {
    const dayHours = hours.find(h => h.dayOfWeek === index);
    return {
      day: name,
      dayOfWeek: index,
      ...dayHours ? {
        openTime: dayHours.openTime,
        closeTime: dayHours.closeTime,
        isClosed: dayHours.isClosed,
      } : {
        openTime: null,
        closeTime: null,
        isClosed: true,
      },
    };
  });

  res.json(formattedHours);
});

/**
 * Set business hours for a specific day
 */
router.post('/businesses/:businessId/hours', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const { dayOfWeek, openTime, closeTime, isClosed } = req.body as {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  };

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  if (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6) {
    res.status(400).json({ error: 'Valid dayOfWeek (0-6) is required' });
    return;
  }

  // Check if hours exist for this day
  const existingHours = dataStore.getBusinessHoursForDay(businessId, dayOfWeek);

  if (existingHours) {
    const updated = dataStore.updateBusinessHours(existingHours.id, {
      openTime,
      closeTime,
      isClosed: isClosed ?? false,
    });
    res.json(updated);
  } else {
    const hours = dataStore.createBusinessHours({
      id: uuidv4(),
      businessId,
      dayOfWeek,
      openTime,
      closeTime,
      isClosed: isClosed ?? false,
    });
    res.status(201).json(hours);
  }
});

/**
 * Set multiple business hours at once
 */
router.put('/businesses/:businessId/hours', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const hoursData = req.body as Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
  }>;

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  if (!Array.isArray(hoursData)) {
    res.status(400).json({ error: 'Request body must be an array of hours' });
    return;
  }

  const results = hoursData.map(h => {
    const existing = dataStore.getBusinessHoursForDay(businessId, h.dayOfWeek);
    
    if (existing) {
      return dataStore.updateBusinessHours(existing.id, {
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed ?? false,
      });
    } else {
      return dataStore.createBusinessHours({
        id: uuidv4(),
        businessId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed ?? false,
      });
    }
  });

  res.json(results);
});

export default router;
