/**
 * AI Assistant Routes
 * API endpoints for the virtual AI assistant
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { assistantService } from '../services/assistantService.js';
import { tenantMiddleware, type TenantRequest } from '../middleware/tenant.js';
import type { Response } from 'express';

const router = Router();

router.use(tenantMiddleware);

/**
 * Process a message through the AI assistant
 */
router.post('/assistant/message', async (req: TenantRequest, res: Response) => {
  const { businessId, message, conversationId, customerPhone } = req.body as {
    businessId: string;
    message: string;
    conversationId?: string;
    customerPhone?: string;
  };

  if (!businessId || !message) {
    res.status(400).json({ error: 'businessId and message are required' });
    return;
  }

  // Get tenant ID from business
  const tenantId = req.tenantId;
  if (!tenantId) {
    res.status(400).json({ error: 'Unable to determine tenant' });
    return;
  }

  try {
    const response = await assistantService.processMessage(
      {
        tenantId,
        businessId,
        conversationId: conversationId ?? uuidv4(),
        customerPhone,
      },
      message
    );

    res.json({
      conversationId: conversationId ?? response.intent.type,
      ...response,
    });
  } catch (error) {
    console.error('Error processing assistant message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * Start a new conversation
 */
router.post('/assistant/conversations', (req: TenantRequest, res: Response) => {
  const { businessId, customerPhone } = req.body as {
    businessId: string;
    customerPhone?: string;
  };

  if (!businessId) {
    res.status(400).json({ error: 'businessId is required' });
    return;
  }

  const conversationId = uuidv4();

  res.status(201).json({
    conversationId,
    businessId,
    customerPhone,
    createdAt: new Date(),
  });
});

/**
 * End a conversation
 */
router.delete('/assistant/conversations/:conversationId', (req: TenantRequest, res: Response) => {
  const { conversationId } = req.params;
  
  assistantService.clearConversation(conversationId);
  
  res.json({ message: 'Conversation ended' });
});

/**
 * Webhook endpoint for phone call integration
 * This would be used by services like Twilio, etc.
 */
router.post('/assistant/webhook/call', async (req: TenantRequest, res: Response) => {
  const { businessId, callerPhone, callSid, speechResult } = req.body as {
    businessId: string;
    callerPhone: string;
    callSid: string;
    speechResult?: string;
  };

  if (!businessId || !callerPhone || !callSid) {
    res.status(400).json({ error: 'businessId, callerPhone, and callSid are required' });
    return;
  }

  const tenantId = req.tenantId;
  if (!tenantId) {
    res.status(400).json({ error: 'Unable to determine tenant' });
    return;
  }

  try {
    // If there's speech input, process it
    if (speechResult) {
      const response = await assistantService.processMessage(
        {
          tenantId,
          businessId,
          conversationId: callSid,
          customerPhone: callerPhone,
        },
        speechResult
      );

      // Return response suitable for text-to-speech
      res.json({
        speak: response.message,
        requiresFollowUp: response.requiresFollowUp,
        suggestedActions: response.suggestedActions,
      });
    } else {
      // Initial greeting
      const response = await assistantService.processMessage(
        {
          tenantId,
          businessId,
          conversationId: callSid,
          customerPhone: callerPhone,
        },
        'hello'
      );

      res.json({
        speak: response.message,
        requiresFollowUp: true,
        suggestedActions: response.suggestedActions,
      });
    }
  } catch (error) {
    console.error('Error processing webhook call:', error);
    res.status(500).json({ error: 'Failed to process call' });
  }
});

export default router;
