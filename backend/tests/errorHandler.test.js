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
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
    });

    it('should handle SequelizeHostNotReachableError', () => {
      const sequelizeError = {
        name: 'SequelizeHostNotReachableError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
    });

    it('should handle SequelizeAccessDeniedError', () => {
      const sequelizeError = {
        name: 'SequelizeAccessDeniedError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
    });

    it('should handle SequelizeInvalidConnectionError', () => {
      const sequelizeError = {
        name: 'SequelizeInvalidConnectionError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
    });

    it('should handle SequelizeConnectionAcquireTimeoutError', () => {
      const sequelizeError = {
        name: 'SequelizeConnectionAcquireTimeoutError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(503);
      expect(appError.code).toBe('DATABASE_CONNECTION_ERROR');
    });

    it('should handle SequelizeForeignKeyConstraintError', () => {
      const sequelizeError = {
        name: 'SequelizeForeignKeyConstraintError',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe('FOREIGN_KEY_CONSTRAINT_ERROR');
      expect(appError.message).toBe('Invalid reference to related resource');
    });

    it('should handle SequelizeDatabaseError with NOT NULL constraint (MySQL)', () => {
      const sequelizeError = {
        name: 'SequelizeDatabaseError',
        parent: {
          code: 'ER_BAD_NULL_ERROR',
          sqlMessage: "Column 'customer_email' cannot be null",
        },
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe('REQUIRED_FIELD_MISSING');
      expect(appError.message).toContain('customer_email');
    });

    it('should handle SequelizeDatabaseError with NOT NULL constraint (PostgreSQL)', () => {
      const sequelizeError = {
        name: 'SequelizeDatabaseError',
        message: 'null value in column "customer_email" violates not-null constraint',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe('REQUIRED_FIELD_MISSING');
      expect(appError.message).toContain('customer_email');
    });

    it('should handle SequelizeDatabaseError with NOT NULL constraint (SQLite)', () => {
      const sequelizeError = {
        name: 'SequelizeDatabaseError',
        message: 'NOT NULL constraint failed: appointments.customer_email',
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe('REQUIRED_FIELD_MISSING');
      expect(appError.message).toContain('customer_email');
    });

    it('should handle SequelizeDatabaseError without specific field name', () => {
      const sequelizeError = {
        name: 'SequelizeDatabaseError',
        parent: {
          code: 'ER_BAD_NULL_ERROR',
        },
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe('REQUIRED_FIELD_MISSING');
      expect(appError.message).toContain('required field');
    });

    it('should handle SequelizeDatabaseError with other constraint violations', () => {
      const sequelizeError = {
        name: 'SequelizeDatabaseError',
        parent: {
          code: 'ER_SOME_OTHER_ERROR',
          sqlMessage: 'Some other constraint violation',
        },
      };
      
      const appError = databaseErrorHandler(sequelizeError);
      
      expect(appError.statusCode).toBe(400);
      expect(appError.code).toBe('DATABASE_CONSTRAINT_ERROR');
      expect(appError.message).toBe('Database constraint violation');
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
