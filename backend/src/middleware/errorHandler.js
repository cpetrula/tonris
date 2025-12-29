/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */
const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Custom Error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle 404 Not Found errors
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Handle Sequelize errors by converting them to AppErrors
  if (err.name && err.name.startsWith('Sequelize')) {
    err = databaseErrorHandler(err);
  }
  
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.code = err.code || 'INTERNAL_ERROR';
  
  // Log the error
  if (err.statusCode >= 500) {
    logger.error(`Error: ${err.message}`, {
      stack: err.stack,
      statusCode: err.statusCode,
      code: err.code,
      path: req.path,
      method: req.method,
      tenantId: req.tenantId,
      requestId: req.tenantContext?.requestId,
    });
  } else {
    logger.warn(`Client error: ${err.message}`, {
      statusCode: err.statusCode,
      code: err.code,
      path: req.path,
      method: req.method,
    });
  }
  
  // Build error response
  const errorResponse = {
    success: false,
    error: err.message,
    code: err.code,
  };
  
  // Add stack trace in development mode
  if (env.isDevelopment() && err.stack) {
    errorResponse.stack = err.stack;
  }
  
  // Add request context
  if (req.tenantContext?.requestId) {
    errorResponse.requestId = req.tenantContext.requestId;
  }
  
  res.status(err.statusCode).json(errorResponse);
};

/**
 * Handle validation errors from express-validator or similar
 */
const validationErrorHandler = (errors) => {
  const messages = errors.map((err) => err.msg).join(', ');
  return new AppError(messages, 400, 'VALIDATION_ERROR');
};

/**
 * Check if error is a NOT NULL constraint violation
 * @param {Object} error - Sequelize error object
 * @returns {boolean} - True if it's a NOT NULL constraint error
 */
const isNotNullConstraintError = (error) => {
  // MySQL: ER_BAD_NULL_ERROR
  if (error.parent && error.parent.code === 'ER_BAD_NULL_ERROR') {
    return true;
  }
  
  // PostgreSQL: error message contains "violates not-null constraint"
  if (error.message && error.message.toLowerCase().includes('violates not-null constraint')) {
    return true;
  }
  
  // SQLite: error message contains "not null constraint failed"
  if (error.message && error.message.toLowerCase().includes('not null constraint failed')) {
    return true;
  }
  
  return false;
};

/**
 * Sanitize field name to prevent information disclosure
 * Only allows alphanumeric characters, underscores, and hyphens
 * @param {string} fieldName - Raw field name from error message
 * @returns {string} - Sanitized field name or generic placeholder
 */
const sanitizeFieldName = (fieldName) => {
  // Only allow alphanumeric, underscore, and hyphen characters
  // Limit length to prevent potential issues
  if (!fieldName || typeof fieldName !== 'string') {
    return 'required field';
  }
  
  const sanitized = fieldName.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // If sanitization removed everything or field name is too long, use generic name
  if (!sanitized || sanitized.length > 64) {
    return 'required field';
  }
  
  return sanitized;
};

/**
 * Extract field name from database error message
 * @param {Object} error - Sequelize error object
 * @returns {string} - Field name or 'required field' if not found
 */
const extractFieldNameFromError = (error) => {
  let rawFieldName = null;
  
  // MySQL: Column 'field_name' cannot be null
  if (error.parent && error.parent.sqlMessage) {
    const mysqlMatch = error.parent.sqlMessage.match(/Column '([^']+)'/);
    if (mysqlMatch) rawFieldName = mysqlMatch[1];
  }
  
  // PostgreSQL: null value in column "field_name" violates not-null constraint
  if (!rawFieldName) {
    const postgresMatch = error.message && error.message.match(/column "([^"]+)" violates not-null constraint/);
    if (postgresMatch) rawFieldName = postgresMatch[1];
  }
  
  // SQLite: NOT NULL constraint failed: table.field_name
  if (!rawFieldName) {
    const sqliteMatch = error.message && error.message.match(/NOT NULL constraint failed: [^.]+\.([^\s]+)/);
    if (sqliteMatch) rawFieldName = sqliteMatch[1];
  }
  
  return sanitizeFieldName(rawFieldName);
};

/**
 * Handle database errors
 */
const databaseErrorHandler = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map((e) => e.message).join(', ');
    return new AppError(messages, 400, 'DATABASE_VALIDATION_ERROR');
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return new AppError('Resource already exists', 409, 'DUPLICATE_ENTRY');
  }
  
  // Handle foreign key constraint errors
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new AppError('Invalid reference to related resource', 400, 'FOREIGN_KEY_CONSTRAINT_ERROR');
  }
  
  // Handle database errors (includes NOT NULL constraint violations)
  if (error.name === 'SequelizeDatabaseError') {
    if (isNotNullConstraintError(error)) {
      const fieldName = extractFieldNameFromError(error);
      return new AppError(`Missing required field: ${fieldName}`, 400, 'REQUIRED_FIELD_MISSING');
    }
    
    // Check for other constraint violations
    // Note: Both error.parent and error.parent.code are checked to prevent runtime errors
    if (error.parent && error.parent.code) {
      // Log the error code for debugging, but limit sensitive information
      logger.error(`Database constraint error: ${error.parent.code}`, {
        errorType: error.name,
        errorCode: error.parent.code,
      });
    }
    
    return new AppError('Database constraint violation', 400, 'DATABASE_CONSTRAINT_ERROR');
  }
  
  // Handle all connection errors (SequelizeConnectionError and subclasses)
  // These include: SequelizeConnectionError, SequelizeConnectionRefusedError,
  // SequelizeConnectionTimedOutError, SequelizeConnectionAcquireTimeoutError,
  // SequelizeHostNotFoundError, SequelizeHostNotReachableError,
  // SequelizeAccessDeniedError, SequelizeInvalidConnectionError
  const connectionErrorNames = [
    'SequelizeConnectionError',
    'SequelizeConnectionRefusedError',
    'SequelizeConnectionTimedOutError',
    'SequelizeConnectionAcquireTimeoutError',
    'SequelizeHostNotFoundError',
    'SequelizeHostNotReachableError',
    'SequelizeAccessDeniedError',
    'SequelizeInvalidConnectionError',
  ];
  
  if (error.name && connectionErrorNames.includes(error.name)) {
    return new AppError('Database connection failed', 503, 'DATABASE_CONNECTION_ERROR');
  }
  
  return new AppError('Database error occurred', 500, 'DATABASE_ERROR');
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
  validationErrorHandler,
  databaseErrorHandler,
  isNotNullConstraintError,
  extractFieldNameFromError,
  sanitizeFieldName,
};
