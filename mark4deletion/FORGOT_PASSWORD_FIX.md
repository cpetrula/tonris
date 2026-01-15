# Forgot Password Email Fix

## Issue
Users were not receiving password reset emails when clicking "Forgot Password" on the login page.

## Root Cause
The forgot password functionality was properly implemented in the code, but emails were not being sent because the **`RESEND_API_KEY` environment variable was not configured** in the production environment.

When `RESEND_API_KEY` is missing:
- The email service returns `{ success: false, reason: 'RESEND_NOT_CONFIGURED' }`
- No error was thrown, so the issue was silent
- Users received a success message but no email was sent
- Logs showed "Password reset email sent" even though it wasn't

## Changes Made

### 1. Improved Logging in Auth Service
**File**: `backend/src/modules/auth/auth.service.js`

Updated the forgot password flow to check the email send result and log appropriately:

```javascript
const emailResult = await sendPasswordResetEmail(email, {
  resetUrl,
  expiryHours: 1,
});

if (emailResult.success) {
  logger.info(`Password reset email sent to: ${email}`);
} else {
  logger.warn(`Password reset email failed for ${email}: ${emailResult.reason || emailResult.error || 'Unknown error'}`);
}
```

**Before**: Always logged "Password reset email sent" regardless of actual result
**After**: Logs success or warning with reason based on actual email send result

### 2. Startup Configuration Warning
**File**: `backend/src/app.js`

Added a warning on server startup when `RESEND_API_KEY` is not configured:

```javascript
if (!env.RESEND_API_KEY) {
  logger.warn('⚠️  RESEND_API_KEY not configured - email notifications (including password reset) will not be sent');
}
```

This makes configuration issues immediately visible in the logs when the server starts.

### 3. Clearer Email Service Logging
**File**: `backend/src/modules/notifications/email.service.js`

Changed the log message from:
```javascript
logger.info(`Email would be sent to ${to}: ${subject} (Resend not configured)`);
```

To:
```javascript
logger.warn(`Email NOT sent to ${to}: ${subject} (RESEND_API_KEY not configured)`);
```

This makes it clearer that emails are NOT being sent and uses `warn` level instead of `info`.

## How to Fix in Production

### Option 1: Configure Resend API Key (Recommended)

1. **Sign up for Resend** (if not already done)
   - Go to https://resend.com
   - Create an account
   - Verify your sending domain

2. **Get your API key**
   - Go to API Keys section in Resend dashboard
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Set the environment variable**
   ```bash
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

4. **Verify the sender domain**
   - In Resend dashboard, add and verify your domain
   - Update DNS records as instructed
   - The default from address is `notifications@criton.ai`
   - Make sure `criton.ai` is verified or update the sender in the code

5. **Restart the server**
   ```bash
   cd backend
   npm start
   ```

6. **Check startup logs** for the warning message
   - If configured correctly, you should NOT see the warning
   - If misconfigured, you'll see: "⚠️  RESEND_API_KEY not configured..."

### Option 2: Use Alternative Email Service

If you prefer a different email service (SendGrid, Mailgun, etc.):

1. Update `backend/src/modules/notifications/email.service.js`
2. Replace Resend client with your preferred service
3. Update environment variables accordingly

## Testing

### Test in Development

1. Create a `.env` file in `backend/` directory:
   ```bash
   RESEND_API_KEY=re_your_test_api_key
   FRONTEND_URL=http://localhost:5173
   ```

2. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Check startup logs - should NOT see the warning

4. Test forgot password:
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "your-test-email@example.com"}'
   ```

5. Check logs for:
   - ✅ "Password reset email sent to: your-test-email@example.com"
   - ❌ NOT "Password reset email failed for..."

6. Check your email inbox for the password reset email

### Verify in Production

1. Check server startup logs for the warning message
2. If you see the warning, configure `RESEND_API_KEY`
3. After configuration, restart and verify the warning is gone
4. Test the forgot password flow with a real email address
5. Check application logs to confirm email was sent successfully

## Monitoring

### What to Monitor

1. **Startup logs**: Check for configuration warnings
   ```
   ⚠️  RESEND_API_KEY not configured - email notifications (including password reset) will not be sent
   ```

2. **Runtime logs**: Monitor for email send failures
   ```
   Password reset email failed for user@example.com: RESEND_NOT_CONFIGURED
   ```

3. **User reports**: Track support tickets about not receiving emails

### Log Levels

- `info`: Email sent successfully
- `warn`: Email not sent due to configuration issue
- `error`: Email sending failed due to service error

## Security Notes

- The forgot password endpoint always returns success (security best practice)
- Never reveals whether an email exists in the database
- Reset tokens expire after 1 hour
- Tokens are hashed before storage in database
- Email service failures don't expose information to users

## Related Files

- `backend/src/modules/auth/auth.service.js` - Password reset logic
- `backend/src/modules/notifications/email.service.js` - Email sending service
- `backend/src/app.js` - Server startup and configuration checks
- `backend/.env.example` - Example environment configuration
- `FORGOT_PASSWORD_IMPLEMENTATION.md` - Original implementation documentation

## Support

If emails still aren't working after configuring `RESEND_API_KEY`:

1. Check Resend dashboard for delivery errors
2. Verify domain DNS records are correct
3. Check spam folder
4. Review application logs for specific error messages
5. Ensure sender email is from verified domain
