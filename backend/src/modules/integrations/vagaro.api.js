/**
 * Vagaro API Client
 * Handles communication with Vagaro's Public API v2
 * 
 * API Documentation: https://docs.vagaro.com/public/reference/api-introduction
 * 
 * Authentication:
 * 1. Get access token using clientId + clientSecretKey
 * 2. Use access token in header for subsequent requests
 * 
 * Required credentials from tenant:
 * - clientId: Unique client ID from Vagaro
 * - clientSecretKey: Client secret from Vagaro
 * - region: Business region (e.g., 'us02', 'us04')
 * - businessId: Specific business location ID (obtained from /locations endpoint)
 */

const logger = require('../../utils/logger');

/**
 * Vagaro API regions
 */
const VAGARO_REGIONS = ['us02', 'us04'];

/**
 * Vagaro API scopes
 */
const VAGARO_SCOPES = {
  LOCATIONS: 'locations.read',
  SERVICES: 'services.read',
  EMPLOYEES: 'employees.read',
  CUSTOMERS: 'customers.read',
  APPOINTMENTS: 'appointments.read',
};

/**
 * Build the base URL for Vagaro API
 * @param {string} region - Region code (e.g., 'us02')
 * @returns {string} Base URL
 */
function getBaseUrl(region = 'us02') {
  return `https://api.vagaro.com/${region}/api/v2`;
}

/**
 * Get an access token from Vagaro
 * @param {Object} credentials - { clientId, clientSecretKey, region }
 * @param {string} scope - Comma-separated scopes
 * @returns {Promise<Object>} - { accessToken, expiresIn }
 */
