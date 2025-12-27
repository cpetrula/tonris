/**
 * Service Seeds Tests
 * Tests for service seed data functionality organized by business type
 */

const {
  getServicesByBusinessType,
  getSupportedBusinessTypes,
  SALON_SPA_SERVICES,
  PLUMBER_SERVICES,
} = require('../src/modules/services/service.seeds');

describe('Service Seed Data Module', () => {
  describe('getSupportedBusinessTypes', () => {
    it('should return an array of supported business type names', () => {
      const types = getSupportedBusinessTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });

    it('should include "Salon / Spa" in supported types', () => {
      const types = getSupportedBusinessTypes();
      expect(types).toContain('Salon / Spa');
    });

    it('should include "Plumber" in supported types', () => {
      const types = getSupportedBusinessTypes();
      expect(types).toContain('Plumber');
    });
  });

  describe('getServicesByBusinessType', () => {
    it('should return Salon/Spa services for "Salon / Spa" business type', () => {
      const services = getServicesByBusinessType('Salon / Spa');
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      expect(services).toEqual(SALON_SPA_SERVICES);
    });

    it('should return Plumber services for "Plumber" business type', () => {
      const services = getServicesByBusinessType('Plumber');
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      expect(services).toEqual(PLUMBER_SERVICES);
    });

    it('should return Plumber services for "Home Services" business type', () => {
      const services = getServicesByBusinessType('Home Services');
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      expect(services).toEqual(PLUMBER_SERVICES);
    });

    it('should return empty array for unsupported business type', () => {
      const services = getServicesByBusinessType('Unsupported Type');
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBe(0);
    });

    it('should return empty array for null business type', () => {
      const services = getServicesByBusinessType(null);
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBe(0);
    });
  });

  describe('SALON_SPA_SERVICES', () => {
    it('should have valid structure for all services', () => {
      SALON_SPA_SERVICES.forEach((service) => {
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('description');
        expect(service).toHaveProperty('category');
        expect(service).toHaveProperty('duration');
        expect(service).toHaveProperty('price');
        expect(service).toHaveProperty('addOns');
        
        expect(typeof service.name).toBe('string');
        expect(typeof service.description).toBe('string');
        expect(typeof service.category).toBe('string');
        expect(typeof service.duration).toBe('number');
        expect(typeof service.price).toBe('number');
        expect(Array.isArray(service.addOns)).toBe(true);
        
        // Validate positive values
        expect(service.duration).toBeGreaterThan(0);
        expect(service.price).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include common salon services', () => {
      const serviceNames = SALON_SPA_SERVICES.map(s => s.name);
      expect(serviceNames).toContain('Haircut');
      expect(serviceNames).toContain('Manicure');
      expect(serviceNames).toContain('Pedicure');
    });

    it('should have valid add-ons with proper structure', () => {
      SALON_SPA_SERVICES.forEach((service) => {
        service.addOns.forEach((addOn) => {
          expect(addOn).toHaveProperty('id');
          expect(addOn).toHaveProperty('name');
          expect(addOn).toHaveProperty('price');
          expect(addOn).toHaveProperty('duration');
          
          expect(typeof addOn.id).toBe('string');
          expect(typeof addOn.name).toBe('string');
          expect(typeof addOn.price).toBe('number');
          expect(typeof addOn.duration).toBe('number');
          
          // Validate positive values
          expect(addOn.price).toBeGreaterThanOrEqual(0);
          expect(addOn.duration).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('PLUMBER_SERVICES', () => {
    it('should have valid structure for all services', () => {
      PLUMBER_SERVICES.forEach((service) => {
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('description');
        expect(service).toHaveProperty('category');
        expect(service).toHaveProperty('duration');
        expect(service).toHaveProperty('price');
        expect(service).toHaveProperty('addOns');
        
        expect(typeof service.name).toBe('string');
        expect(typeof service.description).toBe('string');
        expect(typeof service.category).toBe('string');
        expect(typeof service.duration).toBe('number');
        expect(typeof service.price).toBe('number');
        expect(Array.isArray(service.addOns)).toBe(true);
        
        // Validate positive values
        expect(service.duration).toBeGreaterThan(0);
        expect(service.price).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include common plumbing services', () => {
      const serviceNames = PLUMBER_SERVICES.map(s => s.name);
      expect(serviceNames).toContain('Drain Cleaning');
      expect(serviceNames).toContain('Faucet Repair');
      expect(serviceNames).toContain('Toilet Repair');
      expect(serviceNames).toContain('Water Heater Service');
    });

    it('should have valid add-ons with proper structure', () => {
      PLUMBER_SERVICES.forEach((service) => {
        service.addOns.forEach((addOn) => {
          expect(addOn).toHaveProperty('id');
          expect(addOn).toHaveProperty('name');
          expect(addOn).toHaveProperty('price');
          expect(addOn).toHaveProperty('duration');
          
          expect(typeof addOn.id).toBe('string');
          expect(typeof addOn.name).toBe('string');
          expect(typeof addOn.price).toBe('number');
          expect(typeof addOn.duration).toBe('number');
          
          // Validate positive values
          expect(addOn.price).toBeGreaterThanOrEqual(0);
          expect(addOn.duration).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should have reasonable pricing for plumbing services', () => {
      PLUMBER_SERVICES.forEach((service) => {
        // Plumbing services should generally be higher priced than salon services
        expect(service.price).toBeGreaterThan(50);
      });
    });
  });

  describe('Service uniqueness', () => {
    it('should have unique service names within Salon/Spa services', () => {
      const names = SALON_SPA_SERVICES.map(s => s.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have unique service names within Plumber services', () => {
      const names = PLUMBER_SERVICES.map(s => s.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });
  });
});
