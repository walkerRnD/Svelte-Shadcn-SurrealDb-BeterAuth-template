import { test, expect } from '@playwright/test';

// Skip by default unless dev login is enabled (depends on build-time flag)
const ENABLED = process.env.E2E_DEV === 'true';
if (!ENABLED) test.skip(true, 'E2E_DEV not enabled');

test('provider linking (dev) on profile', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Login via Dev Login
  await page.goto(base + '/');
  await page.getByRole('link', { name: /Login/i }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const devBtn = page.getByRole('button', { name: 'Dev Login' });
  if (!(await devBtn.isVisible().catch(() => false))) {
    test.skip(true, 'Dev Login not available in this build');
  }
  await Promise.race([
    devBtn.click(),
    page.waitForLoadState('networkidle'),
  ]);

  // Go to profile and verify
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // If buttons are available (user signed in), exercise linking; otherwise accept redirect to login
  const linkBtn = page.getByRole('button', { name: 'Link GitHub (dev)' });
  if (await linkBtn.isVisible().catch(() => false)) {
    // Capture initial count
    const badgeLocator = page.locator('[data-testid="provider-badge"]');
    const beforeCount = await badgeLocator.count();

    // GITHUB (smoke): click link/unlink if buttons exist and ensure no error banner appears
    await linkBtn.click();
    await expect(page.getByTestId('error-banner')).toHaveCount(0);
    const unlinkBtn = page.getByRole('button', { name: 'Unlink GitHub (dev)' });
    if (await unlinkBtn.isVisible().catch(() => false)) {
      await unlinkBtn.click();
      await expect(page.getByTestId('error-banner')).toHaveCount(0);
    }

    // GOOGLE (optional): if present, smoke the buttons
    const linkGoogle = page.getByRole('button', { name: 'Link Google (dev)' });
    const unlinkGoogle = page.getByRole('button', { name: 'Unlink Google (dev)' });

    if (await linkGoogle.isVisible().catch(() => false)) {
      await linkGoogle.click();
      await expect(page.getByTestId('error-banner')).toHaveCount(0);
      if (await unlinkGoogle.isVisible().catch(() => false)) {
        await unlinkGoogle.click();
        await expect(page.getByTestId('error-banner')).toHaveCount(0);
      }
    }
  } else {
    // Strict guard redirects when not signed in; expect to see login page
    await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();
  }
});

