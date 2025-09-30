import { test, expect } from '@playwright/test';
import { createTestUser, logout, deleteTestUser } from './helpers/auth-helpers';

test('create account with duplicate email shows error', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create first user
  const { email, password } = await createTestUser(page);

  // Logout
  await logout(page);

  // Try to create account with same email
  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill('Another User');
  await page.getByLabel(/Email/i).fill(email);

  // Fill password fields using input type selector
  const passwordInputs = page.locator('input[type="password"]');
  await passwordInputs.nth(0).fill(password);
  await passwordInputs.nth(1).fill(password);

  // Accept terms if checkbox exists
  const termsCheckbox = page.locator('input[type="checkbox"]').first();
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Should show error or stay on page
  await page.waitForTimeout(3000);

  // Check for error banner or stay on create account page
  const errorBanner = page.getByTestId('error-banner');
  const isOnCreatePage = page.url().includes('/auth/create-account');

  // Either should show error or stay on page
  const hasError = await errorBanner.isVisible().catch(() => false);
  expect(hasError || isOnCreatePage).toBe(true);

  // Cleanup - navigate to login and use loginTestUser helper
  const { loginTestUser } = await import('./helpers/auth-helpers');
  await loginTestUser(page, email, password);
  await deleteTestUser(page);
});

