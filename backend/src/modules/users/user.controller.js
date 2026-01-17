/**
 * User Management Controller
 * Handles HTTP requests for user management
 */
const userService = require('./user.service');
const logger = require('../../utils/logger');

/**
 * Get all users for the authenticated tenant
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const users = await userService.getUsersByTenant(tenantId);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific user by ID
 * GET /api/users/:id
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    
    const user = await userService.getUserById(id, tenantId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { email, role, loginEnabled = false, employeeId } = req.body;
    const tenantId = req.user.tenantId;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await userService.createUserWithLogin({
      email,
      tenantId,
      role: role || 'staff',
      loginEnabled,
      employeeId,
    });

    res.status(201).json({
      success: true,
      data: result.user,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user
 * PATCH /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const updateData = req.body;

    const result = await userService.updateUser(id, tenantId, updateData);

    res.json({
      success: true,
      data: result.user,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable login for a user
 * POST /api/users/:id/enable-login
 */
const enableLogin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const result = await userService.enableUserLogin(id, tenantId);

    res.json({
      success: true,
      message: result.message,
      data: {
        loginEnabled: result.loginEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  enableLogin,
};
