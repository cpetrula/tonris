/**
 * User Management Service
 * Handles user management operations (not authentication)
 */
const { User } = require('../../models');
const { Tenant } = require('../../models');
const { sendTemporaryPasswordEmail } = require('../notifications/email.service');
const logger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');
const env = require('../../config/env');

/**
 * Enable login for a user and send temporary password
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID (for authorization)
 * @returns {Promise<Object>} - Success message
 */
const enableUserLogin = async (userId, tenantId) => {
  // Find user and verify it belongs to the tenant
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Check if login is already enabled
  if (user.loginEnabled) {
    throw new AppError('Login is already enabled for this user', 400, 'LOGIN_ALREADY_ENABLED');
  }

  // Generate temporary password
  const tempPassword = await user.generateTemporaryPassword();

  // Enable login
  await user.update({ loginEnabled: true });

  // Get tenant name for email
  const tenant = await Tenant.findByPk(tenantId);
  const businessName = tenant ? tenant.name : null;

  // Send email with temporary password
  try {
    const loginUrl = env.FRONTEND_URL ? `${env.FRONTEND_URL}/login` : null;
    await sendTemporaryPasswordEmail(user.email, {
      tempPassword,
      loginUrl,
      businessName,
    });
    
    logger.info(`Login enabled for user ${user.email}, temporary password email sent`);
  } catch (emailError) {
    // Log error but don't fail the operation
    logger.error(`Failed to send temporary password email to ${user.email}: ${emailError.message}`);
    logger.warn('User login was enabled but email notification failed');
  }

  return {
    message: 'Login enabled successfully. Temporary password has been sent to the user\'s email.',
    loginEnabled: true,
  };
};

/**
 * Create user with optional login enabled
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.tenantId - Tenant ID
 * @param {string} userData.role - User role
 * @param {boolean} userData.loginEnabled - Whether to enable login
 * @param {string} userData.employeeId - Optional employee ID to link
 * @returns {Promise<Object>} - Created user and optional temporary password
 */
const createUserWithLogin = async (userData) => {
  const { email, tenantId, role, loginEnabled = false, employeeId = null } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400, 'USER_EXISTS');
  }

  let tempPassword = null;

  // If login is enabled, generate temporary password
  if (loginEnabled) {
    const crypto = require('crypto');
    tempPassword = crypto.randomBytes(12).toString('base64').slice(0, 12);

    // Create user with temporary password and must_reset_password flag
    const user = await User.create({
      email,
      password: tempPassword,
      tenantId,
      role,
      loginEnabled: true,
      mustResetPassword: true,
      tempPasswordCreatedAt: new Date(),
      employeeId,
      isActive: true,
    });

    // Get tenant name for email
    const tenant = await Tenant.findByPk(tenantId);
    const businessName = tenant ? tenant.name : null;

    // Send email with temporary password
    try {
      const loginUrl = env.FRONTEND_URL ? `${env.FRONTEND_URL}/login` : null;
      await sendTemporaryPasswordEmail(email, {
        tempPassword,
        loginUrl,
        businessName,
      });
      
      logger.info(`User created with login enabled: ${email}, temporary password email sent`);
    } catch (emailError) {
      // Log error but don't fail the operation
      logger.error(`Failed to send temporary password email to ${email}: ${emailError.message}`);
      logger.warn('User was created with login enabled but email notification failed');
    }

    return {
      user: user.toSafeObject(),
      message: 'User created successfully. Temporary password has been sent to the user\'s email.',
    };
  } else {
    // Create user without login access (no password needed yet)
    const user = await User.create({
      email,
      password: 'PLACEHOLDER_NO_LOGIN', // Will be replaced when login is enabled
      tenantId,
      role,
      loginEnabled: false,
      employeeId,
      isActive: true,
    });

    logger.info(`User created without login: ${email}`);

    return {
      user: user.toSafeObject(),
      message: 'User created successfully without login access.',
    };
  }
};

/**
 * Update user details
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated user
 */
const updateUser = async (userId, tenantId, updateData) => {
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Don't allow updating certain fields through this method
  const allowedFields = ['role', 'isActive', 'employeeId'];
  const filteredData = {};
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  await user.update(filteredData);

  logger.info(`User updated: ${user.email}`);

  return {
    user: user.toSafeObject(),
    message: 'User updated successfully',
  };
};

/**
 * Get all users for a tenant
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} - List of users
 */
const getUsersByTenant = async (tenantId) => {
  const users = await User.findAll({
    where: { tenantId },
    order: [['createdAt', 'DESC']],
  });

  return users.map(user => user.toSafeObject());
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @param {string} tenantId - Tenant ID (for authorization)
 * @returns {Promise<Object>} - User data
 */
const getUserById = async (userId, tenantId) => {
  const user = await User.findOne({ where: { id: userId, tenantId } });
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user.toSafeObject();
};

module.exports = {
  enableUserLogin,
  createUserWithLogin,
  updateUser,
  getUsersByTenant,
  getUserById,
};
