/**
 * Error Handler Tests
 * Tests for error handling middleware and database error handling
 */
const {
  AppError,
  databaseErrorHandler,
} = require('../src/middleware/errorHandler');

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create an error with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should create an error with custom values', () => {
      const error = new AppError('Custom error', 404, 'NOT_FOUND');
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('databaseErrorHandler', () => {
    it('should handle SequelizeValidationError', () => {
      const sequelizeError = {
        name: 'SequelizeValidationError',
        errors: [{ message: 'Field is required' }, { message: 'Value is invalid' }],
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe('DATABASE_VALIDATION_ERROR');
      expect(appError.message).toContain('Field is required');
      expect(appError.message).toContain('Value is invalid');
    });

    it('should handle SequelizeUniqueConstraintError', () => {
      const sequelizeError = {
        name: 'SequelizeUniqueConstraintError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(409);
      expect(appError.code).toBe('DUPLICATE_ENTRY');
    });

    it('should handle SequelizeConnectionError', () => {
      const sequelizeError = {
        name: 'SequelizeConnectionError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
      expect(appError.message).toBe('Database connection failed');
    });

    it('should handle SequelizeConnectionRefusedError', () => {
      const sequelizeError = {
        name: 'SequelizeConnectionRefusedError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
      expect(appError.message).toBe('Database connection failed');
    });

    it('should handle SequelizeConnectionTimedOutError', () => {
      const sequelizeError = {
        name: 'SequelizeConnectionTimedOutError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
      expect(appError.message).toBe('Database connection failed');
    });

    it('should handle SequelizeHostNotFoundError', () => {
      const sequelizeError = {
        name: 'SequelizeHostNotFoundError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      // This is not a connection error starting with 'SequelizeConnection'
      expect(appError.statusCode).toBe(500);
      expect(appError.code).toBe('DATABASE_ERROR');
    });

    it('should handle SequelizeConnectionAcquireTimeoutError', () => {
      const sequelizeError = {
        name: 'SequelizeConnectionAcquireTimeoutError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
    });

    it('should handle unknown Sequelize errors', () => {
      const sequelizeError = {
        name: 'SequelizeUnknownError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(500);
      expect(appError.code).toBe('DATABASE_ERROR');
    });

    it('should handle error without name property', () => {
      const error = {
        message: 'Unknown error',
      };
      
      const appError = databaseErrorHandler(error);
      
      expect(appError.statusCode).toBe(500);
      expect(appError.code).toBe('DATABASE_ERROR');
    });
  });
});
