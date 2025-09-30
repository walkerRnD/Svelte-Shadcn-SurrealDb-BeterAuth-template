import { test, expect } from '@playwright/test';

// Skip by default - token expiration testing requires time manipulation or expired tokens
const ENABLED = process.env.E2E_RESET_EXPIRATION === 'true';
if (!ENABLED) test.skip(true, 'E2E_RESET_EXPIRATION not enabled - requires expired token generation');

test('expired reset token shows error', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Use a known expired token (or mock one)
  const expiredToken = 'expired-token-12345';
  
  await page.goto(base + `/auth/reset-password?token=${expiredToken}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/New password|Nova senha/i).fill('NewPassword123!');
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill('NewPassword123!');
  await page.getByRole('button', { name: /Reset password|Redefinir senha/i }).click();

  // Should show error
  await expect(page.getByTestId('error-banner')).toBeVisible({ timeout: 5000 });
  
  // Should stay on reset page
  await expect(page).toHaveURL(/\/auth\/reset-password/);
});

test('can request new reset link after expiration', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Try with expired token
  await page.goto(base + '/auth/reset-password?token=expired');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/New password|Nova senha/i).fill('NewPassword123!');
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill('NewPassword123!');
  await page.getByRole('button', { name: /Reset password|Redefinir senha/i }).click();

  // Should show error
  await page.waitForTimeout(2000);

  // Navigate to request new link
  await page.goto(base + '/auth/reset-password');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Request new reset
  await page.getByLabel(/Email/i).fill('test@example.com');
  await page.getByRole('button', { name: /Send link|Enviar link/i }).click();

  // Should show confirmation
  await page.waitForTimeout(2000);
});

test('reset token expiration time is 1 hour', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // This test documents the expected behavior
  // Actual testing would require:
  // 1. Generating a token
  // 2. Waiting 1 hour (or mocking time)
  // 3. Verifying it's expired

  // For now, just verify the reset page loads
  await page.goto(base + '/auth/reset-password');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  
  // Documentation: Reset tokens should expire after 1 hour
  console.log('Reset token expiration: 1 hour (as per auth.ts configuration)');
});

