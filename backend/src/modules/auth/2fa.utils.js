/**
 * Two-Factor Authentication Utilities
 * Handles TOTP generation and verification
 */
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const logger = require('../../utils/logger');

// Configure authenticator options
authenticator.options = {
  window: 1, // Allow 1 step before/after for clock drift
};

/**
 * Generate a new 2FA secret for a user
 * @returns {string} - Base32 encoded secret
 */
const generateSecret = () => {
  return authenticator.generateSecret();
};

/**
 * Generate TOTP token from secret
 * @param {string} secret - User's 2FA secret
 * @returns {string} - 6-digit TOTP code
 */
const generateToken = (secret) => {
  return authenticator.generate(secret);
};

/**
 * Verify TOTP token against secret
 * @param {string} token - 6-digit TOTP code from user
 * @param {string} secret - User's 2FA secret
 * @returns {boolean} - True if token is valid
 */
const verifyToken = (token, secret) => {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    logger.warn(`2FA verification failed: ${error.message}`);
    return false;
  }
};

/**
 * Generate otpauth URI for authenticator apps
 * @param {string} secret - User's 2FA secret
 * @param {string} email - User's email
 * @param {string} issuer - Application name
 * @returns {string} - otpauth URI
 */
const generateOtpauthUri = (secret, email, issuer = 'CRITON.AI') => {
  return authenticator.keyuri(email, issuer, secret);
};

/**
 * Generate QR code as data URL for 2FA setup
 * @param {string} otpauthUri - otpauth URI
 * @returns {Promise<string>} - QR code as data URL
 */
const generateQRCode = async (otpauthUri) => {
  try {
    return await QRCode.toDataURL(otpauthUri);
  } catch (error) {
    logger.error(`QR code generation failed: ${error.message}`);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Setup 2FA for a user - generates secret and QR code
 * @param {string} email - User's email
 * @returns {Promise<Object>} - Object containing secret and QR code
 */
const setup2FA = async (email) => {
  const secret = generateSecret();
  const otpauthUri = generateOtpauthUri(secret, email);
  const qrCode = await generateQRCode(otpauthUri);

  return {
    secret,
    otpauthUri,
    qrCode,
  };
};

module.exports = {
  generateSecret,
  generateToken,
  verifyToken,
  generateOtpauthUri,
  generateQRCode,
  setup2FA,
};