async function getAccessToken(credentials, scope = 'locations.read,services.read,employees.read') {
  const { clientId, clientSecretKey, region = 'us02' } = credentials;
  
  if (!clientId || !clientSecretKey) {
    throw new Error('Missing required credentials: clientId and clientSecretKey are required');
  }
  
  const baseUrl = getBaseUrl(region);
  const url = `${baseUrl}/merchants/generate-access-token`;
  
  logger.info(`[Vagaro API] Requesting access token from ${url}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      clientSecretKey,
      scope,
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok || data.responseCode !== 1000) {
    logger.error(`[Vagaro API] Token request failed: ${JSON.stringify(data)}`);
    throw new Error(data.message || data.errors || 'Failed to get access token from Vagaro');
  }
  
  logger.info(`[Vagaro API] Access token obtained successfully`);
  
  return {
    accessToken: data.data?.accessToken,
    expiresIn: data.data?.expiresIn,
  };
}

/**
 * Make an authenticated request to Vagaro API
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - API response data
 */
async function makeRequest({ credentials, endpoint, method = 'POST', body = null, query = {} }) {
  const { region = 'us02' } = credentials;
  
  // Get access token with appropriate scope
  const scope = Object.values(VAGARO_SCOPES).join(',');
  const { accessToken } = await getAccessToken(credentials, scope);
  
  const baseUrl = getBaseUrl(region);
  let url = `${baseUrl}${endpoint}`;
  
  // Add query parameters
  const queryParams = new URLSearchParams(query);
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  logger.info(`[Vagaro API] Making request: ${method} ${url}`);
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'accessToken': accessToken,
    },
    body: body ? JSON.stringify(body) : null,
  });
  
  const data = await response.json();
  
  if (!response.ok || (data.responseCode && data.responseCode !== 1000)) {
    logger.error(`[Vagaro API] Request failed: ${JSON.stringify(data)}`);
    throw new Error(data.message || data.errors || `Vagaro API request failed: ${response.status}`);
  }
  
  return data;
}

/**
 * Test connection to Vagaro API
 * Validates credentials by attempting to fetch locations
 * @param {Object} credentials - { clientId, clientSecretKey, region }
 * @returns {Promise<Object>} - { success, locations, message }
 */
async function testConnection(credentials) {
  try {
    const data = await makeRequest({
      credentials,
      endpoint: '/locations',
      query: { pageSize: 10 },
    });
    
    const locations = data.data?.locations || [];
    
    return {
      success: true,
      message: `Connected successfully. Found ${locations.length} location(s).`,
      locations: locations.map(loc => ({
        businessId: loc.businessId,
        businessName: loc.businessName,
        businessGroupId: loc.businessGroupId,
        city: loc.city,
        regionCode: loc.regionCode,
      })),
    };
  } catch (error) {
    logger.error(`[Vagaro API] Connection test failed: ${error.message}`);
    return {
      success: false,
      message: error.message,
      locations: [],
    };
  }
}

/**
 * Fetch all business locations
 * @param {Object} credentials - API credentials
 * @returns {Promise<Array>} - Array of locations
 */
async function getLocations(credentials) {
  const allLocations = [];
  let pageNumber = 1;
  let hasMore = true;
  
  while (hasMore) {
    const data = await makeRequest({
      credentials,
      endpoint: '/locations',
      query: { pageNumber, pageSize: 50 },
    });
    
    const locations = data.data?.locations || [];
    allLocations.push(...locations);
    
    // Check if there's a next page
    hasMore = data.data?.nextPage != null;
    pageNumber++;
    
    // Safety limit
    if (pageNumber > 100) break;
  }
  
  return allLocations;
}

/**
 * Fetch services for a business location
 * @param {Object} credentials - API credentials including businessId
 * @returns {Promise<Array>} - Array of services
 */
async function getServices(credentials) {
  const { businessId } = credentials;
  
  if (!businessId) {
    throw new Error('businessId is required to fetch services');
  }
  
  const allServices = [];
  let pageNumber = 1;
  let hasMore = true;
  
  while (hasMore) {
    const data = await makeRequest({
      credentials,
      endpoint: '/services',
      query: { businessId, pageNumber, pageSize: 50 },
    });
    
    const services = data.data?.services || [];
    allServices.push(...services);
    
    // Check if there's a next page
    hasMore = data.data?.nextPage != null;
    pageNumber++;
    
    // Safety limit
    if (pageNumber > 100) break;
  }
  
  logger.info(`[Vagaro API] Fetched ${allServices.length} services`);
  return allServices;
}

/**
 * Fetch employees/service providers for a business location
 * @param {Object} credentials - API credentials including businessId
 * @returns {Promise<Array>} - Array of employees
 */
async function getEmployees(credentials) {
  const { businessId } = credentials;
  
  if (!businessId) {
    throw new Error('businessId is required to fetch employees');
  }
  
  // The employees endpoint retrieves a single employee by serviceProviderId
  // We need to first get the list of serviceProviderIds from services
  // or use the locations endpoint to get the business info
  
  // First, get all services to extract unique serviceProviderIds
  const services = await getServices(credentials);
  
  // Extract unique service provider IDs from services
  const serviceProviderIds = new Set();
  for (const service of services) {
    if (service.servicePerformedBy) {
      for (const provider of service.servicePerformedBy) {
        if (provider.serviceProviderId) {
          serviceProviderIds.add(provider.serviceProviderId);
        }
      }
    }
  }
  
  logger.info(`[Vagaro API] Found ${serviceProviderIds.size} unique service providers from services`);
  
  // Fetch details for each employee
  const employees = [];
  for (const serviceProviderId of serviceProviderIds) {
    try {
      const data = await makeRequest({
        credentials,
        endpoint: '/employees',
        query: { businessId, serviceProviderId },
      });
      
      if (data.data) {
        employees.push(data.data);
      }
    } catch (error) {
      logger.warn(`[Vagaro API] Failed to fetch employee ${serviceProviderId}: ${error.message}`);
    }
  }
  
  logger.info(`[Vagaro API] Fetched ${employees.length} employees`);
  return employees;
}

/**
 * Map Vagaro service category to Criton category
 * @param {string} parentServiceTitle - Vagaro parent service title (category)
 * @returns {string} - Criton category
 */
function mapServiceCategory(parentServiceTitle) {
  const title = (parentServiceTitle || '').toLowerCase();
  
  if (title.includes('hair') || title.includes('cut') || title.includes('color') || title.includes('style')) {
    return 'hair';
  }
  if (title.includes('nail') || title.includes('mani') || title.includes('pedi')) {
    return 'nails';
  }
  if (title.includes('skin') || title.includes('facial') || title.includes('wax')) {
    return 'skin';
  }
  if (title.includes('makeup') || title.includes('cosmetic')) {
    return 'makeup';
  }
  if (title.includes('massage') || title.includes('body') || title.includes('spa')) {
    return 'massage';
  }
  
  return 'other';
}

/**
 * Map Vagaro service to Criton service format
 * @param {Object} vagaroService - Service from Vagaro API
 * @param {string} tenantId - Criton tenant ID
 * @returns {Object} - Criton service format
 */
function mapServiceToCriton(vagaroService, tenantId) {
  return {
    tenantId,
    name: vagaroService.serviceTitle || 'Unnamed Service',
    description: vagaroService.description || null,
    category: mapServiceCategory(vagaroService.parentServiceTitle),
    duration: vagaroService.durationMinutes || 60,
    price: parseFloat(vagaroService.price || vagaroService.businessCost || 0),
    status: 'active',
    addOns: (vagaroService.addOnIds || []).map(id => ({ vagaroId: id })),
    metadata: {
      vagaroServiceId: vagaroService.serviceId,
      vagaroParentServiceId: vagaroService.parentServiceId,
      vagaroParentServiceTitle: vagaroService.parentServiceTitle,
      importedAt: new Date().toISOString(),
      importSource: 'vagaro',
    },
  };
}

/**
 * Map Vagaro employee to Criton employee format
 * @param {Object} vagaroEmployee - Employee from Vagaro API
 * @param {string} tenantId - Criton tenant ID
 * @returns {Object} - Criton employee format
 */
function mapEmployeeToCriton(vagaroEmployee, tenantId) {
  return {
    tenantId,
    firstName: vagaroEmployee.employeeFirstName || 'Unknown',
    lastName: vagaroEmployee.employeeLastName || '',
    email: vagaroEmployee.email || `${(vagaroEmployee.employeeFirstName || 'unknown').toLowerCase()}@placeholder.local`,
    phone: vagaroEmployee.phone || null,
    employeeType: 'employee',
    status: vagaroEmployee.isActive ? 'active' : 'inactive',
    hireDate: vagaroEmployee.startDate ? new Date(vagaroEmployee.startDate) : null,
    schedule: {}, // Will need to be set up separately
    serviceIds: [], // Will be linked after services are imported
    metadata: {
      vagaroServiceProviderId: vagaroEmployee.serviceProviderId,
      vagaroBusinessGroupId: vagaroEmployee.businessGroupId,
      vagaroEmployeeType: vagaroEmployee.employeeType,
      vagaroEmployeeCardId: vagaroEmployee.employeeCardId,
      importedAt: new Date().toISOString(),
      importSource: 'vagaro',
    },
  };
}

module.exports = {
  VAGARO_REGIONS,
  VAGARO_SCOPES,
  getBaseUrl,
  getAccessToken,
  testConnection,
  getLocations,
  getServices,
  getEmployees,
  mapServiceCategory,
  mapServiceToCriton,
  mapEmployeeToCriton,
};
