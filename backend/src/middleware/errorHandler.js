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
  
  // Handle all connection errors (SequelizeConnectionError and subclasses like
  // SequelizeConnectionRefusedError, SequelizeHostNotFoundError, etc.)
  if (error.name && error.name.startsWith('SequelizeConnection')) {
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
};
