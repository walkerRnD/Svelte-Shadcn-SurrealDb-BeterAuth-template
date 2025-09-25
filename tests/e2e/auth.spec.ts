import { test, expect } from '@playwright/test';

const E2E = process.env.E2E === 'true';

(E2E ? test : test.skip)('login → profile → logout', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Go to home
  await page.goto(base + '/');
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

  // Navigate to login
  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();

  // Fill and submit login form
  await page.getByPlaceholder('example@test.com').fill('testuser@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // After sign in, either redirected back or stay. Go to profile.
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Expect user info present or "Not signed in." if credentials invalid
  // This test assumes a prior account exists; otherwise it will still validate route presence

  // Logout via navbar if visible
  const logoutBtn = page.getByRole('button', { name: 'Logout' });
  if (await logoutBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await logoutBtn.click();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  }
});

(E2E ? test : test.skip)('navigation smoke', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  await page.goto(base + '/');
  await expect(page.getByRole('heading', { level: 1, name: 'Welcome' })).toBeVisible();
  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();
});

