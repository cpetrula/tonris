/**
 * SMS Service Tests
 * Tests for SMS notification functionality
 */
const smsService = require('../src/modules/appointments/sms.service');
const twilioService = require('../src/modules/telephony/twilio.service');
const User = require('../src/models/User');
const env = require('../src/config/env');

// Mock dependencies
jest.mock('../src/modules/telephony/twilio.service');
jest.mock('../src/models/User');
jest.mock('../src/config/env', () => ({
  TWILIO_SMS_FROM_NUMBER: '+15555555555',
}));

describe('SMS Service', () => {
  const mockAppointment = {
    id: 'apt-123',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+15551234567',
    startTime: new Date('2024-12-25T10:00:00Z'),
    totalDuration: 60,
  };

  const mockEmployee = {
    firstName: 'Sarah',
    lastName: 'Johnson',
  };

  const mockService = {
    name: 'Haircut',
    duration: 45,
  };

  const tenantId = 'tenant-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatAppointmentSummary', () => {
    it('should format appointment details into SMS message', () => {
      const message = smsService.formatAppointmentSummary(
        mockAppointment,
        mockEmployee,
        mockService
      );

      expect(message).toContain('Appointment Confirmed!');
      expect(message).toContain('Haircut');
      expect(message).toContain('Sarah Johnson');
      expect(message).toContain('60 min');
    });

    it('should handle missing employee gracefully', () => {
      const message = smsService.formatAppointmentSummary(
        mockAppointment,
        null,
        mockService
      );

      expect(message).toContain('our team');
    });

    it('should handle missing service gracefully', () => {
      const message = smsService.formatAppointmentSummary(
        mockAppointment,
        mockEmployee,
        null
      );

      expect(message).toContain('your service');
    });
  });

  describe('isUserOptedInForSms', () => {
    it('should return false if no email provided', async () => {
      const result = await smsService.isUserOptedInForSms(null, tenantId);
      expect(result).toBe(false);
    });

    it('should return true if user exists and has opted in', async () => {
      User.findOne.mockResolvedValue({ smsOptIn: true });

      const result = await smsService.isUserOptedInForSms('john@example.com', tenantId);
      expect(result).toBe(true);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com', tenantId },
      });
    });

    it('should return false if user has opted out', async () => {
      User.findOne.mockResolvedValue({ smsOptIn: false });

      const result = await smsService.isUserOptedInForSms('john@example.com', tenantId);
      expect(result).toBe(false);
    });

    it('should return false if user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await smsService.isUserOptedInForSms('nonexistent@example.com', tenantId);
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const result = await smsService.isUserOptedInForSms('john@example.com', tenantId);
      expect(result).toBe(false);
    });
  });

  describe('sendAppointmentConfirmationSms', () => {
    beforeEach(() => {
      env.TWILIO_SMS_FROM_NUMBER = '+15555555555';
    });

    it('should send SMS when all conditions are met', async () => {
      User.findOne.mockResolvedValue({ smsOptIn: true });
      twilioService.sendSms.mockResolvedValue({ sid: 'sms-123', status: 'sent' });

      const result = await smsService.sendAppointmentConfirmationSms(
        mockAppointment,
        mockEmployee,
        mockService,
        tenantId
      );

      expect(twilioService.sendSms).toHaveBeenCalledWith({
        to: mockAppointment.customerPhone,
        from: '+15555555555',
        body: expect.stringContaining('Appointment Confirmed!'),
      });
      expect(result).toEqual({ sid: 'sms-123', status: 'sent' });
    });

    it('should not send SMS if TWILIO_SMS_FROM_NUMBER is not configured', async () => {
      env.TWILIO_SMS_FROM_NUMBER = '';

      const result = await smsService.sendAppointmentConfirmationSms(
        mockAppointment,
        mockEmployee,
        mockService,
        tenantId
      );

      expect(twilioService.sendSms).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should not send SMS if customer phone is not provided', async () => {
      const appointmentWithoutPhone = { ...mockAppointment, customerPhone: null };

      const result = await smsService.sendAppointmentConfirmationSms(
        appointmentWithoutPhone,
        mockEmployee,
        mockService,
        tenantId
      );

      expect(twilioService.sendSms).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should not send SMS if user has opted out', async () => {
      User.findOne.mockResolvedValue({ smsOptIn: false });

      const result = await smsService.sendAppointmentConfirmationSms(
        mockAppointment,
        mockEmployee,
        mockService,
        tenantId
      );

      expect(twilioService.sendSms).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should send SMS if no email provided (customer not a registered user)', async () => {
      const appointmentWithoutEmail = { ...mockAppointment, customerEmail: null };
      twilioService.sendSms.mockResolvedValue({ sid: 'sms-123', status: 'sent' });

      const result = await smsService.sendAppointmentConfirmationSms(
        appointmentWithoutEmail,
        mockEmployee,
        mockService,
        tenantId
      );

      expect(User.findOne).not.toHaveBeenCalled();
      expect(twilioService.sendSms).toHaveBeenCalled();
      expect(result).toEqual({ sid: 'sms-123', status: 'sent' });
    });

    it('should return null on SMS send failure', async () => {
      User.findOne.mockResolvedValue({ smsOptIn: true });
      twilioService.sendSms.mockRejectedValue(new Error('Twilio error'));

      const result = await smsService.sendAppointmentConfirmationSms(
        mockAppointment,
        mockEmployee,
        mockService,
        tenantId
      );

      expect(result).toBeNull();
    });
  });
});
