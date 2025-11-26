/**
 * FAQ Routes
 * API endpoints for managing frequently asked questions
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../models/dataStore.js';
import { tenantMiddleware, type TenantRequest } from '../middleware/tenant.js';
import type { Response } from 'express';

const router = Router();

router.use(tenantMiddleware);

/**
 * Create a new FAQ
 */
router.post('/businesses/:businessId/faqs', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const { question, answer, category } = req.body as {
    question: string;
    answer: string;
    category?: string;
  };

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  if (!question || !answer) {
    res.status(400).json({ error: 'Question and answer are required' });
    return;
  }

  const faq = dataStore.createFAQ({
    id: uuidv4(),
    businessId,
    question,
    answer,
    category,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.status(201).json(faq);
});

/**
 * Get all FAQs for a business
 */
router.get('/businesses/:businessId/faqs', (req: TenantRequest, res: Response) => {
  const { businessId } = req.params;
  const { category } = req.query as { category?: string };

  const business = dataStore.getBusiness(businessId);
  if (!business) {
    res.status(404).json({ error: 'Business not found' });
    return;
  }

  let faqs = dataStore.getFAQsByBusiness(businessId);

  if (category) {
    faqs = faqs.filter(f => f.category === category);
  }

  res.json(faqs);
});

/**
 * Get a specific FAQ
 */
router.get('/faqs/:id', (req: TenantRequest, res: Response) => {
  const faq = dataStore.getFAQ(req.params.id);
  if (!faq) {
    res.status(404).json({ error: 'FAQ not found' });
    return;
  }
  res.json(faq);
});

/**
 * Update a FAQ
 */
router.patch('/faqs/:id', (req: TenantRequest, res: Response) => {
  const updates = req.body;
  const updated = dataStore.updateFAQ(req.params.id, updates);
  if (!updated) {
    res.status(404).json({ error: 'FAQ not found' });
    return;
  }
  res.json(updated);
});

/**
 * Deactivate a FAQ
 */
router.delete('/faqs/:id', (req: TenantRequest, res: Response) => {
  const updated = dataStore.updateFAQ(req.params.id, { isActive: false });
  if (!updated) {
    res.status(404).json({ error: 'FAQ not found' });
    return;
  }
  res.json({ message: 'FAQ deactivated' });
});

export default router;
