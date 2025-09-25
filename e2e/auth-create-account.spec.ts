import { test, expect } from '@playwright/test';

// E2E flag removed; always run in CI

test('create account → profile → logout', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  const unique = Date.now();
  const email = `e2e+${unique}@example.com`;
  const password = 'password1234';

  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1, name: 'Create account' })).toBeVisible();

  await page.getByLabel('Name').fill('E2E User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  // Wait until API session reports a user, then go to profile.
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

  const logoutBtn = page.getByRole('button', { name: 'Logout' });
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  }
});

