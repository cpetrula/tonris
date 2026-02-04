/**
 * Integration Controller
 * HTTP request handlers for integration management
 */
const integrationService = require('./integration.service');
const { INTEGRATION_PROVIDERS, INTEGRATION_STATUS } = require('./integration.model');
const vagaroApi = require('./vagaro.api');
const { Service } = require('../services/service.model');
const { Employee } = require('../employees/employee.model');
const logger = require('../../utils/logger');

/**
 * Get all integrations for the current tenant
 * GET /api/integrations
 */
async function getIntegrations(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const integrations = await integrationService.getIntegrations(tenantId);
    
    res.json({
      success: true,
      data: {
        integrations: integrations.map(i => i.toSafeObject()),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific integration by provider
 * GET /api/integrations/:provider
 */
async function getIntegration(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const { provider } = req.params;
    
    // Validate provider
    if (!Object.values(INTEGRATION_PROVIDERS).includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid integration provider',
        code: 'INVALID_PROVIDER',
      });
    }
    
    const integration = await integrationService.getIntegrationByProvider(tenantId, provider);
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found',
        code: 'INTEGRATION_NOT_FOUND',
      });
    }
    
    // Build webhook URL for display
    const webhookUrl = integrationService.buildWebhookUrl(integration.webhookToken, provider);
    
    res.json({
      success: true,
      data: {
        integration: integration.toSafeObject(),
        webhookUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update Vagaro integration
 * POST /api/integrations/vagaro
 */
async function setupVagaroIntegration(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const { config, syncSettings } = req.body;
    
    const integration = await integrationService.upsertVagaroIntegration(tenantId, {
      config,
      syncSettings,
    });
    
    // Build webhook URL for display
    const webhookUrl = integrationService.buildWebhookUrl(
      integration.webhookToken,
      INTEGRATION_PROVIDERS.VAGARO
    );
    
    logger.info(`[Integrations] Vagaro integration setup for tenant ${tenantId}`);
    
    res.json({
      success: true,
      data: {
        integration: integration.toSafeObject(),
        webhookUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update integration settings
 * PATCH /api/integrations/:provider
 */
async function updateIntegration(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const { provider } = req.params;
    const { config, syncSettings, enabled } = req.body;
    
    // Validate provider
    if (!Object.values(INTEGRATION_PROVIDERS).includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid integration provider',
        code: 'INVALID_PROVIDER',
      });
    }
    
    let integration;
    
    // Handle enable/disable
    if (typeof enabled === 'boolean') {
      integration = await integrationService.setIntegrationEnabled(tenantId, provider, enabled);
    } else {
      // Update config/syncSettings based on provider
      if (provider === INTEGRATION_PROVIDERS.VAGARO) {
        integration = await integrationService.upsertVagaroIntegration(tenantId, {
          config,
          syncSettings,
        });
      }
    }
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found',
        code: 'INTEGRATION_NOT_FOUND',
      });
    }
    
    const webhookUrl = integrationService.buildWebhookUrl(integration.webhookToken, provider);
    
    res.json({
      success: true,
      data: {
        integration: integration.toSafeObject(),
        webhookUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Regenerate webhook token
 * POST /api/integrations/:provider/regenerate-token
 */
async function regenerateToken(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const { provider } = req.params;
    
    // Validate provider
    if (!Object.values(INTEGRATION_PROVIDERS).includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid integration provider',
        code: 'INVALID_PROVIDER',
      });
    }
    
    const integration = await integrationService.regenerateWebhookToken(tenantId, provider);
    const webhookUrl = integrationService.buildWebhookUrl(integration.webhookToken, provider);
    
    logger.info(`[Integrations] Webhook token regenerated for ${provider} - tenant ${tenantId}`);
    
    res.json({
      success: true,
      data: {
        integration: integration.toSafeObject(),
        webhookUrl,
      },
    });
  } catch (error) {
    if (error.message === 'Integration not found') {
      return res.status(404).json({
        success: false,
        error: 'Integration not found',
        code: 'INTEGRATION_NOT_FOUND',
      });
    }
    next(error);
  }
}

/**
 * Delete an integration
 * DELETE /api/integrations/:provider
 */
async function deleteIntegration(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const { provider } = req.params;
    
    // Validate provider
    if (!Object.values(INTEGRATION_PROVIDERS).includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid integration provider',
        code: 'INVALID_PROVIDER',
      });
    }
    
    const deleted = await integrationService.deleteIntegration(tenantId, provider);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found',
        code: 'INTEGRATION_NOT_FOUND',
      });
    }
    
    logger.info(`[Integrations] ${provider} integration deleted for tenant ${tenantId}`);
    
    res.json({
      success: true,
      message: 'Integration deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Test Vagaro API connection
 * POST /api/integrations/vagaro/test-connection
 */
async function testVagaroConnection(req, res, next) {
  try {
    const { clientId, clientSecretKey, region } = req.body;
    
    if (!clientId || !clientSecretKey) {
      return res.status(400).json({
        success: false,
        error: 'clientId and clientSecretKey are required',
        code: 'MISSING_CREDENTIALS',
      });
    }
    
    const result = await vagaroApi.testConnection({
      clientId,
      clientSecretKey,
      region: region || 'us02',
    });
    
    res.json({
      success: result.success,
      data: {
        message: result.message,
        locations: result.locations,
      },
    });
  } catch (error) {
    logger.error(`[Integrations] Vagaro connection test error: ${error.message}`);
    res.json({
      success: false,
      data: {
        message: error.message,
        locations: [],
      },
    });
  }
}

/**
 * Get Vagaro business locations
 * POST /api/integrations/vagaro/locations
 */
async function getVagaroLocations(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    const { clientId, clientSecretKey, region } = req.body;
    
    // Check if we have credentials in the request or in the saved integration
    let credentials = { clientId, clientSecretKey, region };
    
    if (!clientId || !clientSecretKey) {
      // Try to get from saved integration
      const integration = await integrationService.getIntegrationByProvider(tenantId, INTEGRATION_PROVIDERS.VAGARO);
      if (integration?.config?.clientId && integration?.config?.clientSecretKey) {
        credentials = {
          clientId: integration.config.clientId,
          clientSecretKey: integration.config.clientSecretKey,
          region: integration.config.region || 'us02',
        };
      } else {
        return res.status(400).json({
          success: false,
          error: 'API credentials are required. Please save your credentials first.',
          code: 'MISSING_CREDENTIALS',
        });
      }
    }
    
    const locations = await vagaroApi.getLocations(credentials);
    
    res.json({
      success: true,
      data: {
        locations: locations.map(loc => ({
          businessId: loc.businessId,
          businessName: loc.businessName,
          businessGroupId: loc.businessGroupId,
          businessAlias: loc.businessAlias,
          city: loc.city,
          regionCode: loc.regionCode,
          postalCode: loc.postalCode,
        })),
      },
    });
  } catch (error) {
    logger.error(`[Integrations] Get Vagaro locations error: ${error.message}`);
    next(error);
  }
}

/**
 * Import services from Vagaro
 * POST /api/integrations/vagaro/import-services
 */
async function importVagaroServices(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    
    // Get integration config
    const integration = await integrationService.getIntegrationByProvider(tenantId, INTEGRATION_PROVIDERS.VAGARO);
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Vagaro integration not found. Please set up the integration first.',
        code: 'INTEGRATION_NOT_FOUND',
      });
    }
    
    const { clientId, clientSecretKey, region, businessId } = integration.config || {};
    
    if (!clientId || !clientSecretKey || !businessId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required configuration. Please ensure clientId, clientSecretKey, and businessId are set.',
        code: 'MISSING_CONFIG',
      });
    }
    
    logger.info(`[Integrations] Starting Vagaro services import for tenant ${tenantId}`);
    
    // Fetch services from Vagaro
    const vagaroServices = await vagaroApi.getServices({
      clientId,
      clientSecretKey,
      region: region || 'us02',
      businessId,
    });
    
    const results = {
      total: vagaroServices.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };
    
    // Process each service
    for (const vagaroService of vagaroServices) {
      try {
        // Skip parent categories (services without price/duration)
        if (vagaroService.type === 'Category' || !vagaroService.serviceId) {
          results.skipped++;
          continue;
        }
        
        const serviceData = vagaroApi.mapServiceToCriton(vagaroService, tenantId);
        
        // Check if service already exists (by vagaro ID in metadata)
        const existingService = await Service.findOne({
          where: {
            tenantId,
            name: serviceData.name,
          },
        });
        
        if (existingService) {
          // Update existing service
          await existingService.update({
            description: serviceData.description,
            category: serviceData.category,
            duration: serviceData.duration,
            price: serviceData.price,
            metadata: {
              ...existingService.metadata,
              ...serviceData.metadata,
              lastSyncedAt: new Date().toISOString(),
            },
          });
          results.updated++;
        } else {
          // Create new service
          await Service.create(serviceData);
          results.imported++;
        }
      } catch (error) {
        logger.warn(`[Integrations] Failed to import service ${vagaroService.serviceTitle}: ${error.message}`);
        results.errors.push({
          service: vagaroService.serviceTitle,
          error: error.message,
        });
      }
    }
    
    // Update integration status
    await integration.update({
      status: INTEGRATION_STATUS.ACTIVE,
      lastError: null,
      metadata: {
        ...integration.metadata,
        lastServicesImport: new Date().toISOString(),
        servicesImportResults: results,
      },
    });
    
    logger.info(`[Integrations] Vagaro services import completed for tenant ${tenantId}: ${results.imported} imported, ${results.updated} updated, ${results.skipped} skipped`);
    
    res.json({
      success: true,
      data: {
        message: `Import completed: ${results.imported} new services, ${results.updated} updated, ${results.skipped} skipped`,
        results,
      },
    });
  } catch (error) {
    logger.error(`[Integrations] Vagaro services import error: ${error.message}`);
    
    // Update integration with error
    try {
      const integration = await integrationService.getIntegrationByProvider(req.tenant.id, INTEGRATION_PROVIDERS.VAGARO);
      if (integration) {
        await integration.recordError(`Services import failed: ${error.message}`);
      }
    } catch (e) {
      // Ignore
    }
    
    next(error);
  }
}

