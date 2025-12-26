/**
 * Authentication Service
 * Handles all authentication business logic
 */
const crypto = require('crypto');
const { User } = require('../../models');
const { generateTokenPair, verifyToken } = require('./jwt.utils');
const twoFactorUtils = require('./2fa.utils');
const logger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Created user and tokens
 */
const signup = async ({ email, password }, tenantId) => {
  // Check if user already exists
  const existingUser = await User.findOne({ where: { email, tenantId } });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400, 'USER_EXISTS');
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    tenantId,
  });

  // Generate tokens
  const tokens = generateTokenPair(user);

  logger.info(`New user registered: ${email} for tenant: ${tenantId}`);

  return {
    user: user.toSafeObject(),
    tokens,
  };
};

/**
 * Authenticate user and return tokens
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {string} credentials.twoFactorCode - Optional 2FA code
 * @returns {Promise<Object>} - User data and tokens
 */
const login = async ({ email, password, twoFactorCode }) => {
  try {
    // Find user by email (email is globally unique across all tenants)
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return {
          requiresTwoFactor: true,
          message: 'Two-factor authentication code required',
        };
      }

      const isValidCode = twoFactorUtils.verifyToken(twoFactorCode, user.twoFactorSecret);
      if (!isValidCode) {
        throw new AppError('Invalid two-factor authentication code', 401, 'INVALID_2FA_CODE');
      }
    }

    // Generate tokens using the tenantId from the user record
    const tokens = generateTokenPair(user);

    logger.info(`User logged in: ${email} for tenant: ${user.tenantId}`);

    return {
      user: user.toSafeObject(),
      tokens,
    };
  } catch (error) {
    // If it's already an AppError, rethrow it
    if (error.isOperational) {
      throw error;
    }
    
    // Log unexpected database errors for debugging
    // Obfuscate email for security
    const obfuscatedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'unknown';
    logger.error(`Login error for email ${obfuscatedEmail}:`, {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Rethrow to be handled by error middleware
    throw error;
  }
};

/**
 * Initiate password reset
 * @param {string} email - User email
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Reset token info
 */
const forgotPassword = async (email, tenantId) => {
  const user = await User.findOne({ where: { email, tenantId } });
  
  // Don't reveal if user exists or not
  if (!user) {
    logger.info(`Password reset requested for non-existent email: ${email}`);
    return { message: 'If the email exists, a password reset link will be sent' };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set token expiry (1 hour)
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

  await user.update({
    passwordResetToken: hashedToken,
    passwordResetExpires: resetExpires,
  });

  logger.info(`Password reset token generated for: ${email}`);

  // In production, send email with reset link
  // For now, return token (would not be exposed in production)
  return {
    message: 'If the email exists, a password reset link will be sent',
    // Only include resetToken in development for testing
    ...(process.env.NODE_ENV !== 'production' && { resetToken }),
  };
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Success message
 */
const resetPassword = async (token, newPassword, tenantId) => {
  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      tenantId,
    },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  // Check if token has expired
  if (user.passwordResetExpires < new Date()) {
    throw new AppError('Reset token has expired', 400, 'EXPIRED_RESET_TOKEN');
  }

  // Update password and clear reset token
  await user.update({
    password: newPassword,
    passwordResetToken: null,
    passwordResetExpires: null,
  });

  logger.info(`Password reset successful for: ${user.email}`);

  return { message: 'Password reset successful' };
};

/**
 * Setup 2FA for user
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - 2FA setup data with QR code
 */
const setup2FA = async (userId, tenantId) => {
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.twoFactorEnabled) {
    throw new AppError('2FA is already enabled', 400, 'TWO_FACTOR_ALREADY_ENABLED');
  }

  const { secret, otpauthUri, qrCode } = await twoFactorUtils.setup2FA(user.email);

  // Store secret temporarily (not enabled yet until verified)
  await user.update({ twoFactorSecret: secret });

  logger.info(`2FA setup initiated for user: ${user.email}`);

  return {
    otpauthUri,
    qrCode,
    message: 'Scan the QR code with your authenticator app and verify with a code',
  };
};

/**
 * Verify and enable 2FA
 * @param {string} userId - User ID
 * @param {string} code - TOTP code from authenticator
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Success message
 */
const verify2FA = async (userId, code, tenantId) => {
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (!user.twoFactorSecret) {
    throw new AppError('2FA setup not initiated', 400, 'TWO_FACTOR_NOT_SETUP');
  }

  if (user.twoFactorEnabled) {
    throw new AppError('2FA is already enabled', 400, 'TWO_FACTOR_ALREADY_ENABLED');
  }

  const isValid = twoFactorUtils.verifyToken(code, user.twoFactorSecret);
  if (!isValid) {
    throw new AppError('Invalid verification code', 400, 'INVALID_VERIFICATION_CODE');
  }

  await user.update({ twoFactorEnabled: true });

  logger.info(`2FA enabled for user: ${user.email}`);

  return { message: '2FA has been enabled successfully' };
};

/**
 * Disable 2FA for user
 * @param {string} userId - User ID
 * @param {string} code - TOTP code from authenticator
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - Success message
 */
const disable2FA = async (userId, code, tenantId) => {
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (!user.twoFactorEnabled) {
    throw new AppError('2FA is not enabled', 400, 'TWO_FACTOR_NOT_ENABLED');
  }

  const isValid = twoFactorUtils.verifyToken(code, user.twoFactorSecret);
  if (!isValid) {
    throw new AppError('Invalid verification code', 400, 'INVALID_VERIFICATION_CODE');
  }

  await user.update({
    twoFactorEnabled: false,
    twoFactorSecret: null,
  });

  logger.info(`2FA disabled for user: ${user.email}`);

  return { message: '2FA has been disabled successfully' };
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New token pair
 */
const refreshTokens = async (refreshToken) => {
  const decoded = verifyToken(refreshToken);
  
  if (!decoded) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const user = await User.findByPk(decoded.userId);
  
  if (!user || !user.isActive) {
    throw new AppError('User not found or inactive', 401, 'USER_NOT_FOUND');
  }

  const tokens = generateTokenPair(user);

  logger.info(`Tokens refreshed for user: ${user.email}`);

  return { tokens };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant identifier
 * @returns {Promise<Object>} - User data
 */
const getUserById = async (userId, tenantId) => {
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user.toSafeObject();
};

/**
 * Full registration: Create tenant with business type and user
 * @param {Object} registrationData - Registration data
 * @param {string} registrationData.email - User email
 * @param {string} registrationData.password - User password
 * @param {string} registrationData.firstName - User first name
 * @param {string} registrationData.lastName - User last name
 * @param {string} registrationData.businessTypeId - Business type ID
 * @param {string} registrationData.contactPhone - Contact phone (optional)
 * @returns {Promise<Object>} - Created user and tokens
 */
const register = async ({ email, password, firstName, lastName, businessTypeId, contactPhone }) => {
  const tenantService = require('../tenants/tenant.service');
  const twilioService = require('../telephony/twilio.service');
  const { getElevenLabsService } = require('../ai-assistant/elevenlabs.service');
  const { BusinessType } = require('../business-types/businessType.model');
  const env = require('../../config/env');

  // Check if user already exists (globally - email is unique)
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400, 'USER_EXISTS');
  }

  // Generate slug from business name (using email domain as business name for now)
  const businessName = `${firstName} ${lastName}'s Business`;
  const slug = `${firstName}-${lastName}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  // Create tenant with business type
  const tenant = await tenantService.createTenant({
    name: businessName,
    slug,
    contactEmail: email,
    contactPhone,
    businessTypeId,
  });

  // Provision Twilio phone number for the new tenant
  let twilioPhoneNumber = null;
  let twilioPhoneNumberSid = null;
  let elevenlabsPhoneNumberId = null;
  
  try {
    // Extract area code from contact phone if provided
    let areaCode = null;
    if (contactPhone) {
      areaCode = twilioService.extractAreaCode(contactPhone);
      if (areaCode) {
        logger.info(`Provisioning phone number with area code preference for tenant ${tenant.id}`);
      }
    }
    
    // Provision phone number with area code preference
    const provisionedNumber = await twilioService.provisionPhoneNumber({
      tenantId: tenant.id,
      areaCode,
      country: 'US',
    });
    
    twilioPhoneNumber = provisionedNumber.phoneNumber;
    twilioPhoneNumberSid = provisionedNumber.sid;
    
    logger.info(`Twilio phone number ${twilioPhoneNumber} provisioned for tenant ${tenant.id}`);

    // Import phone number to ElevenLabs
    try {
      // Get agent_id from business_types table
      let agentId = null;
      if (businessTypeId) {
        const businessType = await BusinessType.findByPk(businessTypeId);
        if (businessType) {
          agentId = businessType.agentId;
          logger.info(`Using agent ID ${agentId} from business type ${businessType.businessType}`);
        } else {
          logger.warn(`Business type ${businessTypeId} not found, will skip agent assignment`);
        }
      }

      // Import to ElevenLabs
      const elevenlabsService = getElevenLabsService();
      const importResult = await elevenlabsService.importPhoneNumber({
        phoneNumber: twilioPhoneNumber,
        label: businessName,
        agentId: agentId,
        twilioAccountSid: env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: env.TWILIO_AUTH_TOKEN,
      });

      elevenlabsPhoneNumberId = importResult.phoneNumberId;
      logger.info(`Phone number ${twilioPhoneNumber} imported to ElevenLabs with ID: ${elevenlabsPhoneNumberId}`);
    } catch (error) {
      // Log the error but don't fail the registration
      logger.error(`Failed to import phone number to ElevenLabs for tenant ${tenant.id}: ${error.message}`);
      logger.warn('Registration will continue without ElevenLabs phone import');
    }
    
    // Update tenant with the provisioned phone number and SIDs
    await tenantService.updateTenant(tenant.id, {
      twilioPhoneNumber,
      twilioPhoneNumberSid,
      elevenlabsPhoneNumberId,
    });
    
  } catch (error) {
    // Log the error but don't fail the registration
    logger.error(`Failed to provision Twilio phone number for tenant ${tenant.id}: ${error.message}`);
    logger.warn('Registration will continue without Twilio phone number');
  }

  // Create user associated with the new tenant
  const user = await User.create({
    email,
    password,
    tenantId: tenant.id,
  });

  // Generate tokens
  const tokens = generateTokenPair(user);

  logger.info(`New registration: ${email} with tenant: ${tenant.tenantId}`);

  return {
    user: user.toSafeObject(),
    tokens,
    twilioPhoneNumber, // Include in response so user knows their assigned number
  };
};

module.exports = {
  signup,
  login,
  register,
  forgotPassword,
  resetPassword,
  setup2FA,
  verify2FA,
  disable2FA,
  refreshTokens,
  getUserById,
};
