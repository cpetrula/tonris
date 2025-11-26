/**
 * Services Routes
 * API endpoints for managing services offered by businesses
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../models/dataStore.js';
import { tenantMiddleware, type TenantRequest } from '../middleware/tenant.js';
import type { Response } from 'express';

const router = Router();

router.use(tenantMiddleware);

/**
 * Create a new service
 */
router.post('/businesses/:businessId/services', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const { name, description, duration, price, currency, category } = req.body as {
    name: string;
    description?: string;
    duration: number;
    price: number;
    currency?: string;
    category?: string;
  };

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  if (!name || !duration || price === undefined) {
    res.status(400).json({ error: 'Name, duration, and price are required' });
    return;
  }

  const service = dataStore.createService({
    id: uuidv4(),
    businessId,
    name,
    description,
    duration,
    price,
    currency: currency ?? 'USD',
    category,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.status(201).json(service);
});

/**
 * Get all services for a business
 */
router.get('/businesses/:businessId/services', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  
  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  const services = dataStore.getServicesByBusiness(businessId);
  res.json(services);
});

/**
 * Get a specific service
 */
router.get('/services/:id', (req: TenantRequest, res: Response) => {
  const service = dataStore.getService(req.params.id);
  if (!service) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json(service);
});

/**
 * Update a service
 */
router.patch('/services/:id', (req: TenantRequest, res: Response) => {
  const updates = req.body;
  const updated = dataStore.updateService(req.params.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json(updated);
});

/**
 * Deactivate a service
 */
router.delete('/services/:id', (req: TenantRequest, res: Response) => {
  const updated = dataStore.updateService(req.params.id, { isActive: false });
  if (!updated) {
    res.status(404).json({ error: 'Service not found' });
    return;
  }
  res.json({ message: 'Service deactivated' });
});

export default router;
