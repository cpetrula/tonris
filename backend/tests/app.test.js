/**
 * Application Tests
 * Tests for Express application, middleware, and routes
 */
const request = require('supertest');
const { app } = require('../src/app');

describe('TONRIS Backend', () => {
  describe('Root Endpoint', () => {
    it('should return welcome message at root', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('TONRIS Backend API');
      expect(response.body.version).toBe('1.0.0');
    });
  });

  describe('Health Check Endpoints', () => {
    it('should return healthy status at /health', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.environment).toBeDefined();
    });

    it('should return alive status at /health/live', async () => {
      const response = await request(app).get('/health/live');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('alive');
    });

    it('should handle /health/detailed endpoint', async () => {
      const response = await request(app).get('/health/detailed');
      
      // May return 200 or 503 depending on database connection
      expect([200, 503]).toContain(response.status);
      expect(response.body.checks).toBeDefined();
      expect(response.body.checks.server).toBeDefined();
      expect(response.body.checks.database).toBeDefined();
    });
  });

  describe('Multi-Tenant Middleware', () => {
    it('should set default tenant when no header provided', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.headers['x-tenant-id']).toBe('default');
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should use tenant from X-Tenant-ID header', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('X-Tenant-ID', 'tenant-123');
      
      expect(response.status).toBe(200);
      expect(response.headers['x-tenant-id']).toBe('tenant-123');
    });

    it('should use tenant from query parameter', async () => {
      const response = await request(app)
        .get('/api/health?tenantId=query-tenant');
      
      expect(response.status).toBe(200);
      expect(response.headers['x-tenant-id']).toBe('query-tenant');
    });

    it('should reject invalid tenant ID', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('X-Tenant-ID', 'invalid tenant id!@#');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_TENANT_ID');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown/route');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('should include error message in response', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('/nonexistent');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });
});
