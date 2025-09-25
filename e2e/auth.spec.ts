import { test, expect } from '@playwright/test';

// E2E flag removed; always run in CI

test('login → profile → logout', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Go to home
  await page.goto(base + '/');
  await expect(page.getByRole('link', { name: 'Login' }).first()).toBeVisible();

  // Navigate to login
  await page.getByRole('link', { name: 'Login' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();

  // Prefer Dev Login in non-prod for determinism
  const hasDevLogin = await page.getByRole('button', { name: 'Dev Login' }).isVisible().catch(() => false);
  if (hasDevLogin) {
    const devBtn = page.getByRole('button', { name: 'Dev Login' });
    await Promise.race([
      devBtn.click(),
      page.waitForLoadState('networkidle'),
    ]);
  } else {
    await page.getByPlaceholder('example@test.com').fill('testuser@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();
  }

  // After sign in, either redirected back or stay. Wait settle then go to profile.
  await page.waitForLoadState('networkidle');
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Logout via navbar if visible
  const logoutBtn = page.getByRole('button', { name: 'Logout' });
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  }
});

test('navigation smoke', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  await page.goto(base + '/');
  await expect(page.getByText('Welcome').first()).toBeVisible();
  await page.getByRole('link', { name: 'Login' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();
});

