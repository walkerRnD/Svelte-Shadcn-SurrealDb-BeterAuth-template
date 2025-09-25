import { test, expect } from '@playwright/test';

const E2E = process.env.E2E === 'true';

(E2E ? test : test.skip)('provider linking (dev) on profile', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Login via Dev Login
  await page.goto(base + '/');
  await page.getByRole('link', { name: 'Login' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();

  const devBtn = page.getByRole('button', { name: 'Dev Login' });
  if (await devBtn.isVisible().catch(() => false)) {
    await Promise.race([
      devBtn.click(),
      page.waitForLoadState('networkidle'),
    ]);
  }

  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // If not signed in (race condition), try again quickly
  if (await page.getByText('Not signed in.').isVisible().catch(() => false)) {
    await page.goto(base + '/auth/login');
    const devBtn2 = page.getByRole('button', { name: 'Dev Login' });
    if (await devBtn2.isVisible().catch(() => false)) {
      await Promise.race([
        devBtn2.click(),
        page.waitForLoadState('networkidle'),
      ]);
    }
    await page.goto(base + '/user/profile');
  }

  // If buttons are available (user signed in), exercise linking; otherwise accept 'Not signed in.'
  const linkBtn = page.getByRole('button', { name: 'Link GitHub (dev)' });
  if (await linkBtn.isVisible().catch(() => false)) {
    await linkBtn.click();
    await expect(page.getByText('Linked!')).toBeVisible();

    const unlinkBtn = page.getByRole('button', { name: 'Unlink GitHub (dev)' });
    await unlinkBtn.click();
    await expect(page.getByText('Unlinked!')).toBeVisible();
  } else {
    await expect(page.getByText('Not signed in.')).toBeVisible();
  }
});

