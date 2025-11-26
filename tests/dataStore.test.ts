/**
 * Tests for the DataStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataStore } from '../src/models/dataStore.js';
import type { Tenant, Business, StaffMember, Service, Customer, Appointment } from '../src/types/index.js';

describe('DataStore', () => {
  let store: DataStore;

  beforeEach(() => {
    store = new DataStore();
  });

  describe('Tenant operations', () => {
    const createTestTenant = (): Tenant => ({
      id: 'tenant-1',
      name: 'Test Salon',
      businessType: 'hair_salon',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        appointmentBuffer: 15,
        maxAdvanceBooking: 30,
        cancellationPolicy: 'Standard policy',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should create and retrieve a tenant', () => {
      const tenant = createTestTenant();
      store.createTenant(tenant);

      const retrieved = store.getTenant('tenant-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Salon');
      expect(retrieved?.businessType).toBe('hair_salon');
    });

    it('should update a tenant', () => {
      const tenant = createTestTenant();
      store.createTenant(tenant);

      const updated = store.updateTenant('tenant-1', { name: 'Updated Salon' });
      expect(updated?.name).toBe('Updated Salon');
    });

    it('should return undefined for non-existent tenant', () => {
      const retrieved = store.getTenant('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Business operations', () => {
    const createTestBusiness = (): Business => ({
      id: 'business-1',
      tenantId: 'tenant-1',
      name: 'Downtown Salon',
      address: '123 Main St',
      phone: '555-1234',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should create and retrieve a business', () => {
      const business = createTestBusiness();
      store.createBusiness(business);

      const retrieved = store.getBusiness('business-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Downtown Salon');
    });

    it('should get businesses by tenant', () => {
      store.createBusiness(createTestBusiness());
      store.createBusiness({ ...createTestBusiness(), id: 'business-2', name: 'Uptown Salon' });

      const businesses = store.getBusinessesByTenant('tenant-1');
      expect(businesses).toHaveLength(2);
    });
  });

  describe('Staff operations', () => {
    const createTestStaff = (): StaffMember => ({
      id: 'staff-1',
      businessId: 'business-1',
      name: 'Jane Stylist',
      role: 'Senior Stylist',
      specialties: ['Coloring', 'Cutting'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should create and retrieve a staff member', () => {
      const staff = createTestStaff();
      store.createStaffMember(staff);

      const retrieved = store.getStaffMember('staff-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Jane Stylist');
    });

    it('should get staff by business', () => {
      store.createStaffMember(createTestStaff());
      store.createStaffMember({ ...createTestStaff(), id: 'staff-2', name: 'John Stylist' });

      const staff = store.getStaffByBusiness('business-1');
      expect(staff).toHaveLength(2);
    });

    it('should not return inactive staff', () => {
      store.createStaffMember(createTestStaff());
      store.createStaffMember({ ...createTestStaff(), id: 'staff-2', name: 'Inactive', isActive: false });

      const staff = store.getStaffByBusiness('business-1');
      expect(staff).toHaveLength(1);
    });
  });

  describe('Service operations', () => {
    const createTestService = (): Service => ({
      id: 'service-1',
      businessId: 'business-1',
      name: 'Haircut',
      duration: 30,
      price: 25,
      currency: 'USD',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should create and retrieve a service', () => {
      const service = createTestService();
      store.createService(service);

      const retrieved = store.getService('service-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Haircut');
      expect(retrieved?.price).toBe(25);
    });

    it('should get services by business', () => {
      store.createService(createTestService());
      store.createService({ ...createTestService(), id: 'service-2', name: 'Coloring' });

      const services = store.getServicesByBusiness('business-1');
      expect(services).toHaveLength(2);
    });
  });

  describe('Staff-Service relationship', () => {
    it('should assign and retrieve staff services', () => {
      store.addStaffService('staff-1', 'service-1');
      store.addStaffService('staff-1', 'service-2');

      const services = store.getStaffServices('staff-1');
      expect(services).toHaveLength(2);
      expect(services).toContain('service-1');
      expect(services).toContain('service-2');
    });

    it('should get staff for a service', () => {
      store.addStaffService('staff-1', 'service-1');
      store.addStaffService('staff-2', 'service-1');

      const staff = store.getStaffForService('service-1');
      expect(staff).toHaveLength(2);
    });

    it('should remove staff service assignment', () => {
      store.addStaffService('staff-1', 'service-1');
      store.removeStaffService('staff-1', 'service-1');

      const services = store.getStaffServices('staff-1');
      expect(services).toHaveLength(0);
    });
  });

  describe('Customer operations', () => {
    const createTestCustomer = (): Customer => ({
      id: 'customer-1',
      tenantId: 'tenant-1',
      name: 'John Doe',
      phone: '555-9999',
      email: 'john@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should create and retrieve a customer', () => {
      const customer = createTestCustomer();
      store.createCustomer(customer);

      const retrieved = store.getCustomer('customer-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('John Doe');
    });

    it('should find customer by phone', () => {
      store.createCustomer(createTestCustomer());

      const retrieved = store.getCustomerByPhone('tenant-1', '555-9999');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('John Doe');
    });
  });

  describe('Appointment operations', () => {
    const createTestAppointment = (): Appointment => ({
      id: 'appointment-1',
      businessId: 'business-1',
      customerId: 'customer-1',
      staffId: 'staff-1',
      serviceId: 'service-1',
      startTime: new Date('2024-12-15T10:00:00'),
      endTime: new Date('2024-12-15T10:30:00'),
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should create and retrieve an appointment', () => {
      const appointment = createTestAppointment();
      store.createAppointment(appointment);

      const retrieved = store.getAppointment('appointment-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.status).toBe('confirmed');
    });

    it('should get appointments by staff and date', () => {
      store.createAppointment(createTestAppointment());
      store.createAppointment({
        ...createTestAppointment(),
        id: 'appointment-2',
        startTime: new Date('2024-12-15T14:00:00'),
        endTime: new Date('2024-12-15T14:30:00'),
      });

      const appointments = store.getAppointmentsByStaffAndDate('staff-1', new Date('2024-12-15'));
      expect(appointments).toHaveLength(2);
    });

    it('should not return cancelled appointments', () => {
      store.createAppointment(createTestAppointment());
      store.createAppointment({
        ...createTestAppointment(),
        id: 'appointment-2',
        status: 'cancelled',
      });

      const appointments = store.getAppointmentsByStaffAndDate('staff-1', new Date('2024-12-15'));
      expect(appointments).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should clear all data', () => {
      store.createTenant({
        id: 'tenant-1',
        name: 'Test',
        businessType: 'hair_salon',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          appointmentBuffer: 0,
          maxAdvanceBooking: 30,
          cancellationPolicy: '',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      store.clear();

      expect(store.getTenant('tenant-1')).toBeUndefined();
    });
  });
});
