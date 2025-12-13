/**
 * Authentication Tests
 * Tests for authentication module functionality
 */
const request = require('supertest');

// Define mocks before requiring the app
const mockUserModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockTenantModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  generateDefaultSettings: jest.fn(() => ({})),
  isValidTransition: jest.fn(),
};

// Mock models BEFORE requiring the app
jest.mock('../src/models', () => ({
  User: mockUserModel,
}));

// Mock tenant utility
jest.mock('../src/utils/tenant', () => ({
  getTenantUUID: jest.fn().mockResolvedValue('tenant-uuid-123'),
}));

// Mock tenant model for the auth controller
jest.mock('../src/modules/tenants/tenant.model', () => ({
  Tenant: mockTenantModel,
  TENANT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
  },
  PLAN_TYPES: {
    FREE: 'free',
  },
}));

// Now require the app AFTER the mocks are in place
const { app } = require('../src/app');
const { User } = require('../src/models');
const jwtUtils = require('../src/modules/auth/jwt.utils');
const twoFactorUtils = require('../src/modules/auth/2fa.utils');

describe('Authentication Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default tenant mock
    mockTenantModel.findOne.mockResolvedValue({
      id: 'tenant-uuid-123',
      tenantId: 'default',
    });
  });

  describe('JWT Utilities', () => {
    it('should generate access token', () => {
      const payload = { userId: '123', email: 'test@example.com', tenantId: 'default' };
      const token = jwtUtils.generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate refresh token', () => {
      const payload = { userId: '123', email: 'test@example.com', tenantId: 'default' };
      const token = jwtUtils.generateRefreshToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify valid token', () => {
      const payload = { userId: '123', email: 'test@example.com', tenantId: 'default' };
      const token = jwtUtils.generateAccessToken(payload);
      const decoded = jwtUtils.verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should return null for invalid token', () => {
      const decoded = jwtUtils.verifyToken('invalid-token');
      
      expect(decoded).toBeNull();
    });

    it('should generate token pair', () => {
      const user = { id: '123', email: 'test@example.com', tenantId: 'default' };
      const tokens = jwtUtils.generateTokenPair(user);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.expiresIn).toBeDefined();
    });

    it('should decode token without verification', () => {
      const payload = { userId: '123', email: 'test@example.com', tenantId: 'default' };
      const token = jwtUtils.generateAccessToken(payload);
      const decoded = jwtUtils.decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe('123');
    });
  });

  describe('2FA Utilities', () => {
    it('should generate secret', () => {
      const secret = twoFactorUtils.generateSecret();
      
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(10);
    });

    it('should generate token from secret', () => {
      const secret = twoFactorUtils.generateSecret();
      const token = twoFactorUtils.generateToken(secret);
      
      expect(token).toBeDefined();
      expect(token).toMatch(/^\d{6}$/); // 6 digit code
    });

    it('should verify valid token', () => {
      const secret = twoFactorUtils.generateSecret();
      const token = twoFactorUtils.generateToken(secret);
      const isValid = twoFactorUtils.verifyToken(token, secret);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid token', () => {
      const secret = twoFactorUtils.generateSecret();
      const isValid = twoFactorUtils.verifyToken('000000', secret);
      
      expect(isValid).toBe(false);
    });

    it('should generate otpauth URI', () => {
      const secret = 'TESTSECRET';
      const email = 'test@example.com';
      const uri = twoFactorUtils.generateOtpauthUri(secret, email);
      
      expect(uri).toContain('otpauth://totp/');
      expect(uri).toContain('test%40example.com'); // Email is URL encoded
      expect(uri).toContain('TONRIS');
    });

    it('should generate QR code', async () => {
      const secret = 'TESTSECRET';
      const otpauthUri = twoFactorUtils.generateOtpauthUri(secret, 'test@example.com');
      const qrCode = await twoFactorUtils.generateQRCode(otpauthUri);
      
      expect(qrCode).toContain('data:image/png;base64,');
    });

    it('should setup 2FA', async () => {
      const result = await twoFactorUtils.setup2FA('test@example.com');
      
      expect(result.secret).toBeDefined();
      expect(result.otpauthUri).toBeDefined();
      expect(result.qrCode).toBeDefined();
    });
  });

  describe('Auth Routes', () => {
    describe('POST /api/auth/signup', () => {
      it('should return 400 when email is missing', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({ password: 'password123' });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should return 400 when password is missing', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({ email: 'test@example.com' });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should return 400 for invalid email format', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({ email: 'invalid-email', password: 'password123' });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('email');
      });

      it('should return 400 for short password', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({ email: 'test@example.com', password: 'short' });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('8 characters');
      });

      it('should return 400 when user already exists', async () => {
        User.findOne.mockResolvedValue({ id: '123', email: 'test@example.com' });
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send({ email: 'test@example.com', password: 'password123' });
        
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('USER_EXISTS');
      });

      it('should create user and return tokens on success', async () => {
        User.findOne.mockResolvedValue(null);
        
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          tenantId: 'default',
          toSafeObject: () => ({ id: '123', email: 'test@example.com', tenantId: 'default' }),
        };
        User.create.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/signup')
          .send({ email: 'test@example.com', password: 'password123' });
        
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.tokens).toBeDefined();
      });
    });

    describe('POST /api/auth/login', () => {
      it('should return 400 when credentials are missing', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({});
        
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should return 401 for invalid credentials', async () => {
        User.findOne.mockResolvedValue(null);
        
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });
        
        expect(response.status).toBe(401);
        expect(response.body.code).toBe('INVALID_CREDENTIALS');
      });

      it('should return 403 for deactivated account', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          isActive: false,
        };
        User.findOne.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });
        
        expect(response.status).toBe(403);
        expect(response.body.code).toBe('ACCOUNT_DEACTIVATED');
      });

      it('should return 401 for wrong password', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          isActive: true,
          twoFactorEnabled: false,
          comparePassword: jest.fn().mockResolvedValue(false),
        };
        User.findOne.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' });
        
        expect(response.status).toBe(401);
      });

      it('should require 2FA when enabled', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          isActive: true,
          twoFactorEnabled: true,
          comparePassword: jest.fn().mockResolvedValue(true),
        };
        User.findOne.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });
        
        expect(response.status).toBe(200);
        expect(response.body.requiresTwoFactor).toBe(true);
      });

      it('should return tokens on successful login', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          tenantId: 'default',
          isActive: true,
          twoFactorEnabled: false,
          comparePassword: jest.fn().mockResolvedValue(true),
          toSafeObject: () => ({ id: '123', email: 'test@example.com', tenantId: 'default' }),
        };
        User.findOne.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.tokens).toBeDefined();
      });
    });

    describe('POST /api/auth/forgot-password', () => {
      it('should return 400 when email is missing', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({});
        
        expect(response.status).toBe(400);
      });

      it('should return success even for non-existent email', async () => {
        User.findOne.mockResolvedValue(null);
        
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'nonexistent@example.com' });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should generate reset token for existing user', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          update: jest.fn().mockResolvedValue(true),
        };
        User.findOne.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@example.com' });
        
        expect(response.status).toBe(200);
        expect(mockUser.update).toHaveBeenCalled();
      });
    });

    describe('POST /api/auth/reset-password', () => {
      it('should return 400 when token or password is missing', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({ token: 'sometoken' });
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for short password', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({ token: 'sometoken', password: 'short' });
        
        expect(response.status).toBe(400);
      });

      it('should return 400 for invalid token', async () => {
        User.findOne.mockResolvedValue(null);
        
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({ token: 'invalidtoken', password: 'newpassword123' });
        
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('INVALID_RESET_TOKEN');
      });

      it('should return 400 for expired token', async () => {
        const mockUser = {
          id: '123',
          passwordResetExpires: new Date(Date.now() - 1000), // Already expired
        };
        User.findOne.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({ token: 'sometoken', password: 'newpassword123' });
        
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('EXPIRED_RESET_TOKEN');
      });

      it('should reset password successfully', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          passwordResetExpires: new Date(Date.now() + 3600000), // Not expired
          update: jest.fn().mockResolvedValue(true),
        };
        User.findOne.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({ token: 'validtoken', password: 'newpassword123' });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(mockUser.update).toHaveBeenCalled();
      });
    });

    describe('POST /api/auth/refresh', () => {
      it('should return 400 when refresh token is missing', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({});
        
        expect(response.status).toBe(400);
      });

      it('should return 401 for invalid refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken: 'invalid-token' });
        
        expect(response.status).toBe(401);
        expect(response.body.code).toBe('INVALID_REFRESH_TOKEN');
      });

      it('should return new tokens for valid refresh token', async () => {
        const mockUser = {
          id: '123',
          email: 'test@example.com',
          tenantId: 'default',
          isActive: true,
        };
        
        // Generate a valid refresh token
        const refreshToken = jwtUtils.generateRefreshToken({ userId: '123' });
        User.findByPk.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken });
        
        expect(response.status).toBe(200);
        expect(response.body.data.tokens).toBeDefined();
      });
    });

    describe('Protected Routes', () => {
      describe('GET /api/auth/me', () => {
        it('should return 401 without token', async () => {
          const response = await request(app).get('/api/auth/me');
          
          expect(response.status).toBe(401);
          expect(response.body.code).toBe('UNAUTHORIZED');
        });

        it('should return 401 with invalid token', async () => {
          const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid-token');
          
          expect(response.status).toBe(401);
        });

        it('should return user profile with valid token', async () => {
          const mockUser = {
            id: '123',
            email: 'test@example.com',
            tenantId: 'default',
            toSafeObject: () => ({ id: '123', email: 'test@example.com', tenantId: 'default' }),
          };
          User.findOne.mockResolvedValue(mockUser);
          
          const token = jwtUtils.generateAccessToken({
            userId: '123',
            email: 'test@example.com',
            tenantId: 'default',
          });
          
          const response = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
          
          expect(response.status).toBe(200);
          expect(response.body.data.user).toBeDefined();
        });
      });

      describe('POST /api/auth/2fa/setup', () => {
        it('should return 401 without authentication', async () => {
          const response = await request(app).post('/api/auth/2fa/setup');
          
          expect(response.status).toBe(401);
        });

        it('should return 400 if 2FA already enabled', async () => {
          const mockUser = {
            id: '123',
            email: 'test@example.com',
            twoFactorEnabled: true,
          };
          User.findOne.mockResolvedValue(mockUser);
          
          const token = jwtUtils.generateAccessToken({
            userId: '123',
            email: 'test@example.com',
            tenantId: 'default',
          });
          
          const response = await request(app)
            .post('/api/auth/2fa/setup')
            .set('Authorization', `Bearer ${token}`);
          
          expect(response.status).toBe(400);
          expect(response.body.code).toBe('TWO_FACTOR_ALREADY_ENABLED');
        });

        it('should return QR code and secret for 2FA setup', async () => {
          const mockUser = {
            id: '123',
            email: 'test@example.com',
            tenantId: 'default',
            twoFactorEnabled: false,
            update: jest.fn().mockResolvedValue(true),
          };
          User.findOne.mockResolvedValue(mockUser);
          
          const token = jwtUtils.generateAccessToken({
            userId: '123',
            email: 'test@example.com',
            tenantId: 'default',
          });
          
          const response = await request(app)
            .post('/api/auth/2fa/setup')
            .set('Authorization', `Bearer ${token}`);
          
          expect(response.status).toBe(200);
          expect(response.body.data.qrCode).toBeDefined();
          expect(response.body.data.otpauthUri).toBeDefined();
        });
      });

      describe('POST /api/auth/2fa/verify', () => {
        it('should return 400 when code is missing', async () => {
          const token = jwtUtils.generateAccessToken({
            userId: '123',
            email: 'test@example.com',
            tenantId: 'default',
          });
          
          const response = await request(app)
            .post('/api/auth/2fa/verify')
            .set('Authorization', `Bearer ${token}`)
            .send({});
          
          expect(response.status).toBe(400);
        });
      });

      describe('POST /api/auth/2fa/disable', () => {
        it('should return 400 when 2FA is not enabled', async () => {
          const mockUser = {
            id: '123',
            email: 'test@example.com',
            twoFactorEnabled: false,
          };
          User.findOne.mockResolvedValue(mockUser);
          
          const token = jwtUtils.generateAccessToken({
            userId: '123',
            email: 'test@example.com',
            tenantId: 'default',
          });
          
          const response = await request(app)
            .post('/api/auth/2fa/disable')
            .set('Authorization', `Bearer ${token}`)
            .send({ code: '123456' });
          
          expect(response.status).toBe(400);
          expect(response.body.code).toBe('TWO_FACTOR_NOT_ENABLED');
        });
      });
    });

    describe('POST /api/auth/register', () => {
      it('should return 400 when email is missing', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ 
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            businessTypeId: 'business-123'
          });
        
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      });

      it('should return 400 when required fields are missing', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ 
            email: 'test@example.com',
            password: 'password123'
          });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('First name and last name');
      });

      it('should return 400 when businessTypeId is missing', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ 
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe'
          });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Business type');
      });

      it('should return 400 when user already exists', async () => {
        User.findOne.mockResolvedValue({ id: '123', email: 'test@example.com' });
        
        const response = await request(app)
          .post('/api/auth/register')
          .send({ 
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            businessTypeId: 'business-123'
          });
        
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('USER_EXISTS');
      });

      it('should register successfully without contact phone', async () => {
        User.findOne.mockResolvedValue(null);
        
        const mockTenant = {
          id: 'tenant-123',
          tenantId: 'tenant-slug',
          name: "John Doe's Business",
          toSafeObject: () => ({ id: 'tenant-123', tenantId: 'tenant-slug' }),
        };
        
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          tenantId: 'tenant-123',
          toSafeObject: () => ({ id: 'user-123', email: 'test@example.com', tenantId: 'tenant-123' }),
        };
        
        mockTenantModel.create.mockResolvedValue(mockTenant);
        mockTenantModel.findOne.mockResolvedValue(null); // No existing tenant
        User.create.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/register')
          .send({ 
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            businessTypeId: 'business-123'
          });
        
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.tokens).toBeDefined();
      });

      it('should register successfully with contact phone', async () => {
        User.findOne.mockResolvedValue(null);
        
        const mockTenant = {
          id: 'tenant-123',
          tenantId: 'tenant-slug',
          name: "John Doe's Business",
          toSafeObject: () => ({ id: 'tenant-123', tenantId: 'tenant-slug' }),
        };
        
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          tenantId: 'tenant-123',
          toSafeObject: () => ({ id: 'user-123', email: 'test@example.com', tenantId: 'tenant-123' }),
        };
        
        mockTenantModel.create.mockResolvedValue(mockTenant);
        mockTenantModel.findOne.mockResolvedValue(null); // No existing tenant
        User.create.mockResolvedValue(mockUser);
        
        const response = await request(app)
          .post('/api/auth/register')
          .send({ 
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            businessTypeId: 'business-123',
            contactPhone: '+1-415-555-1234'
          });
        
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user).toBeDefined();
        expect(response.body.data.tokens).toBeDefined();
      });
    });
  });
});
