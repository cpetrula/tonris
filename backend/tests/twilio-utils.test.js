/**
 * Twilio Service Utility Tests
 * Tests for Twilio service utility functions
 */

// Don't mock the twilio service for these tests - we want to test the actual implementation
jest.mock('../src/config/env', () => ({
  TWILIO_ACCOUNT_SID: 'test-sid',
  TWILIO_AUTH_TOKEN: 'test-token',
  APP_BASE_URL: 'http://localhost:3000',
  NODE_ENV: 'test',
  isProduction: () => false,
  isDevelopment: () => false,
  isTest: () => true,
}));

// Mock the Twilio client library
jest.mock('twilio', () => {
  return jest.fn(() => ({
    availablePhoneNumbers: jest.fn(),
    incomingPhoneNumbers: jest.fn(),
    messages: {
      create: jest.fn(),
    },
    calls: jest.fn(),
  }));
});

const twilioService = require('../src/modules/telephony/twilio.service');

describe('Twilio Service Utilities', () => {
  describe('extractAreaCode', () => {
    it('should extract area code from 10-digit US phone number', () => {
      const areaCode = twilioService.extractAreaCode('4155551234');
      expect(areaCode).toBe('415');
    });

    it('should extract area code from formatted phone number with dashes', () => {
      const areaCode = twilioService.extractAreaCode('415-555-1234');
      expect(areaCode).toBe('415');
    });

    it('should extract area code from formatted phone number with parentheses', () => {
      const areaCode = twilioService.extractAreaCode('(415) 555-1234');
      expect(areaCode).toBe('415');
    });

    it('should extract area code from phone number with spaces', () => {
      const areaCode = twilioService.extractAreaCode('415 555 1234');
      expect(areaCode).toBe('415');
    });

    it('should extract area code from phone number with country code +1', () => {
      const areaCode = twilioService.extractAreaCode('+1-415-555-1234');
      expect(areaCode).toBe('415');
    });

    it('should extract area code from phone number with country code 1', () => {
      const areaCode = twilioService.extractAreaCode('14155551234');
      expect(areaCode).toBe('415');
    });

    it('should return null for empty string', () => {
      const areaCode = twilioService.extractAreaCode('');
      expect(areaCode).toBeNull();
    });

    it('should return null for null input', () => {
      const areaCode = twilioService.extractAreaCode(null);
      expect(areaCode).toBeNull();
    });

    it('should return null for undefined input', () => {
      const areaCode = twilioService.extractAreaCode(undefined);
      expect(areaCode).toBeNull();
    });

    it('should return null for phone number with too few digits', () => {
      const areaCode = twilioService.extractAreaCode('555-1234');
      expect(areaCode).toBeNull();
    });

    it('should return null for non-US phone number (too many digits)', () => {
      const areaCode = twilioService.extractAreaCode('+44 20 7123 4567');
      expect(areaCode).toBeNull();
    });

    it('should handle mixed formatting', () => {
      const areaCode = twilioService.extractAreaCode('+1 (415) 555-1234');
      expect(areaCode).toBe('415');
    });

    it('should extract from 212 area code (NYC)', () => {
      const areaCode = twilioService.extractAreaCode('212-555-6789');
      expect(areaCode).toBe('212');
    });

    it('should extract from 310 area code (LA)', () => {
      const areaCode = twilioService.extractAreaCode('+1 (310) 555-9876');
      expect(areaCode).toBe('310');
    });
  });
});
