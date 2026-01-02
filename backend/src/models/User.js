/**
 * User Model
 * Defines the User schema for authentication
 * 
 * Password Hashing:
 * - Passwords are automatically hashed using bcrypt before saving to the database
 * - The model intelligently detects if a password is already hashed to prevent double-hashing
 * - This allows for safe use of pre-hashed passwords in seed data or bulk operations
 * - Hash detection works for bcrypt formats: $2a$, $2b$, and $2y$
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Check if a string is already a bcrypt hash
 * @param {string} password - The password to check
 * @returns {boolean} - True if the password is already a bcrypt hash
 */
const isBcryptHash = (password) => {
  // Handle null, undefined, or non-string values
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Bcrypt hashes have a distinctive format: $2a$, $2b$, or $2y$ followed by cost factor
  // and should be exactly 60 characters long
  // Example: $2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(password) && password.length === 60;
};

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id',
    },
  },
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'two_factor_secret',
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'two_factor_enabled',
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'password_reset_token',
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'password_reset_expires',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  smsOptIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'sms_opt_in',
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      // Only hash the password if it's not already a bcrypt hash
      if (user.password && !isBcryptHash(user.password)) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      // Only hash the password if it changed and it's not already a bcrypt hash
      if (user.changed('password') && user.password && !isBcryptHash(user.password)) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - The password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get user data without sensitive fields
 * @returns {Object} - User data without password and 2FA secret
 */
User.prototype.toSafeObject = function() {
  const userJson = this.toJSON();
  delete userJson.password;
  delete userJson.twoFactorSecret;
  delete userJson.passwordResetToken;
  delete userJson.passwordResetExpires;
  return userJson;
};

module.exports = User;
