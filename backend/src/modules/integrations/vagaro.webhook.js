/**
 * Vagaro Webhook Handler
 * Processes incoming webhooks from Vagaro
 */
const integrationService = require('./integration.service');
const { INTEGRATION_PROVIDERS, INTEGRATION_STATUS } = require('./integration.model');
const { Appointment, APPOINTMENT_STATUS } = require('../appointments/appointment.model');
const logger = require('../../utils/logger');

/**
 * Handle incoming Vagaro webhook
 * POST /api/webhooks/vagaro/:webhookToken
 * 
 * Vagaro webhook payload structure:
 * {
 *   id: "event-uuid",
 *   createdDate: "2024-02-15T00:00:00Z",
 *   type: "appointment" | "customer" | "employee" | "transaction" | "formResponse" | "business_location",
 *   action: "created" | "updated" | "deleted",
 *   payload: { ... }
 * }
 */
async function handleVagaroWebhook(req, res) {
  const { webhookToken } = req.params;
  
  try {
    // Find integration by webhook token
    const integration = await integrationService.getIntegrationByWebhookToken(webhookToken);
    
    if (!integration) {
      logger.warn(`[Vagaro Webhook] Invalid webhook token: ${webhookToken.substring(0, 8)}...`);
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook token',
      });
    }
    
    if (integration.status === INTEGRATION_STATUS.DISABLED) {
      logger.info(`[Vagaro Webhook] Integration disabled for tenant ${integration.tenantId}`);
      return res.status(200).json({ success: true, message: 'Integration disabled' });
    }
    
    const { id, type, action, payload, createdDate } = req.body;
    
    logger.info(`[Vagaro Webhook] Received: type=${type}, action=${action}, eventId=${id}, tenant=${integration.tenantId}`);
    
    // Process based on event type
    switch (type) {
      case 'appointment':
        if (integration.syncSettings.syncAppointments) {
          await handleAppointmentEvent(integration, action, payload);
        }
        break;
        
      case 'customer':
        if (integration.syncSettings.syncCustomers) {
          await handleCustomerEvent(integration, action, payload);
        }
        break;
        
      case 'employee':
        if (integration.syncSettings.syncEmployees) {
          await handleEmployeeEvent(integration, action, payload);
        }
        break;
        
      case 'transaction':
        // Log transactions but don't process yet
        logger.info(`[Vagaro Webhook] Transaction event: ${JSON.stringify(payload).substring(0, 200)}`);
        break;
        
      default:
        logger.info(`[Vagaro Webhook] Unhandled event type: ${type}`);
    }
    
    // Record successful webhook
    await integration.recordWebhook();
    
    // Respond quickly to acknowledge receipt
    res.status(200).json({ success: true });
    
  } catch (error) {
    logger.error(`[Vagaro Webhook] Error processing webhook: ${error.message}`);
    
    // Try to record the error if we have the integration
    try {
      const integration = await integrationService.getIntegrationByWebhookToken(webhookToken);
      if (integration) {
        await integration.recordError(error.message);
      }
    } catch (recordError) {
      // Ignore errors recording the error
    }
    
    // Still return 200 to prevent Vagaro from retrying
    // (We've logged the error and will fix on our end)
    res.status(200).json({ success: true });
  }
}

/**
 * Handle appointment events from Vagaro
 */
async function handleAppointmentEvent(integration, action, payload) {
  const tenantId = integration.tenantId;
  
  logger.info(`[Vagaro Webhook] Processing appointment ${action}: ${payload.appointmentId}`);
  
  // Store the raw Vagaro appointment data in metadata for reference
  // The actual appointment sync would need to map Vagaro employees/services to Criton ones
  // For now, we log and store the event for manual review or future automation
  
  const vagaroData = {
    appointmentId: payload.appointmentId,
    startTime: payload.startTime,
    endTime: payload.endTime,
    bookingStatus: payload.bookingStatus,
    serviceTitle: payload.serviceTitle,
    customerName: `${payload.customerFirstName || ''} ${payload.customerLastName || ''}`.trim(),
    customerId: payload.customerId,
    serviceProviderId: payload.serviceProviderId,
    bookingSource: payload.bookingSource,
    action,
  };
  
  // Log the appointment event for now
  // In a full implementation, you would:
  // 1. Look up or create the customer in Criton
  // 2. Map the Vagaro service to a Criton service
  // 3. Map the Vagaro employee to a Criton employee
  // 4. Create/update/delete the appointment
  
  logger.info(`[Vagaro Webhook] Appointment data: ${JSON.stringify(vagaroData)}`);
  
  // TODO: Implement full appointment sync when employee/service mapping is available
}

/**
 * Handle customer events from Vagaro
 */
async function handleCustomerEvent(integration, action, payload) {
  const tenantId = integration.tenantId;
  
  logger.info(`[Vagaro Webhook] Processing customer ${action}: ${payload.customerId}`);
  
  const customerData = {
    customerId: payload.customerId,
    firstName: payload.customerFirstName,
    lastName: payload.customerLastName,
    email: payload.email,
    phone: payload.mobilePhone || payload.dayPhone,
    action,
  };
  
  logger.info(`[Vagaro Webhook] Customer data: ${JSON.stringify(customerData)}`);
  
  // TODO: Implement customer sync when customer management is available
}

/**
 * Handle employee events from Vagaro
 */
async function handleEmployeeEvent(integration, action, payload) {
  const tenantId = integration.tenantId;
  
  logger.info(`[Vagaro Webhook] Processing employee ${action}: ${payload.serviceProviderId}`);
  
  const employeeData = {
    employeeId: payload.serviceProviderId,
    firstName: payload.employeeFirstName,
    lastName: payload.employeeLastName,
    email: payload.email,
    isActive: payload.isActive,
    action,
  };
  
  logger.info(`[Vagaro Webhook] Employee data: ${JSON.stringify(employeeData)}`);
  
  // TODO: Implement employee sync when mapping is available
}

module.exports = {
  handleVagaroWebhook,
};
