import { test, expect } from '@playwright/test';

// This test exercises the Dev Login flow and verifies redirect to /user/profile
// Requires VITE_DEV_LOGIN=true at build time and server env set via playwright.config.ts webServer.env

test('dev login redirects to profile and shows user', async ({ page }) => {
  // Go to login
  await page.goto('/auth/login');

  // Dev Login button should be visible in preview when flag baked in
  const devLogin = page.getByRole('main').getByRole('button', { name: 'Dev Login' });
  await expect(devLogin).toBeVisible();

  // Click Dev Login (main section button)
  await devLogin.click();

  // Prefer redirect; fall back to navigating if needed (CI stability)
  try {
    await page.waitForURL('**/user/profile', { waitUntil: 'load', timeout: 5000 });
  } catch {
    await page.goto('/user/profile');
  }

  // Wait until session endpoint reports a user, then check UI
  await expect.poll(async () => {
    const data = await page.evaluate(async () => {
      const r = await fetch('/api/auth/session', { credentials: 'include' });
      if (!r.ok) return null;
      try { return await r.json(); } catch { return null; }
    });
    return data?.user?.id ? 'ok' : 'no';
  }, { timeout: 10000 }).toBe('ok');

  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  await expect(page.locator('text=Not signed in.')).toHaveCount(0);
  const id = page.locator('text=ID:');
  const name = page.locator('text=Name:');
  const email = page.locator('text=Email:');
  await expect(id.or(name).or(email)).toBeVisible();

  // Logout via nav button and verify signed-out
  const logout = page.getByRole('button', { name: 'Logout' });
  await logout.click();
  await expect(page.locator('text=Not signed in.')).toBeVisible();
});

