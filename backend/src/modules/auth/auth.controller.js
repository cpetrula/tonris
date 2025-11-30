/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */
const authService = require('./auth.service');
const { getTenantUUID } = require('../../utils/tenant');

/**
 * POST /api/auth/signup
 * Register a new user
 */
const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await authService.signup({ email, password }, tenantUUID);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user
 */
const login = async (req, res, next) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.login({ email, password, twoFactorCode });

    // Check if 2FA is required
    if (result.requiresTwoFactor) {
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Initiate password reset
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await authService.forgotPassword(email, tenantUUID);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and password are required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await authService.resetPassword(token, password, tenantUUID);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/2fa/setup
 * Setup 2FA for authenticated user
 */
const setup2FA = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await authService.setup2FA(req.user.userId, tenantUUID);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/2fa/verify
 * Verify and enable 2FA
 */
const verify2FA = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await authService.verify2FA(req.user.userId, code, tenantUUID);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA for authenticated user
 */
const disable2FA = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const tenantUUID = await getTenantUUID(req.tenantId);
    const result = await authService.disable2FA(req.user.userId, code, tenantUUID);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.refreshTokens(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const tenantUUID = await getTenantUUID(req.tenantId);
    const user = await authService.getUserById(req.user.userId, tenantUUID);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  setup2FA,
  verify2FA,
  disable2FA,
  refreshToken,
  getProfile,
};
