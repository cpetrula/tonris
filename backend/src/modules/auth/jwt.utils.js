/**
 * JWT Utilities
 * Handles JWT token generation and verification
 */
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const logger = require('../../utils/logger');

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} - JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    logger.warn(`Token verification failed: ${error.message}`);
    return null;
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @returns {Object} - Object containing access and refresh tokens
 */
const generateTokenPair = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: env.JWT_EXPIRES_IN,
  };
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token or null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateTokenPair,
  decodeToken,
};
