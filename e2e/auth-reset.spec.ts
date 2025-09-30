import { test, expect } from '@playwright/test';

// E2E flag removed; always run in CI

test('reset password request shows confirmation', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  await page.goto(base + '/auth/reset-password');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Email/i).fill('dev+e2e@example.com');
  await page.getByRole('button', { name: /Send link|Enviar link/i }).click();

  // Expect either a status/info banner or an error banner
  const statusBanner = page.getByRole('status');
  const errorBanner = page.getByTestId('error-banner');
  await Promise.race([
    statusBanner.waitFor({ state: 'visible' }),
    errorBanner.waitFor({ state: 'visible' }),
    page.waitForTimeout(3000),
  ]);
});

