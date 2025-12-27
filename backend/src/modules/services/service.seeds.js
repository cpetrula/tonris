/**
 * Service Seed Data
 * Organizes default services and pricing by business type
 * 
 * This module provides default service configurations for different business types.
 * Each business type has its own set of services with appropriate pricing and durations.
 */
const crypto = require('crypto');
const { SERVICE_CATEGORIES } = require('./service.model');

/**
 * Default services for Salon / Spa business type
 */
const SALON_SPA_SERVICES = [
  {
    name: 'Haircut',
    description: 'Standard haircut service',
    category: SERVICE_CATEGORIES.HAIR,
    duration: 45,
    price: 35.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Blow Dry', price: 15.00, duration: 15 },
      { id: crypto.randomUUID(), name: 'Deep Conditioning', price: 20.00, duration: 20 },
    ],
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair coloring service',
    category: SERVICE_CATEGORIES.HAIR,
    duration: 120,
    price: 85.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Highlights', price: 40.00, duration: 30 },
      { id: crypto.randomUUID(), name: 'Toner', price: 25.00, duration: 15 },
    ],
  },
  {
    name: 'Manicure',
    description: 'Classic manicure service',
    category: SERVICE_CATEGORIES.NAILS,
    duration: 30,
    price: 25.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Gel Polish', price: 15.00, duration: 10 },
      { id: crypto.randomUUID(), name: 'Nail Art', price: 10.00, duration: 15 },
    ],
  },
  {
    name: 'Pedicure',
    description: 'Classic pedicure service',
    category: SERVICE_CATEGORIES.NAILS,
    duration: 45,
    price: 35.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Callus Removal', price: 10.00, duration: 10 },
      { id: crypto.randomUUID(), name: 'Hot Stone Massage', price: 15.00, duration: 15 },
    ],
  },
  {
    name: 'Facial',
    description: 'Basic facial treatment',
    category: SERVICE_CATEGORIES.SKIN,
    duration: 60,
    price: 65.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Microdermabrasion', price: 30.00, duration: 20 },
      { id: crypto.randomUUID(), name: 'LED Light Therapy', price: 25.00, duration: 15 },
    ],
  },
  {
    name: 'Makeup Application',
    description: 'Professional makeup application',
    category: SERVICE_CATEGORIES.MAKEUP,
    duration: 45,
    price: 55.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Lash Extensions', price: 35.00, duration: 30 },
      { id: crypto.randomUUID(), name: 'Bridal Upgrade', price: 50.00, duration: 30 },
    ],
  },
  {
    name: 'Swedish Massage',
    description: 'Relaxing full body massage',
    category: SERVICE_CATEGORIES.MASSAGE,
    duration: 60,
    price: 75.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Hot Stones', price: 20.00, duration: 15 },
      { id: crypto.randomUUID(), name: 'Aromatherapy', price: 10.00, duration: 0 },
    ],
  },
];

/**
 * Default services for Plumber business type
 * Note: Uses 'other' category as there are no plumbing-specific categories yet
 */
const PLUMBER_SERVICES = [
  {
    name: 'Drain Cleaning',
    description: 'Clear clogged drains and pipes',
    category: SERVICE_CATEGORIES.OTHER,
    duration: 60,
    price: 125.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Camera Inspection', price: 75.00, duration: 30 },
      { id: crypto.randomUUID(), name: 'Hydro Jetting', price: 150.00, duration: 45 },
    ],
  },
  {
    name: 'Faucet Repair',
    description: 'Fix leaking or broken faucets',
    category: SERVICE_CATEGORIES.OTHER,
    duration: 45,
    price: 95.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Faucet Replacement', price: 50.00, duration: 15 },
    ],
  },
  {
    name: 'Toilet Repair',
    description: 'Repair running or leaking toilets',
    category: SERVICE_CATEGORIES.OTHER,
    duration: 60,
    price: 110.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Toilet Replacement', price: 150.00, duration: 60 },
      { id: crypto.randomUUID(), name: 'Wax Ring Replacement', price: 30.00, duration: 15 },
    ],
  },
  {
    name: 'Water Heater Service',
    description: 'Water heater maintenance and repair',
    category: SERVICE_CATEGORIES.OTHER,
    duration: 90,
    price: 175.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Flush and Clean', price: 50.00, duration: 30 },
      { id: crypto.randomUUID(), name: 'Anode Rod Replacement', price: 75.00, duration: 30 },
    ],
  },
  {
    name: 'Pipe Repair',
    description: 'Fix leaking or burst pipes',
    category: SERVICE_CATEGORIES.OTHER,
    duration: 120,
    price: 200.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Pipe Replacement', price: 100.00, duration: 60 },
      { id: crypto.randomUUID(), name: 'Emergency After-Hours', price: 150.00, duration: 0 },
    ],
  },
  {
    name: 'Garbage Disposal Installation',
    description: 'Install or replace garbage disposal unit',
    category: SERVICE_CATEGORIES.OTHER,
    duration: 75,
    price: 150.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Disposal Unit (Basic)', price: 100.00, duration: 0 },
      { id: crypto.randomUUID(), name: 'Disposal Unit (Premium)', price: 250.00, duration: 0 },
    ],
  },
  {
    name: 'Sewer Line Service',
    description: 'Sewer line inspection and cleaning',
    category: SERVICE_CATEGORIES.OTHER,
    duration: 150,
    price: 350.00,
    addOns: [
      { id: crypto.randomUUID(), name: 'Trenchless Repair', price: 500.00, duration: 120 },
      { id: crypto.randomUUID(), name: 'Root Removal', price: 150.00, duration: 60 },
    ],
  },
];

/**
 * Business type name mappings
 * Maps business type names to their service configurations
 */
const BUSINESS_TYPE_SERVICES = {
  'Salon / Spa': SALON_SPA_SERVICES,
  'Plumber': PLUMBER_SERVICES,
  'Home Services': PLUMBER_SERVICES, // Home Services also gets plumber services as default
};

/**
 * Get default services for a business type
 * @param {string} businessTypeName - Name of the business type
 * @returns {Array<Object>} - Array of service configurations
 */
const getServicesByBusinessType = (businessTypeName) => {
  // Return services for the business type, or empty array if not found
  return BUSINESS_TYPE_SERVICES[businessTypeName] || [];
};

/**
 * Get all supported business types with services
 * @returns {Array<string>} - Array of business type names that have service configurations
 */
const getSupportedBusinessTypes = () => {
  return Object.keys(BUSINESS_TYPE_SERVICES);
};

module.exports = {
  SALON_SPA_SERVICES,
  PLUMBER_SERVICES,
  BUSINESS_TYPE_SERVICES,
  getServicesByBusinessType,
  getSupportedBusinessTypes,
};
