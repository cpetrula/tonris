/**
 * Authorization Middleware
 * Role-based access control for protected routes
 */
const { AppError } = require('./errorHandler');

/**
 * Role hierarchy - higher number = more permissions
 * superuser > admin > manager > staff
 */
const ROLE_HIERARCHY = {
  superuser: 4,
  admin: 3,
  manager: 2,
  staff: 1,
};

/**
 * Valid user roles
 */
const USER_ROLES = {
  SUPERUSER: 'superuser',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
};

/**
 * Employee roles (subset of user roles, excludes superuser)
 */
const EMPLOYEE_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
};

/**
 * Get role level from hierarchy
 * @param {string} role - User role
 * @returns {number} - Role level (0 if unknown)
 */
const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

/**
 * Middleware to require a minimum role level
 * @param {string} minimumRole - Minimum required role
 * @returns {Function} - Express middleware
 */
const requireRole = (minimumRole) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHENTICATED'));
    }

    // Get user role - default to superuser for backward compatibility (original account creators)
    const userRole = req.user.role || 'superuser';
    const userLevel = getRoleLevel(userRole);
    const requiredLevel = getRoleLevel(minimumRole);

    if (userLevel < requiredLevel) {
      return next(new AppError(
        `Insufficient permissions. Required role: ${minimumRole}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      ));
    }

    next();
  };
};

/**
 * Middleware to require one of specific roles
 * @param {Array<string>} roles - Array of allowed roles
 * @returns {Function} - Express middleware
 */
const requireRoles = (roles) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHENTICATED'));
    }

    // Get user role - default to superuser for backward compatibility
    const userRole = req.user.role || 'superuser';

    if (!roles.includes(userRole)) {
      return next(new AppError(
        `Insufficient permissions. Required one of: ${roles.join(', ')}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      ));
    }

    next();
  };
};

/**
 * Middleware to require superuser role only
 * @returns {Function} - Express middleware
 */
const requireSuperuser = () => {
  return requireRole('superuser');
};

/**
 * Middleware to require admin or higher
 * @returns {Function} - Express middleware
 */
const requireAdmin = () => {
  return requireRole('admin');
};

/**
 * Middleware to require manager or higher
 * @returns {Function} - Express middleware
 */
const requireManager = () => {
  return requireRole('manager');
};

/**
 * Check if a user has at least a certain role level
 * @param {Object} user - User object
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean} - True if user has sufficient role
 */
const hasRole = (user, minimumRole) => {
  if (!user) return false;
  const userRole = user.role || 'superuser';
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole);
};

/**
 * Check if a user is superuser
 * @param {Object} user - User object
 * @returns {boolean} - True if superuser
 */
const isSuperuser = (user) => {
  if (!user) return false;
  const userRole = user.role || 'superuser';
  return userRole === 'superuser';
};

/**
 * Check if a user is admin or higher
 * @param {Object} user - User object
 * @returns {boolean} - True if admin or higher
 */
const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Check if a user is manager or higher
 * @param {Object} user - User object
 * @returns {boolean} - True if manager or higher
 */
const isManager = (user) => {
  return hasRole(user, 'manager');
};

module.exports = {
  USER_ROLES,
  EMPLOYEE_ROLES,
  ROLE_HIERARCHY,
  getRoleLevel,
  requireRole,
  requireRoles,
  requireSuperuser,
  requireAdmin,
  requireManager,
  hasRole,
  isSuperuser,
  isAdmin,
  isManager,
};
