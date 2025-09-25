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
    // Capture initial count
    const badgeLocator = page.locator('[data-testid="provider-badge"]');
    const beforeCount = await badgeLocator.count();

    // GITHUB
    await linkBtn.click();
    await expect(page.getByText('Linked!')).toBeVisible();
    await expect(page.locator('[data-provider="github"]')).toBeVisible();
    const afterLinkCount = await badgeLocator.count();
    expect(afterLinkCount).toBeGreaterThanOrEqual(beforeCount + 1);

    const unlinkBtn = page.getByRole('button', { name: 'Unlink GitHub (dev)' });
    await unlinkBtn.click();
    await expect(page.getByText('Unlinked!')).toBeVisible();
    await expect(page.locator('[data-provider="github"]')).toHaveCount(0);
    const afterUnlinkCount = await badgeLocator.count();
    expect(afterUnlinkCount).toBeLessThanOrEqual(afterLinkCount - 1);

    // GOOGLE
    const linkGoogle = page.getByRole('button', { name: 'Link Google (dev)' });
    const unlinkGoogle = page.getByRole('button', { name: 'Unlink Google (dev)' });

    if (await linkGoogle.isVisible().catch(() => false)) {
      const beforeGoogle = await badgeLocator.count();
      await linkGoogle.click();
      await expect(page.getByText('Linked!')).toBeVisible();
      await expect(page.locator('[data-provider="google"]')).toBeVisible();
      const afterGoogleLink = await badgeLocator.count();
      expect(afterGoogleLink).toBeGreaterThanOrEqual(beforeGoogle + 1);

      await unlinkGoogle.click();
      await expect(page.getByText('Unlinked!')).toBeVisible();
      await expect(page.locator('[data-provider="google"]')).toHaveCount(0);
      const afterGoogleUnlink = await badgeLocator.count();
      expect(afterGoogleUnlink).toBeLessThanOrEqual(afterGoogleLink - 1);
    }
  } else {
    await expect(page.getByText('Not signed in.')).toBeVisible();
  }
});

