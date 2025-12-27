/**
 * Service Seeds Tests
 * Tests for service seed data functionality organized by business type
 */

const {
  getServicesByBusinessType,
  getSupportedBusinessTypes,
  generateSalonSpaServices,
  generatePlumberServices,
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
      // Verify it has the expected salon services
      const serviceNames = services.map(s => s.name);
      expect(serviceNames).toContain('Haircut');
      expect(serviceNames).toContain('Manicure');
    });

    it('should return Plumber services for "Plumber" business type', () => {
      const services = getServicesByBusinessType('Plumber');
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      // Verify it has the expected plumber services
      const serviceNames = services.map(s => s.name);
      expect(serviceNames).toContain('Drain Cleaning');
      expect(serviceNames).toContain('Faucet Repair');
    });

    it('should return Plumber services for "Home Services" business type', () => {
      const services = getServicesByBusinessType('Home Services');
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      // Verify it has the expected plumber services
      const serviceNames = services.map(s => s.name);
      expect(serviceNames).toContain('Drain Cleaning');
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

    it('should generate unique add-on IDs on each call', () => {
      const services1 = getServicesByBusinessType('Salon / Spa');
      const services2 = getServicesByBusinessType('Salon / Spa');
      
      // Get first add-on ID from first service in both calls
      const addOn1 = services1[0].addOns[0].id;
      const addOn2 = services2[0].addOns[0].id;
      
      // They should be different
      expect(addOn1).not.toBe(addOn2);
    });
  });

  describe('generateSalonSpaServices', () => {
    it('should have valid structure for all services', () => {
      const services = generateSalonSpaServices();
      services.forEach((service) => {
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
      const services = generateSalonSpaServices();
      const serviceNames = services.map(s => s.name);
      expect(serviceNames).toContain('Haircut');
      expect(serviceNames).toContain('Manicure');
      expect(serviceNames).toContain('Pedicure');
    });

    it('should have valid add-ons with proper structure', () => {
      const services = generateSalonSpaServices();
      services.forEach((service) => {
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

  describe('generatePlumberServices', () => {
    it('should have valid structure for all services', () => {
      const services = generatePlumberServices();
      services.forEach((service) => {
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
      const services = generatePlumberServices();
      const serviceNames = services.map(s => s.name);
      expect(serviceNames).toContain('Drain Cleaning');
      expect(serviceNames).toContain('Faucet Repair');
      expect(serviceNames).toContain('Toilet Repair');
      expect(serviceNames).toContain('Water Heater Service');
    });

    it('should have valid add-ons with proper structure', () => {
      const services = generatePlumberServices();
      services.forEach((service) => {
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

    // Minimum reasonable price threshold for plumbing services
    const MIN_PLUMBER_PRICE = 50;
    
    it('should have reasonable pricing for plumbing services', () => {
      const services = generatePlumberServices();
      services.forEach((service) => {
        // Plumbing services should generally be higher priced than salon services
        expect(service.price).toBeGreaterThan(MIN_PLUMBER_PRICE);
      });
    });
  });

  describe('Service uniqueness', () => {
    it('should have unique service names within Salon/Spa services', () => {
      const services = generateSalonSpaServices();
      const names = services.map(s => s.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have unique service names within Plumber services', () => {
      const services = generatePlumberServices();
      const names = services.map(s => s.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });
  });
});
