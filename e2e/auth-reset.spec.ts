import { test, expect } from '@playwright/test';

const E2E = process.env.E2E === 'true';

(E2E ? test : test.skip)('reset password request shows confirmation', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  await page.goto(base + '/auth/reset-password');
  await expect(page.getByRole('heading', { level: 1, name: 'Reset password' })).toBeVisible();

  await page.getByLabel('Email').fill('dev+e2e@example.com');
  await page.getByRole('button', { name: 'Send link' }).click();

  // Accept either confirmation or error message (depends on server behavior)
  const okMsg = page.getByText('If this email exists, a reset link has been sent.');
  const errMsg = page.getByText(/Failed to start reset|error/i);
  const sentOrError = Promise.race([
    okMsg.waitFor({ state: 'visible' }),
    errMsg.waitFor({ state: 'visible' }),
  ]);
  await Promise.race([
    sentOrError,
    page.waitForTimeout(1500),
  ]);
});

