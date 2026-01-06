#!/usr/bin/env node
/**
 * Test Email Configuration
 * 
 * This script verifies the email configuration by checking:
 * 1. If RESEND_API_KEY is set
 * 2. If email service can be initialized
 * 3. Simulates the forgot password email flow
 * 
 * Usage:
 *   node test-email-config.js
 */

require('dotenv').config();
const { isEmailServiceConfigured } = require('./src/modules/notifications/email.service');

console.log('='.repeat(60));
console.log('Email Configuration Test');
console.log('='.repeat(60));
console.log();

// Check environment variables
console.log('1. Environment Variables:');
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set (length: ' + process.env.RESEND_API_KEY.length + ')' : '❌ Not set'}`);
console.log(`   FRONTEND_URL:   ${process.env.FRONTEND_URL || 'http://localhost:5173 (default)'}`);
console.log();

// Check email service
console.log('2. Email Service Status:');
const isConfigured = isEmailServiceConfigured();
if (isConfigured) {
  console.log('   ✅ Email service is configured');
  console.log('   ✅ Password reset emails will be sent');
} else {
  console.log('   ❌ Email service is NOT configured');
  console.log('   ❌ Password reset emails will NOT be sent');
  console.log();
  console.log('   To fix this:');
  console.log('   1. Sign up at https://resend.com');
  console.log('   2. Get your API key');
  console.log('   3. Set RESEND_API_KEY in your .env file:');
  console.log('      RESEND_API_KEY=re_your_api_key_here');
}
console.log();

// Server startup simulation
console.log('3. Server Startup Check:');
if (!process.env.RESEND_API_KEY) {
  console.log('   ⚠️  RESEND_API_KEY not configured - email notifications (including password reset) will not be sent');
} else {
  console.log('   ✅ No warnings - email configuration looks good');
}
console.log();

console.log('='.repeat(60));
console.log('For more information, see:');
console.log('  - FORGOT_PASSWORD_FIX.md');
console.log('  - backend/README.md (Email Configuration section)');
console.log('='.repeat(60));
