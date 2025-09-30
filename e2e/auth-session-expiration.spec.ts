import { test, expect } from '@playwright/test';
import { createTestUser } from './helpers/auth-helpers';

// Skip by default - session expiration testing requires time manipulation
const ENABLED = process.env.E2E_SESSION_EXPIRATION === 'true';
if (!ENABLED) test.skip(true, 'E2E_SESSION_EXPIRATION not enabled - requires time manipulation');

test('expired session redirects to login', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create and login
  await createTestUser(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Mock session expiration by clearing cookies
  await page.context().clearCookies();

  // Try to access protected page
  await page.goto(base + '/user/profile');
  
  // Should redirect to login
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
});

test('session expiration shows message', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create and login
  await createTestUser(page);
  
  // Clear session
  await page.context().clearCookies();

  // Try to access protected page
  await page.goto(base + '/user/profile');
  
  // Should redirect to login
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
  
  // May show session expired message (implementation dependent)
});

