/**
 * Tenant middleware for multi-tenant request handling
 */

import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../models/dataStore.js';

export interface TenantRequest extends Request {
  tenantId?: string;
  businessId?: string;
}

/**
 * Middleware to extract and validate tenant context from requests
 */
export function tenantMiddleware(req: TenantRequest, res: Response, next: NextFunction): void {
  // Try to get tenant/business ID from headers first
  const tenantId = req.headers['x-tenant-id'] as string | undefined;
  const businessId = req.headers['x-business-id'] as string | undefined;

  // Or from query parameters
  const queryTenantId = req.query.tenantId as string | undefined;
  const queryBusinessId = req.query.businessId as string | undefined;

  req.tenantId = tenantId ?? queryTenantId;
  req.businessId = businessId ?? queryBusinessId;

  // If business ID is provided, validate it exists and get tenant
  if (req.businessId) {
    const business = dataStore.getBusiness(req.businessId);
    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }
    req.tenantId = business.tenantId;
  }

  next();
}

/**
 * Middleware to require tenant context
 */
export function requireTenant(req: TenantRequest, res: Response, next: NextFunction): void {
  if (!req.tenantId) {
    res.status(400).json({ error: 'Tenant ID is required' });
    return;
  }
  next();
}

/**
 * Middleware to require business context
 */
export function requireBusiness(req: TenantRequest, res: Response, next: NextFunction): void {
  if (!req.businessId) {
    res.status(400).json({ error: 'Business ID is required' });
    return;
  }
  next();
}
