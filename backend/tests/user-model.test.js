/**
 * User Model Password Hashing Tests
 * Tests for User model password hashing behavior without database
 */
const bcrypt = require('bcrypt');

// Helper function to check if a string is already a bcrypt hash
const isBcryptHash = (password) => {
  return /^\$2[aby]\$\d{2}\$/.test(password);
};

// Simulate the beforeCreate hook logic
const beforeCreateHook = async (user) => {
  if (user.password && !isBcryptHash(user.password)) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
};

// Simulate the beforeUpdate hook logic
const beforeUpdateHook = async (user, passwordChanged) => {
  if (passwordChanged && user.password && !isBcryptHash(user.password)) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
};

describe('User Model Password Hashing Logic', () => {
  describe('isBcryptHash helper', () => {
    it('should detect bcrypt hash with $2b$ prefix', () => {
      const hash = '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi';
      expect(isBcryptHash(hash)).toBe(true);
    });

    it('should detect bcrypt hash with $2a$ prefix', () => {
      const hash = '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST';
      expect(isBcryptHash(hash)).toBe(true);
    });

    it('should detect bcrypt hash with $2y$ prefix', () => {
      const hash = '$2y$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST';
      expect(isBcryptHash(hash)).toBe(true);
    });

    it('should not detect plain text password as hash', () => {
      expect(isBcryptHash('Demo123!')).toBe(false);
      expect(isBcryptHash('MyPassword123')).toBe(false);
      expect(isBcryptHash('')).toBe(false);
    });

    it('should not detect invalid hash format', () => {
      expect(isBcryptHash('$2c$10$invalid')).toBe(false);
      expect(isBcryptHash('$2b$1$tooshort')).toBe(false);
      expect(isBcryptHash('notahash')).toBe(false);
    });
  });

  describe('beforeCreate hook behavior', () => {
    it('should hash a plain text password', async () => {
      const user = { password: 'TestPassword123!' };
      await beforeCreateHook(user);

      expect(user.password).not.toBe('TestPassword123!');
      expect(isBcryptHash(user.password)).toBe(true);

      // Verify the hash is correct
      const isMatch = await bcrypt.compare('TestPassword123!', user.password);
      expect(isMatch).toBe(true);
    });

    it('should not double-hash an already hashed password', async () => {
      const preHashedPassword = '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi';
      const user = { password: preHashedPassword };
      await beforeCreateHook(user);

      // Password should remain unchanged
      expect(user.password).toBe(preHashedPassword);

      // Should still match the original password
      const isMatch = await bcrypt.compare('Demo123!', user.password);
      expect(isMatch).toBe(true);
    });

    it('should handle empty password', async () => {
      const user = { password: null };
      await beforeCreateHook(user);
      expect(user.password).toBeNull();

      const user2 = { password: '' };
      await beforeCreateHook(user2);
      expect(user2.password).toBe('');
    });
  });

  describe('beforeUpdate hook behavior', () => {
    it('should hash a new plain text password when password changed', async () => {
      const user = { password: 'NewPassword456!' };
      await beforeUpdateHook(user, true);

      expect(user.password).not.toBe('NewPassword456!');
      expect(isBcryptHash(user.password)).toBe(true);

      const isMatch = await bcrypt.compare('NewPassword456!', user.password);
      expect(isMatch).toBe(true);
    });

    it('should not hash when password did not change', async () => {
      const originalHash = '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi';
      const user = { password: originalHash };
      await beforeUpdateHook(user, false);

      // Password should remain unchanged
      expect(user.password).toBe(originalHash);
    });

    it('should not double-hash when updating to a pre-hashed password', async () => {
      const preHashedPassword = '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi';
      const user = { password: preHashedPassword };
      await beforeUpdateHook(user, true);

      // Password should remain unchanged
      expect(user.password).toBe(preHashedPassword);

      const isMatch = await bcrypt.compare('Demo123!', user.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('End-to-end password scenarios', () => {
    it('should support seed data with pre-hashed passwords', async () => {
      // Simulate creating a user from seed data with pre-hashed password
      const seedUser = {
        email: 'admin@hairdonerightson.com',
        password: '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi', // Demo123!
        tenantId: 'tenant-uuid',
      };

      await beforeCreateHook(seedUser);

      // Password should not be double-hashed
      expect(seedUser.password).toBe('$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi');

      // User should be able to login with original password
      const canLogin = await bcrypt.compare('Demo123!', seedUser.password);
      expect(canLogin).toBe(true);
    });

    it('should handle user registration with plain password', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'UserPassword123!',
        tenantId: 'tenant-uuid',
      };

      await beforeCreateHook(newUser);

      // Password should be hashed
      expect(newUser.password).not.toBe('UserPassword123!');
      expect(isBcryptHash(newUser.password)).toBe(true);

      // User should be able to login
      const canLogin = await bcrypt.compare('UserPassword123!', newUser.password);
      expect(canLogin).toBe(true);
    });

    it('should handle password reset with plain password', async () => {
      // User starts with a hashed password
      const user = {
        password: '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi',
      };

      // User resets to a new plain password
      user.password = 'NewResetPassword789!';
      await beforeUpdateHook(user, true);

      // Password should be hashed
      expect(user.password).not.toBe('NewResetPassword789!');
      expect(isBcryptHash(user.password)).toBe(true);

      // User should be able to login with new password
      const canLogin = await bcrypt.compare('NewResetPassword789!', user.password);
      expect(canLogin).toBe(true);

      // Old password should not work
      const oldPasswordWorks = await bcrypt.compare('Demo123!', user.password);
      expect(oldPasswordWorks).toBe(false);
    });

    it('should handle bulk create with mixed password types', async () => {
      const users = [
        {
          email: 'user1@example.com',
          password: 'PlainPassword1!', // Plain text
        },
        {
          email: 'user2@example.com',
          password: '$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi', // Pre-hashed (Demo123!)
        },
      ];

      // Simulate bulk create hooks
      for (const user of users) {
        await beforeCreateHook(user);
      }

      // First user password should be hashed
      expect(users[0].password).not.toBe('PlainPassword1!');
      expect(isBcryptHash(users[0].password)).toBe(true);
      const user1CanLogin = await bcrypt.compare('PlainPassword1!', users[0].password);
      expect(user1CanLogin).toBe(true);

      // Second user password should remain unchanged
      expect(users[1].password).toBe('$2b$10$cuxtDMGAPnYN595um0PtauSaGMXy9SQIHIhMqAHrUYcwjAGEiPZXi');
      const user2CanLogin = await bcrypt.compare('Demo123!', users[1].password);
      expect(user2CanLogin).toBe(true);
    });
  });
});
