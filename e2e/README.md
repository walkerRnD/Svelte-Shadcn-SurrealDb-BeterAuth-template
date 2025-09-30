# E2E Tests - Authentication & User Management

This directory contains comprehensive end-to-end tests for authentication and user management features.

## 📋 Test Coverage

### ✅ Core Authentication Tests
- **auth.spec.ts** - Login with Dev Login, navigation smoke tests
- **auth-login-valid.spec.ts** - Login with real email/password credentials
- **auth-login-invalid.spec.ts** - Invalid login credentials handling
- **auth-login-redirect.spec.ts** - Login redirect to intended page
- **auth-login-remember.spec.ts** - Remember Me functionality (optional)
- **auth-logout.spec.ts** - Logout from various pages

### 📝 Account Creation Tests
- **auth-create-account.spec.ts** - Create account flow
- **auth-create-account-validation.spec.ts** - Form validation errors
- **auth-create-account-duplicate.spec.ts** - Duplicate email handling

### 🔑 Password Management Tests
- **auth-change-password.spec.ts** - Change password success flow
- **auth-change-password-validation.spec.ts** - Change password validation
- **auth-reset.spec.ts** - Password reset request
- **auth-reset-invalid.spec.ts** - Invalid reset token handling
- **auth-reset-complete.spec.ts** - Complete reset flow (optional)
- **auth-reset-expired.spec.ts** - Expired token handling (optional)

### 🗑️ Account Deletion Tests
- **auth-delete-account.spec.ts** - Delete account success flow
- **auth-delete-account-error.spec.ts** - Delete account error handling

### 👤 User Profile Tests
- **user-profile-update.spec.ts** - Update profile information
- **user-profile-guard.spec.ts** - Authentication guards on protected routes

### 🔗 OAuth Provider Tests
- **dev-login.spec.ts** - Dev Login flow (for testing)
- **provider-linking.spec.ts** - Link/unlink OAuth providers
- **provider-link-success.spec.ts** - Provider linking success
- **provider-unlink-last.spec.ts** - Prevent unlinking last auth method
- **auth-login-oauth.spec.ts** - OAuth login flow (optional)

### 🔒 Session Management Tests
- **auth-session-persistence.spec.ts** - Session persistence across reloads
- **auth-session-expiration.spec.ts** - Session expiration handling (optional)
- **auth-concurrent-sessions.spec.ts** - Multiple browser sessions

### 🛡️ Security Tests
- **auth-csrf-protection.spec.ts** - CSRF protection (optional)
- **auth-xss-protection.spec.ts** - XSS protection in user input
- **auth-rate-limiting.spec.ts** - Rate limiting (optional)

## 🚀 Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test e2e/auth-login-valid.spec.ts
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Tests with Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 🔧 Configuration

### Environment Variables

#### Always Enabled (Default)
- `E2E_DEV=true` - Enable Dev Login tests
- `E2E_CREATE_ACCOUNT=true` - Enable account creation tests

#### Optional Features (Disabled by Default)
Enable these by setting environment variables:

```bash
# OAuth provider tests (requires OAuth configuration)
E2E_OAUTH=true

# CSRF protection tests (requires CSRF middleware)
E2E_CSRF=true

# Rate limiting tests (requires rate limiting middleware)
E2E_RATE_LIMIT=true

# Remember Me feature tests (requires Remember Me implementation)
E2E_REMEMBER_ME=true

# Complete password reset flow (requires email service)
E2E_RESET_COMPLETE=true

# Token expiration tests (requires time manipulation)
E2E_RESET_EXPIRATION=true

# Session expiration tests (requires session config)
E2E_SESSION_EXPIRATION=true
```

### Example: Run with Optional Features
```bash
E2E_OAUTH=true E2E_CSRF=true npx playwright test
```

## 📁 Test Helpers

### `helpers/auth-helpers.ts`
Utility functions for common auth operations:

- `generateUniqueEmail()` - Generate unique test emails
- `createTestUser()` - Create a test user account
- `loginTestUser()` - Login with email/password
- `loginWithDevLogin()` - Login using Dev Login button
- `logout()` - Logout from the application
- `deleteTestUser()` - Delete test user (cleanup)
- `isLoggedIn()` - Check if user is logged in
- `expectErrorBanner()` - Verify error banner is visible
- `expectSuccessMessage()` - Verify success message is visible

### Usage Example
```typescript
import { createTestUser, loginTestUser, deleteTestUser } from './helpers/auth-helpers';

test('my test', async ({ page }) => {
  // Create user
  const { email, password } = await createTestUser(page);
  
  // Do something...
  
  // Cleanup
  await deleteTestUser(page);
});
```

## 🧹 Test Cleanup

Most tests automatically clean up by deleting the test user at the end. If a test fails before cleanup, you may have orphaned test users in the database.

### Manual Cleanup
If needed, you can manually clean up test users:
1. Connect to your test database
2. Delete users with emails matching `e2e+*@example.com`

## 📊 Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## 🐛 Debugging Failed Tests

### View Test Traces
```bash
npx playwright show-trace trace.zip
```

### Run Single Test with Debug
```bash
npx playwright test e2e/auth-login-valid.spec.ts --debug
```

### View Screenshots and Videos
Failed tests automatically capture:
- Screenshots (in `test-results/`)
- Videos (in `test-results/`)
- Traces (in `test-results/`)

## 📝 Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './helpers/auth-helpers';

test('my new test', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create test user
  const { email, password } = await createTestUser(page);
  
  // Test logic here
  await page.goto(base + '/some-page');
  await expect(page.getByRole('heading')).toBeVisible();
  
  // Cleanup
  await deleteTestUser(page);
});
```

### Best Practices
1. **Always clean up** - Delete test users at the end
2. **Use unique emails** - Use `generateUniqueEmail()` for each test
3. **Wait for elements** - Use `expect().toBeVisible()` instead of `waitForTimeout()`
4. **Use semantic selectors** - Prefer `getByRole()`, `getByLabel()` over CSS selectors
5. **Handle i18n** - Use regex for text matching: `/Login|Entrar/i`
6. **Test isolation** - Each test should be independent
7. **Error handling** - Use try/catch for cleanup in case of failures

## 🔗 References

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Project Plan](../docs/fix-e2e-test-user.plan.md)

## 📌 Notes

### Test Data
- Test users are created with emails like `e2e+{timestamp}{random}@example.com`
- Passwords are strong by default: `TestPassword123!`
- Names are `E2E Test User` by default

### Known Limitations
1. **Email verification** - Currently disabled in auth config
2. **OAuth testing** - Requires mock OAuth server or test credentials
3. **Rate limiting** - Requires rate limiting middleware
4. **CSRF testing** - Requires CSRF middleware configuration

### CI/CD Integration
Tests are configured to run in CI with:
- 2 retries for flaky tests
- Serial execution (1 worker)
- GitHub Actions reporter
- Trace/screenshot/video on failure

## ✅ Test Status

Total Tests: **24 test files** covering all authentication and user management features

- ✅ **Phase 1** (Critical): 4 tests - Change password, delete account, login, reset
- ✅ **Phase 2** (Validation): 4 tests - Form validation and error handling
- ✅ **Phase 3** (User Management): 4 tests - Profile updates and guards
- ✅ **Phase 4** (OAuth): 3 tests - Provider linking and OAuth login
- ✅ **Phase 5** (Session): 3 tests - Session persistence and expiration
- ✅ **Phase 6** (Security): 3 tests - CSRF, XSS, rate limiting
- ✅ **Phase 7** (Advanced): 3 tests - Remember Me, token expiration

**Last Updated**: 2025-09-30

