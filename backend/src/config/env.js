/**
 * Environment Configuration
 * Manages all environment variables and secrets
 */
require('dotenv').config();

const env = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  
  // Database Configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_NAME: process.env.DB_NAME || 'tonris_db',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  
  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Multi-tenant Configuration
  DEFAULT_TENANT_ID: process.env.DEFAULT_TENANT_ID || 'default',
  
  // Validation helper
  isProduction: () => env.NODE_ENV === 'production',
  isDevelopment: () => env.NODE_ENV === 'development',
  isTest: () => env.NODE_ENV === 'test',
};

// Validate required environment variables in production
const validateEnv = () => {
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER'];
  const missing = required.filter(key => !process.env[key]);
  
  if (env.isProduction() && missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Only validate in production
if (env.isProduction()) {
  validateEnv();
}

module.exports = env;
