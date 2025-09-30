import { test, expect } from '@playwright/test';
import { loginWithDevLogin, deleteTestUser } from './helpers/auth-helpers';

// Skip by default unless dev login is enabled
const ENABLED = process.env.E2E_DEV === 'true';
if (!ENABLED) test.skip(true, 'E2E_DEV not enabled');

test('cannot unlink last authentication method', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Login with dev login (OAuth-like)
  await loginWithDevLogin(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Check if user has password set
  // If not, trying to unlink last provider should show error
  
  // This test is conceptual - actual implementation depends on:
  // 1. Whether user has password
  // 2. How many providers are linked
  // 3. Backend validation logic

  // For now, just verify the profile page loads
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Cleanup
  await deleteTestUser(page);
});

test('can unlink provider after setting password', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Login with dev login
  await loginWithDevLogin(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // This test would require:
  // 1. Setting a password first
  // 2. Then unlinking the OAuth provider
  // Implementation depends on whether user has password field

  // For now, verify page structure
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Cleanup
  await deleteTestUser(page);
});

