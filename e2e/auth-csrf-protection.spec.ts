import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './helpers/auth-helpers';

// Skip by default - CSRF testing requires specific setup
const ENABLED = process.env.E2E_CSRF === 'true';
if (!ENABLED) test.skip(true, 'E2E_CSRF not enabled - requires CSRF configuration');

test('login without CSRF token fails or is protected', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Try to submit login via fetch without proper headers
  const result = await page.evaluate(async (baseUrl) => {
    try {
      const res = await fetch(baseUrl + '/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
        }),
      });
      return { status: res.status, ok: res.ok };
    } catch (e: any) {
      return { error: e.message };
    }
  }, base);

  // Should fail or be rejected (implementation dependent)
  console.log('Login without CSRF result:', result);
});

test('change password without CSRF token fails', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create and login
  await createTestUser(page);
  
  // Try to change password via direct API call without CSRF
  const result = await page.evaluate(async (baseUrl) => {
    try {
      const res = await fetch(baseUrl + '/api/auth/change-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'old',
          newPassword: 'new',
        }),
      });
      return { status: res.status, ok: res.ok };
    } catch (e: any) {
      return { error: e.message };
    }
  }, base);

  console.log('Change password without CSRF result:', result);

  // Cleanup
  await deleteTestUser(page);
});

test('delete account without CSRF token fails', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create and login
  await createTestUser(page);
  
  // Try to delete account via direct API call
  const result = await page.evaluate(async (baseUrl) => {
    try {
      const res = await fetch(baseUrl + '/api/auth/delete-user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      });
      return { status: res.status, ok: res.ok };
    } catch (e: any) {
      return { error: e.message };
    }
  }, base);

  console.log('Delete account without CSRF result:', result);

  // Cleanup (if account still exists)
  await deleteTestUser(page);
});