/**
 * Import staff/employees from Vagaro
 * POST /api/integrations/vagaro/import-staff
 */
async function importVagaroStaff(req, res, next) {
  try {
    const tenantId = req.tenant.id;
    
    // Get integration config
    const integration = await integrationService.getIntegrationByProvider(tenantId, INTEGRATION_PROVIDERS.VAGARO);
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Vagaro integration not found. Please set up the integration first.',
        code: 'INTEGRATION_NOT_FOUND',
      });
    }
    
    const { clientId, clientSecretKey, region, businessId } = integration.config || {};
    
    if (!clientId || !clientSecretKey || !businessId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required configuration. Please ensure clientId, clientSecretKey, and businessId are set.',
        code: 'MISSING_CONFIG',
      });
    }
    
    logger.info(`[Integrations] Starting Vagaro staff import for tenant ${tenantId}`);
    
    // Fetch employees from Vagaro
    const vagaroEmployees = await vagaroApi.getEmployees({
      clientId,
      clientSecretKey,
      region: region || 'us02',
      businessId,
    });
    
    const results = {
      total: vagaroEmployees.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };
    
    // Process each employee
    for (const vagaroEmployee of vagaroEmployees) {
      try {
        if (!vagaroEmployee.serviceProviderId) {
          results.skipped++;
          continue;
        }
        
        const employeeData = vagaroApi.mapEmployeeToCriton(vagaroEmployee, tenantId);
        
        // Check if employee already exists (by email or vagaro ID)
        let existingEmployee = await Employee.findOne({
          where: {
            tenantId,
            email: employeeData.email,
          },
        });
        
        // Also check by vagaro ID in metadata
        if (!existingEmployee) {
          const allEmployees = await Employee.findAll({ where: { tenantId } });
          existingEmployee = allEmployees.find(e => 
            e.metadata?.vagaroServiceProviderId === vagaroEmployee.serviceProviderId
          );
        }
        
        if (existingEmployee) {
          // Update existing employee
          await existingEmployee.update({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            phone: employeeData.phone || existingEmployee.phone,
            status: employeeData.status,
            metadata: {
              ...existingEmployee.metadata,
              ...employeeData.metadata,
              lastSyncedAt: new Date().toISOString(),
            },
          });
          results.updated++;
        } else {
          // Create new employee with default schedule
          await Employee.create({
            ...employeeData,
            schedule: Employee.generateDefaultSchedule(),
          });
          results.imported++;
        }
      } catch (error) {
        logger.warn(`[Integrations] Failed to import employee ${vagaroEmployee.employeeFirstName}: ${error.message}`);
        results.errors.push({
          employee: `${vagaroEmployee.employeeFirstName} ${vagaroEmployee.employeeLastName}`,
          error: error.message,
        });
      }
    }
    
    // Update integration status
    await integration.update({
      status: INTEGRATION_STATUS.ACTIVE,
      lastError: null,
      metadata: {
        ...integration.metadata,
        lastStaffImport: new Date().toISOString(),
        staffImportResults: results,
      },
    });
    
    logger.info(`[Integrations] Vagaro staff import completed for tenant ${tenantId}: ${results.imported} imported, ${results.updated} updated, ${results.skipped} skipped`);
    
    res.json({
      success: true,
      data: {
        message: `Import completed: ${results.imported} new staff, ${results.updated} updated, ${results.skipped} skipped`,
        results,
      },
    });
  } catch (error) {
    logger.error(`[Integrations] Vagaro staff import error: ${error.message}`);
    
    // Update integration with error
    try {
      const integration = await integrationService.getIntegrationByProvider(req.tenant.id, INTEGRATION_PROVIDERS.VAGARO);
      if (integration) {
        await integration.recordError(`Staff import failed: ${error.message}`);
      }
    } catch (e) {
      // Ignore
    }
    
    next(error);
  }
}

module.exports = {
  getIntegrations,
  getIntegration,
  setupVagaroIntegration,
  updateIntegration,
  regenerateToken,
  deleteIntegration,
  testVagaroConnection,
  getVagaroLocations,
  importVagaroServices,
  importVagaroStaff,
};
