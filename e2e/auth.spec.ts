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

  // After sign in, wait until API session reports a user, then go to profile.
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

