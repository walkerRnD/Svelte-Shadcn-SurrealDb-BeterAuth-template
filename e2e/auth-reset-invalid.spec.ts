import { test, expect } from '@playwright/test';

// Invalid token should show error and stay on page

test('reset password with invalid token shows error and does not redirect', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  await page.goto(base + '/auth/reset-password?token=invalid');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/New password|Nova senha/i).fill('password5678');
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill('password5678');
  await page.getByRole('button', { name: /Reset password|Redefinir senha/i }).click();

  // Expect error banner to be visible and URL unchanged
  await expect(page.getByTestId('error-banner')).toBeVisible({ timeout: 5000 });
  await expect(page).toHaveURL(/\/auth\/reset-password\?token=invalid/);
});

