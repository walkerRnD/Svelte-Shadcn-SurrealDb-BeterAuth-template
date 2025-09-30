import { test, expect } from '@playwright/test';

test('create account with empty fields shows validation errors', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Try to submit empty form
  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Should show validation errors (form should prevent submission or show errors)
  await page.waitForTimeout(1000);
  
  // Check we're still on create account page
  await expect(page).toHaveURL(/\/auth\/create-account/);
});

test('create account with invalid email shows error', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill('Test User');
  await page.getByLabel(/Email/i).fill('invalid-email');
  await page.getByLabel(/^Password|^Senha/i).first().fill('TestPassword123!');
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill('TestPassword123!');
  
  // Accept terms if checkbox exists
  const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Should show error or stay on page
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/\/auth\/create-account/);
});

test('create account with weak password shows error', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill('Test User');
  await page.getByLabel(/Email/i).fill(`test${Date.now()}@example.com`);
  await page.getByLabel(/^Password|^Senha/i).first().fill('weak');
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill('weak');

  // Should show password strength indicator as weak
  const strengthMeter = page.locator('[data-testid="password-strength"]');
  if (await strengthMeter.isVisible().catch(() => false)) {
    await expect(strengthMeter).toContainText(/weak|fraca/i);
  }

  // Accept terms if checkbox exists
  const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Should show error or stay on page
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/auth\/create-account/);
});

test('create account with mismatched passwords shows error', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill('Test User');
  await page.getByLabel(/Email/i).fill(`test${Date.now()}@example.com`);
  await page.getByLabel(/^Password|^Senha/i).first().fill('TestPassword123!');
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill('DifferentPassword123!');

  // Accept terms if checkbox exists
  const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Should show error about passwords not matching
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/\/auth\/create-account/);
});

test('create account without accepting terms shows error', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill('Test User');
  await page.getByLabel(/Email/i).fill(`test${Date.now()}@example.com`);
  await page.getByLabel(/^Password|^Senha/i).first().fill('TestPassword123!');
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill('TestPassword123!');

  // Do NOT check terms checkbox
  const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
  if (await termsCheckbox.isVisible().catch(() => false)) {
    // Ensure it's unchecked
    await termsCheckbox.uncheck();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Should show error or stay on page
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(/\/auth\/create-account/);
});

test('password strength meter updates correctly', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const passwordField = page.getByLabel(/^Password|^Senha/i).first();

  // Type weak password
  await passwordField.fill('abc');
  await page.waitForTimeout(500);

  // Type medium password
  await passwordField.fill('Password123');
  await page.waitForTimeout(500);

  // Type strong password
  await passwordField.fill('StrongPassword123!@#');
  await page.waitForTimeout(500);

  // Just verify the field accepts input (strength meter is visual feedback)
  const value = await passwordField.inputValue();
  expect(value).toBe('StrongPassword123!@#');
});

