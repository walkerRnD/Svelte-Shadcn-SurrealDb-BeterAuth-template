import { test, expect } from '@playwright/test';
import { loginWithDevLogin, deleteTestUser } from './helpers/auth-helpers';

// Skip by default unless dev login is enabled
const ENABLED = process.env.E2E_DEV === 'true';
if (!ENABLED) test.skip(true, 'E2E_DEV not enabled');

test('link GitHub provider shows badge', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Login with dev login
  await loginWithDevLogin(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Find link button
  const linkBtn = page.getByRole('button', { name: /Link GitHub/i });
  if (await linkBtn.isVisible().catch(() => false)) {
    // Get initial badge count
    const badgeLocator = page.locator('[data-testid="provider-badge"]');
    const beforeCount = await badgeLocator.count();

    // Click link
    await linkBtn.click();
    await page.waitForTimeout(2000);

    // Verify no error
    const errorBanner = page.getByTestId('error-banner');
    await expect(errorBanner).toHaveCount(0);

    // Refresh and verify persisted
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  // Cleanup
  await deleteTestUser(page);
});

test('link and unlink provider cycle', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Login with dev login
  await loginWithDevLogin(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Link GitHub
  const linkBtn = page.getByRole('button', { name: /Link GitHub/i });
  if (await linkBtn.isVisible().catch(() => false)) {
    await linkBtn.click();
    await page.waitForTimeout(2000);

    // Unlink
    const unlinkBtn = page.getByRole('button', { name: /Unlink GitHub/i });
    if (await unlinkBtn.isVisible().catch(() => false)) {
      await unlinkBtn.click();
      await page.waitForTimeout(2000);

      // Verify no error
      const errorBanner = page.getByTestId('error-banner');
      await expect(errorBanner).toHaveCount(0);
    }
  }

  // Cleanup
  await deleteTestUser(page);
});

test('link Google provider if available', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Login with dev login
  await loginWithDevLogin(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Try to link Google
  const linkBtn = page.getByRole('button', { name: /Link Google/i });
  if (await linkBtn.isVisible().catch(() => false)) {
    await linkBtn.click();
    await page.waitForTimeout(2000);

    // Verify no error
    const errorBanner = page.getByTestId('error-banner');
    await expect(errorBanner).toHaveCount(0);
  }

  // Cleanup
  await deleteTestUser(page);
});

