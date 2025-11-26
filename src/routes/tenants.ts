/**
 * Tenant Routes
 * API endpoints for managing tenants and businesses
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../models/dataStore.js';
import { tenantMiddleware, requireTenant, type TenantRequest } from '../middleware/tenant.js';
import type { Response } from 'express';
import type { Tenant, TenantSettings, BusinessType } from '../types/index.js';

const router = Router();

router.use(tenantMiddleware);

/**
 * Create a new tenant
 */
router.post('/tenants', (req: TenantRequest, res: Response) => {
  const { name, businessType, settings } = req.body as {
    name: string;
    businessType: BusinessType;
    settings?: Partial<TenantSettings>;
  };

  if (!name || !businessType) {
    res.status(400).json({ error: 'Name and businessType are required' });
    return;
  }

  const defaultSettings: TenantSettings = {
    timezone: 'America/New_York',
    currency: 'USD',
    appointmentBuffer: 15,
    maxAdvanceBooking: 30,
    cancellationPolicy: 'Cancellations must be made at least 24 hours in advance.',
    ...settings,
  };

  const tenant: Tenant = {
    id: uuidv4(),
    name,
    businessType,
    settings: defaultSettings,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  dataStore.createTenant(tenant);
  res.status(201).json(tenant);
});

/**
 * Get tenant by ID
 */
router.get('/tenants/:id', (req: TenantRequest, res: Response) => {
  const tenant = dataStore.getTenant(req.params.id);
  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }
  res.json(tenant);
});

/**
 * Update tenant
 */
router.patch('/tenants/:id', (req: TenantRequest, res: Response) => {
  const updates = req.body as Partial<Tenant>;
  const updated = dataStore.updateTenant(req.params.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }
  res.json(updated);
});

/**
 * Create a business for a tenant
 */
router.post('/tenants/:tenantId/businesses', (req: TenantRequest, res: Response) => {
  const { tenantId } = req.params;
  const { name, description, address, phone, email, website } = req.body as {
    name: string;
    description?: string;
    address: string;
    phone: string;
    email?: string;
    website?: string;
  };

  const tenant = dataStore.getTenant(tenantId);
  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }

  if (!name || !address || !phone) {
    res.status(400).json({ error: 'Name, address, and phone are required' });
    return;
  }

  const business = dataStore.createBusiness({
    id: uuidv4(),
    tenantId,
    name,
    description,
    address,
    phone,
    email,
    website,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.status(201).json(business);
});

/**
 * Get businesses for a tenant
 */
router.get('/tenants/:tenantId/businesses', (req: TenantRequest, res: Response) => {
  const businesses = dataStore.getBusinessesByTenant(req.params.tenantId);
  res.json(businesses);
});

/**
 * Get business by ID
 */
router.get('/businesses/:id', (req: TenantRequest, res: Response) => {
  const business = dataStore.getBusiness(req.params.id);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }
  res.json(business);
});

/**
 * Update business
 */
router.patch('/businesses/:id', (req: TenantRequest, res: Response) => {
  const updates = req.body;
  const updated = dataStore.updateBusiness(req.params.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }
  res.json(updated);
});

export default router;
