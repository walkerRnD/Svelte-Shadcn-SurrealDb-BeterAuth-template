import { test, expect } from '@playwright/test';
import { createTestUser, loginTestUser, logout, deleteTestUser } from './helpers/auth-helpers';

test('change password → logout → login with new password', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create a test user
  const { email, password } = await createTestUser(page);
  const newPassword = 'NewTestPassword456!';

  // Navigate to change password page
  await page.goto(base + '/user/account/change-password');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Fill the form
  await page.getByLabel(/Current password|Senha atual/i).fill(password);
  await page.getByLabel(/^New password|^Nova senha/i).first().fill(newPassword);
  await page.getByLabel(/Confirm.*password|Confirmar.*senha/i).fill(newPassword);

  // Submit
  await page.getByRole('button', { name: /Change password|Alterar senha|Update/i }).click();

  // Wait for success message or redirect
  try {
    const successMsg = page.getByRole('status');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
  } catch {
    // May not have explicit success message, check no error
    const errorBanner = page.getByTestId('error-banner');
    await expect(errorBanner).toHaveCount(0);
  }

  // Logout
  await logout(page);

  // Try to login with old password (should fail)
  await page.goto(base + '/auth/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();

  // Should stay on login page or show error
  await page.waitForTimeout(2000);
  const currentUrl = page.url();
  expect(currentUrl).toContain('/auth/login');

  // Now login with new password (should succeed)
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/Password|Senha/i).fill(newPassword);
  await page.locator('form').getByRole('button', { name: /Sign in|Entrar|Login/i }).first().click();

  // Wait for session
  await expect.poll(async () => {
    const status = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/session', { credentials: 'include' });
        if (!r.ok) return 'no';
        const data = await r.json();
        return data?.user?.id ? 'ok' : 'no';
      } catch {
        return 'no';
      }
    });
    return status;
  }, { timeout: 15000 }).toBe('ok');

  // Verify we're logged in
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Cleanup
  await deleteTestUser(page);
});

test('change password with wrong current password shows error', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create and login
  const { email, password } = await createTestUser(page);

  await page.goto(base + '/user/account/change-password');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Fill with wrong current password using input type selectors
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill('WrongPassword123!'); // Current password
  await passwordInputs.nth(1).fill('NewTestPassword456!'); // New password
  await passwordInputs.nth(2).fill('NewTestPassword456!'); // Confirm password

  await page.getByRole('button', { name: /Change password|Alterar senha|Update/i }).click();

  // Should show error - wait a bit for the response
  await page.waitForTimeout(2000);

  // Check if we're still on the change password page (error occurred)
  const isOnChangePage = page.url().includes('/change-password');
  expect(isOnChangePage).toBe(true);

  // Cleanup
  await deleteTestUser(page);
});

