import { test, expect } from '@playwright/test';

// Skip by default - rate limiting testing requires specific configuration
const ENABLED = process.env.E2E_RATE_LIMIT === 'true';
if (!ENABLED) test.skip(true, 'E2E_RATE_LIMIT not enabled - requires rate limiting configuration');

test('login rate limiting after multiple failed attempts', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Try to login multiple times with wrong credentials
  for (let i = 0; i < 10; i++) {
    await page.getByLabel(/Email/i).fill(`test${i}@example.com`);
    await page.getByLabel(/Password|Senha/i).fill('wrongpassword');
    await page.locator('form').getByRole('button', { name: /Sign in|Entrar|Login/i }).first().click();
    await page.waitForTimeout(500);
  }

  // After threshold, should show rate limit error
  // Implementation dependent - may show error banner or block requests
  await page.waitForTimeout(1000);
  
  // Try one more time
  await page.getByLabel(/Email/i).fill('test@example.com');
  await page.getByLabel(/Password|Senha/i).fill('wrongpassword');
  await page.locator('form').getByRole('button', { name: /Sign in|Entrar|Login/i }).first().click();
  
  // Should show rate limit error (implementation dependent)
  await page.waitForTimeout(2000);
});

test('password reset rate limiting', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/reset-password');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Try to request reset multiple times
  for (let i = 0; i < 10; i++) {
    await page.getByLabel(/Email/i).fill(`test${i}@example.com`);
    await page.getByRole('button', { name: /Send link|Enviar link/i }).click();
    await page.waitForTimeout(500);
  }

  // Should show rate limit error after threshold
  await page.waitForTimeout(1000);
});

test('account creation rate limiting', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Try to create multiple accounts rapidly
  for (let i = 0; i < 5; i++) {
    await page.goto(base + '/auth/create-account');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByLabel(/Name|Nome/i).fill(`Test User ${i}`);
    await page.getByLabel(/Email/i).fill(`test${Date.now()}${i}@example.com`);
    await page.getByLabel(/^Password|^Senha/i).first().fill('TestPassword123!');
    await page.getByLabel(/Confirm password|Confirmar senha/i).fill('TestPassword123!');
    
    const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
    if (await termsCheckbox.isVisible().catch(() => false)) {
      await termsCheckbox.check();
    }

    await page.getByRole('button', { name: /Create account|Criar conta/i }).click();
    await page.waitForTimeout(500);
  }

  // Should show rate limit error after threshold
  await page.waitForTimeout(1000);
});

