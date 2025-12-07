/**
 * Validation utilities
 * Shared validation patterns and functions
 */

/**
 * Email validation regex
 * Matches basic email format: user@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * UUID validation regex
 * Matches standard UUID format (version 4)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Time validation regex
 * Matches HH:MM format (24-hour)
 */
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

module.exports = {
  EMAIL_REGEX,
  UUID_REGEX,
  TIME_REGEX,
};
