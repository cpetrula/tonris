# Login Issue Fix - Double-Hashed Passwords

## Problem

Prior to PR #162, the User model was double-hashing passwords during user creation and updates. This caused login failures for affected users because:

1. When a user was created, their password went through the hashing process TWICE
2. The password stored in database: `bcrypt(bcrypt(plaintext))`
3. During login, `bcrypt.compare(plaintext, double_hashed)` would fail
4. Result: Users could not log in with their correct password

## The Fix

PR #162 fixed the User model to detect if a password is already hashed before hashing it again. This prevents NEW users from experiencing the issue, but EXISTING users with double-hashed passwords still cannot login.

## Solution

We need to reset passwords for affected users. There are two approaches:

### Option 1: Password Reset Flow (RECOMMENDED for Production)

Use `fix_double_hashed_passwords.sql` to generate password reset tokens for all users, then send them reset emails.

**Steps:**
1. Run the SQL script: `fix_double_hashed_passwords.sql`
2. Extract reset tokens from database
3. Send password reset emails to all affected users
4. Users click the link and set a new password
5. New passwords will be properly hashed by the fixed User model

### Option 2: Temporary Password (Development/Testing Only)

Use `fix_double_hashed_passwords_temp.sql` to set all user passwords to a known temporary password.

**Steps:**
1. Run the SQL script: `fix_double_hashed_passwords_temp.sql`
2. All users can now login with password: `TempPassword123!`
3. Users should change their password immediately after login

## Verification

After running either migration:

1. Try logging in with the test user from seed data:
   - Email: `admin@hairdonerightson.com`
   - Password: `Demo123!` (if using seed data) OR `TempPassword123!` (if using temp password fix)

2. Check that login succeeds and returns a valid JWT token

3. Verify the user can perform authenticated actions

## Prevention

The User model (PR #162) now includes:

- `isBcryptHash()` function that detects already-hashed passwords
- Smart hashing logic in `beforeCreate` and `beforeUpdate` hooks
- Prevents double-hashing from occurring again

New users and password resets will work correctly without any additional intervention.

## Testing

Run the authentication test suite to verify the fix:

```bash
cd backend
npm test -- --testPathPatterns=auth.test.js
```

All 54 tests should pass, including the login tests that verify proper password handling.
