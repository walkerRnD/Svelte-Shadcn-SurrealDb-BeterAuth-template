# E2E Tests - Quick Start Guide

## 🚀 Running Tests

### 1. Run All Tests (Headless)
```bash
npm run test:e2e
```

### 2. Run Tests in UI Mode (Recommended) ⭐
```bash
npm run test:e2e:ui
```
**Best for development** - Interactive UI to run, debug, and watch tests.

### 3. Run Tests with Browser Visible
```bash
npm run test:e2e:headed
```

### 4. Run Tests in Debug Mode
```bash
npm run test:e2e:debug
```

### 5. Run Critical Tests Only
```bash
npm run test:e2e:critical
```
Runs only: change password, delete account, and login tests.

### 6. View Test Report
```bash
npm run test:e2e:report
```

---

## 📋 Test Files Overview

### ✅ Always Run (Default)
- `auth.spec.ts` - Dev Login flow
- `auth-login-valid.spec.ts` - Real email/password login
- `auth-login-invalid.spec.ts` - Invalid credentials
- `auth-change-password.spec.ts` - Change password
- `auth-delete-account.spec.ts` - Delete account
- `auth-create-account.spec.ts` - Create account
- `user-profile-guard.spec.ts` - Route guards
- `auth-logout.spec.ts` - Logout functionality

### 🔵 Optional (Require Configuration)
- `auth-reset-complete.spec.ts` - Requires email service
- `auth-login-oauth.spec.ts` - Requires OAuth setup
- `auth-csrf-protection.spec.ts` - Requires CSRF middleware
- `auth-rate-limiting.spec.ts` - Requires rate limiting
- `auth-login-remember.spec.ts` - Requires Remember Me feature

---

## 🔧 Enable Optional Tests

```bash
# Enable all optional features
E2E_OAUTH=true E2E_CSRF=true E2E_RATE_LIMIT=true npm run test:e2e

# Enable specific feature
E2E_RESET_COMPLETE=true npm run test:e2e
```

---

## 🐛 Debugging Failed Tests

### 1. Run Single Test File
```bash
npx playwright test e2e/auth-login-valid.spec.ts
```

### 2. Run Single Test with Debug
```bash
npx playwright test e2e/auth-login-valid.spec.ts --debug
```

### 3. View Test Trace
```bash
npx playwright show-trace test-results/*/trace.zip
```

### 4. Check Screenshots
Failed tests save screenshots to `test-results/`

---

## 📊 Test Results

After running tests:
- ✅ **Passed** - Test successful
- ❌ **Failed** - Test failed (check screenshots/traces)
- ⏭️ **Skipped** - Test skipped (optional feature not enabled)

---

## 🧹 Cleanup

Tests automatically clean up by deleting test users. If tests fail before cleanup:

1. Check test database for orphaned users
2. Delete users with emails: `e2e+*@example.com`

---

## 💡 Tips

1. **Use UI Mode** for development - easiest way to run and debug tests
2. **Run critical tests first** - fastest way to verify core functionality
3. **Check test reports** - HTML report shows detailed results
4. **Enable optional tests** only when features are configured
5. **Run tests before committing** - ensure changes don't break auth

---

## 📚 More Information

- Full documentation: [README.md](./README.md)
- Implementation summary: [../docs/e2e-tests-implementation-summary.md](../docs/e2e-tests-implementation-summary.md)
- Test plan: [../docs/fix-e2e-test-user.plan.md](../docs/fix-e2e-test-user.plan.md)

---

## ⚡ Common Commands

```bash
# Run all tests
npm run test:e2e

# Run with UI (best for dev)
npm run test:e2e:ui

# Run critical tests only
npm run test:e2e:critical

# Run specific test
npx playwright test auth-login-valid

# Debug specific test
npx playwright test auth-login-valid --debug

# View report
npm run test:e2e:report

# Run with optional features
E2E_OAUTH=true npm run test:e2e
```

---

**Ready to test!** Start with `npm run test:e2e:ui` 🚀

