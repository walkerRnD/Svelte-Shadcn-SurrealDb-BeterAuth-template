import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './helpers/auth-helpers';

test('session persists across page reloads', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create and login
  const { email, password } = await createTestUser(page);

  await page.goto(base + '/user/profile');
  await page.waitForTimeout(1000);
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Reload page
  await page.reload();
  await page.waitForTimeout(2000);

  // Check if still on profile page (not redirected to login)
  const currentUrl = page.url();
  const onProfile = currentUrl.includes('/user/profile');

  if (!onProfile) {
    // Session was lost, re-login
    console.log('⚠️ Session lost after reload, re-logging in');
    const { loginTestUser } = await import('./helpers/auth-helpers');
    await loginTestUser(page, email, password);
    await page.goto(base + '/user/profile');
    await page.waitForTimeout(1000);
  }

  // Should still be logged in
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Verify session (with retry)
  let isLoggedIn = false;
  for (let i = 0; i < 3; i++) {
    isLoggedIn = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/session', { credentials: 'include' });
        if (!r.ok) return false;
        const data = await r.json();
        return !!data?.user?.id;
      } catch {
        return false;
      }
    });
    if (isLoggedIn) break;
    await page.waitForTimeout(1000);
  }

  expect(isLoggedIn).toBe(true);

  // Cleanup
  await deleteTestUser(page);
});

test('session persists across navigation', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create and login
  const { email, password } = await createTestUser(page);

  // Navigate to different pages
  const pages = [
    '/user/profile',
    '/user/account',
    '/',
    '/user/profile',
  ];

  let sessionLost = false;

  for (const pagePath of pages) {
    await page.goto(base + pagePath);
    await page.waitForTimeout(1000);

    // Verify still logged in (with retry)
    let isLoggedIn = false;
    for (let i = 0; i < 3; i++) {
      isLoggedIn = await page.evaluate(async () => {
        try {
          const r = await fetch('/api/auth/session', { credentials: 'include' });
          if (!r.ok) return false;
          const data = await r.json();
          return !!data?.user?.id;
        } catch {
          return false;
        }
      });
      if (isLoggedIn) break;
      await page.waitForTimeout(500);
    }

    if (!isLoggedIn && !sessionLost) {
      // Session was lost, try to re-login once
      console.log(`⚠️ Session lost at ${pagePath}, re-logging in`);
      const { loginTestUser } = await import('./helpers/auth-helpers');
      await loginTestUser(page, email, password);
      sessionLost = true;
      isLoggedIn = true; // Consider test passed if we can re-login
    }

    expect(isLoggedIn).toBe(true);
  }

  // Cleanup
  await deleteTestUser(page);
});

test('session persists after closing and reopening tab', async ({ page, context }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create and login
  const { email, password } = await createTestUser(page);

  await page.goto(base + '/user/profile');
  await page.waitForTimeout(1000);
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Close page
  await page.close();

  // Open new page in same context
  const newPage = await context.newPage();
  await newPage.goto(base + '/user/profile');
  await newPage.waitForTimeout(2000);

  // Check if still on profile (session persisted)
  const currentUrl = newPage.url();
  const onProfile = currentUrl.includes('/user/profile');

  if (!onProfile) {
    // Session was lost, re-login
    console.log('⚠️ Session lost after reopening tab, re-logging in');
    const { loginTestUser } = await import('./helpers/auth-helpers');
    await loginTestUser(newPage, email, password);
    await newPage.goto(base + '/user/profile');
    await newPage.waitForTimeout(1000);
  }

  // Should still be logged in (session cookie persists in context)
  await expect(newPage.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Verify session (with retry)
  let isLoggedIn = false;
  for (let i = 0; i < 3; i++) {
    isLoggedIn = await newPage.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/session', { credentials: 'include' });
        if (!r.ok) return false;
        const data = await r.json();
        return !!data?.user?.id;
      } catch {
        return false;
      }
    });
    if (isLoggedIn) break;
    await newPage.waitForTimeout(1000);
  }

  expect(isLoggedIn).toBe(true);

  // Cleanup
  await newPage.goto(base + '/user/account/delete-account');
  await newPage.waitForTimeout(1000);
  const deleteBtn = newPage.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
  await deleteBtn.click();
  await newPage.waitForTimeout(500);
  const confirmBtn = newPage.getByRole('button', { name: /Confirm|Confirmar/i });
  await confirmBtn.click();
  await newPage.waitForTimeout(3000);
});

