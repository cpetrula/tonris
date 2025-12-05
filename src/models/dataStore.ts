/**
 * In-memory data store for development and testing.
 * In production, this would be replaced with a real database.
 */

import type {
  Tenant,
  Business,
  BusinessHours,
  StaffMember,
  StaffSchedule,
  Service,
  StaffService,
  Customer,
  Appointment,
  FAQ,
} from '../types/index.js';

export class DataStore {
  private tenants: Map<string, Tenant> = new Map();
  private businesses: Map<string, Business> = new Map();
  private businessHours: Map<string, BusinessHours> = new Map();
  private staff: Map<string, StaffMember> = new Map();
  private staffSchedules: Map<string, StaffSchedule> = new Map();
  private services: Map<string, Service> = new Map();
  private staffServices: StaffService[] = [];
  private customers: Map<string, Customer> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private faqs: Map<string, FAQ> = new Map();

  // Tenant operations
  getTenant(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  getTenantByBusinessId(businessId: string): Tenant | undefined {
    const business = this.businesses.get(businessId);
    if (!business) return undefined;
    return this.tenants.get(business.tenantId);
  }

  createTenant(tenant: Tenant): Tenant {
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant | undefined {
    const tenant = this.tenants.get(id);
    if (!tenant) return undefined;
    const updated = { ...tenant, ...updates, updatedAt: new Date() };
    this.tenants.set(id, updated);
    return updated;
  }

  // Business operations
  getBusiness(id: string): Business | undefined {
    return this.businesses.get(id);
  }

  getBusinessesByTenant(tenantId: string): Business[] {
    return Array.from(this.businesses.values()).filter(b => b.tenantId === tenantId);
  }

  createBusiness(business: Business): Business {
    this.businesses.set(business.id, business);
    return business;
  }

  updateBusiness(id: string, updates: Partial<Business>): Business | undefined {
    const business = this.businesses.get(id);
    if (!business) return undefined;
    const updated = { ...business, ...updates, updatedAt: new Date() };
    this.businesses.set(id, updated);
    return updated;
  }

  // Business Hours operations
  getBusinessHours(businessId: string): BusinessHours[] {
    return Array.from(this.businessHours.values()).filter(h => h.businessId === businessId);
  }

  getBusinessHoursForDay(businessId: string, dayOfWeek: number): BusinessHours | undefined {
    return Array.from(this.businessHours.values()).find(
      h => h.businessId === businessId && h.dayOfWeek === dayOfWeek
    );
  }

  createBusinessHours(hours: BusinessHours): BusinessHours {
    this.businessHours.set(hours.id, hours);
    return hours;
  }

  updateBusinessHours(id: string, updates: Partial<BusinessHours>): BusinessHours | undefined {
    const hours = this.businessHours.get(id);
    if (!hours) return undefined;
    const updated = { ...hours, ...updates };
    this.businessHours.set(id, updated);
    return updated;
  }

  // Staff operations
  getStaffMember(id: string): StaffMember | undefined {
    return this.staff.get(id);
  }

  getStaffByBusiness(businessId: string): StaffMember[] {
    return Array.from(this.staff.values()).filter(
      s => s.businessId === businessId && s.isActive
    );
  }

  createStaffMember(staffMember: StaffMember): StaffMember {
    this.staff.set(staffMember.id, staffMember);
    return staffMember;
  }

  updateStaffMember(id: string, updates: Partial<StaffMember>): StaffMember | undefined {
    const member = this.staff.get(id);
    if (!member) return undefined;
    const updated = { ...member, ...updates, updatedAt: new Date() };
    this.staff.set(id, updated);
    return updated;
  }

  // Staff Schedule operations
  getStaffSchedule(staffId: string): StaffSchedule[] {
    return Array.from(this.staffSchedules.values()).filter(s => s.staffId === staffId);
  }

  getStaffScheduleForDay(staffId: string, dayOfWeek: number): StaffSchedule | undefined {
    return Array.from(this.staffSchedules.values()).find(
      s => s.staffId === staffId && s.dayOfWeek === dayOfWeek
    );
  }

  createStaffSchedule(schedule: StaffSchedule): StaffSchedule {
    this.staffSchedules.set(schedule.id, schedule);
    return schedule;
  }

  updateStaffSchedule(id: string, updates: Partial<StaffSchedule>): StaffSchedule | undefined {
    const schedule = this.staffSchedules.get(id);
    if (!schedule) return undefined;
    const updated = { ...schedule, ...updates };
    this.staffSchedules.set(id, updated);
    return updated;
  }

  // Service operations
  getService(id: string): Service | undefined {
    return this.services.get(id);
  }

  getServicesByBusiness(businessId: string): Service[] {
    return Array.from(this.services.values()).filter(
      s => s.businessId === businessId && s.isActive
    );
  }

  createService(service: Service): Service {
    this.services.set(service.id, service);
    return service;
  }

  updateService(id: string, updates: Partial<Service>): Service | undefined {
    const service = this.services.get(id);
    if (!service) return undefined;
    const updated = { ...service, ...updates, updatedAt: new Date() };
    this.services.set(id, updated);
    return updated;
  }

  // Staff-Service relationship operations
  getStaffServices(staffId: string): string[] {
    return this.staffServices.filter(ss => ss.staffId === staffId).map(ss => ss.serviceId);
  }

  getStaffForService(serviceId: string): string[] {
    return this.staffServices.filter(ss => ss.serviceId === serviceId).map(ss => ss.staffId);
  }

  addStaffService(staffId: string, serviceId: string): void {
    const exists = this.staffServices.some(
      ss => ss.staffId === staffId && ss.serviceId === serviceId
    );
    if (!exists) {
      this.staffServices.push({ staffId, serviceId });
    }
  }

  removeStaffService(staffId: string, serviceId: string): void {
    this.staffServices = this.staffServices.filter(
      ss => !(ss.staffId === staffId && ss.serviceId === serviceId)
    );
  }

  // Customer operations
  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  getCustomerByPhone(tenantId: string, phone: string): Customer | undefined {
    return Array.from(this.customers.values()).find(
      c => c.tenantId === tenantId && c.phone === phone
    );
  }

  getCustomersByTenant(tenantId: string): Customer[] {
    return Array.from(this.customers.values()).filter(c => c.tenantId === tenantId);
  }

  createCustomer(customer: Customer): Customer {
    this.customers.set(customer.id, customer);
    return customer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    const updated = { ...customer, ...updates, updatedAt: new Date() };
    this.customers.set(id, updated);
    return updated;
  }

  // Appointment operations
  getAppointment(id: string): Appointment | undefined {
    return this.appointments.get(id);
  }

  getAppointmentsByBusiness(businessId: string): Appointment[] {
    return Array.from(this.appointments.values()).filter(a => a.businessId === businessId);
  }

  getAppointmentsByCustomer(customerId: string): Appointment[] {
    return Array.from(this.appointments.values()).filter(a => a.customerId === customerId);
  }

  getAppointmentsByStaff(staffId: string): Appointment[] {
    return Array.from(this.appointments.values()).filter(a => a.staffId === staffId);
  }

  getAppointmentsByStaffAndDate(staffId: string, date: Date): Appointment[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.appointments.values()).filter(
      a => a.staffId === staffId &&
           a.startTime >= startOfDay &&
           a.startTime <= endOfDay &&
           a.status !== 'cancelled'
    );
  }

  createAppointment(appointment: Appointment): Appointment {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | undefined {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    const updated = { ...appointment, ...updates, updatedAt: new Date() };
    this.appointments.set(id, updated);
    return updated;
  }

  // FAQ operations
  getFAQ(id: string): FAQ | undefined {
    return this.faqs.get(id);
  }

  getFAQsByBusiness(businessId: string): FAQ[] {
    return Array.from(this.faqs.values()).filter(
      f => f.businessId === businessId && f.isActive
    );
  }

  createFAQ(faq: FAQ): FAQ {
    this.faqs.set(faq.id, faq);
    return faq;
  }

  updateFAQ(id: string, updates: Partial<FAQ>): FAQ | undefined {
    const faq = this.faqs.get(id);
    if (!faq) return undefined;
    const updated = { ...faq, ...updates, updatedAt: new Date() };
    this.faqs.set(id, updated);
    return updated;
  }

  // Clear all data (useful for testing)
  clear(): void {
    this.tenants.clear();
    this.businesses.clear();
    this.businessHours.clear();
    this.staff.clear();
    this.staffSchedules.clear();
    this.services.clear();
    this.staffServices = [];
    this.customers.clear();
    this.appointments.clear();
    this.faqs.clear();
  }
}

// Export singleton instance
export const dataStore = new DataStore();
