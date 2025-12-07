/**
 * Tenant Utility Tests
 * Tests for tenant utility functions
 */

const { AppError } = require('../src/middleware/errorHandler');

// Mock the Tenant model
const mockTenantModel = {
  findOne: jest.fn(),
};

jest.mock('../src/modules/tenants/tenant.model', () => ({
  Tenant: mockTenantModel,
  TENANT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled',
  },
  PLAN_TYPES: {
    FREE: 'free',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
  },
}));

// Import after mocking
const { getTenantUUID } = require('../src/utils/tenant');

describe('Tenant Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTenantUUID', () => {
    const mockTenantId = 'de535df4-ccee-11f0-a2aa-12736706c408';
    const mockSlug = 'hair-done-right-salon';

    it('should return tenant UUID when given a valid UUID', async () => {
      const mockTenant = {
        id: mockTenantId,
        slug: mockSlug,
        name: 'Test Salon',
      };
      mockTenantModel.findOne.mockResolvedValue(mockTenant);

      const result = await getTenantUUID(mockTenantId);

      expect(result).toBe(mockTenantId);
      expect(mockTenantModel.findOne).toHaveBeenCalledWith({
        where: { id: mockTenantId },
      });
    });

    it('should return tenant UUID when given a valid slug', async () => {
      const mockTenant = {
        id: mockTenantId,
        slug: mockSlug,
        name: 'Test Salon',
      };
      mockTenantModel.findOne.mockResolvedValue(mockTenant);

      const result = await getTenantUUID(mockSlug);

      expect(result).toBe(mockTenantId);
      expect(mockTenantModel.findOne).toHaveBeenCalledWith({
        where: { slug: mockSlug },
      });
    });

    it('should throw TENANT_NOT_FOUND error when UUID does not exist', async () => {
      mockTenantModel.findOne.mockResolvedValue(null);

      await expect(getTenantUUID(mockTenantId)).rejects.toThrow(AppError);
      await expect(getTenantUUID(mockTenantId)).rejects.toThrow('Tenant not found');
      
      try {
        await getTenantUUID(mockTenantId);
      } catch (error) {
        expect(error.code).toBe('TENANT_NOT_FOUND');
        expect(error.statusCode).toBe(404);
      }
    });

    it('should throw TENANT_NOT_FOUND error when slug does not exist', async () => {
      mockTenantModel.findOne.mockResolvedValue(null);

      await expect(getTenantUUID(mockSlug)).rejects.toThrow(AppError);
      await expect(getTenantUUID(mockSlug)).rejects.toThrow('Tenant not found');
      
      try {
        await getTenantUUID(mockSlug);
      } catch (error) {
        expect(error.code).toBe('TENANT_NOT_FOUND');
        expect(error.statusCode).toBe(404);
      }
    });

    it('should handle lowercase UUID', async () => {
      const lowercaseUUID = 'de535df4-ccee-11f0-a2aa-12736706c408';
      const mockTenant = {
        id: lowercaseUUID,
        slug: mockSlug,
        name: 'Test Salon',
      };
      mockTenantModel.findOne.mockResolvedValue(mockTenant);

      const result = await getTenantUUID(lowercaseUUID);

      expect(result).toBe(lowercaseUUID);
      expect(mockTenantModel.findOne).toHaveBeenCalledWith({
        where: { id: lowercaseUUID },
      });
    });

    it('should handle uppercase UUID', async () => {
      const uppercaseUUID = 'DE535DF4-CCEE-11F0-A2AA-12736706C408';
      const mockTenant = {
        id: uppercaseUUID.toLowerCase(),
        slug: mockSlug,
        name: 'Test Salon',
      };
      mockTenantModel.findOne.mockResolvedValue(mockTenant);

      const result = await getTenantUUID(uppercaseUUID);

      expect(result).toBe(uppercaseUUID.toLowerCase());
      expect(mockTenantModel.findOne).toHaveBeenCalledWith({
        where: { id: uppercaseUUID },
      });
    });

    it('should treat non-UUID strings as slugs', async () => {
      const nonUUID = 'my-salon-123';
      const mockTenant = {
        id: mockTenantId,
        slug: nonUUID,
        name: 'Test Salon',
      };
      mockTenantModel.findOne.mockResolvedValue(mockTenant);

      const result = await getTenantUUID(nonUUID);

      expect(result).toBe(mockTenantId);
      expect(mockTenantModel.findOne).toHaveBeenCalledWith({
        where: { slug: nonUUID },
      });
    });
  });
});
