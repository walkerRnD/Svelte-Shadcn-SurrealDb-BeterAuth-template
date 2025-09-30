import { test, expect } from '@playwright/test';
import { createTestUser, logout } from './helpers/auth-helpers';

// Skip by default - "Remember Me" testing requires specific session configuration
const ENABLED = process.env.E2E_REMEMBER_ME === 'true';
if (!ENABLED) test.skip(true, 'E2E_REMEMBER_ME not enabled - requires Remember Me feature');

test('login with remember me persists session', async ({ page, context }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create user and logout
  const { email, password } = await createTestUser(page);
  await logout(page);

  // Login with remember me
  await page.goto(base + '/auth/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/Password|Senha/i).fill(password);
  
  // Check remember me checkbox if exists
  const rememberCheckbox = page.getByRole('checkbox', { name: /Remember me|Lembrar/i });
  if (await rememberCheckbox.isVisible().catch(() => false)) {
    await rememberCheckbox.check();
  }

  await page.locator('form').getByRole('button', { name: /Sign in|Entrar|Login/i }).first().click();

  // Wait for session
  await expect.poll(async () => {
    const status = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/session', { credentials: 'include' });
        if (!r.ok) return 'no';
        const data = await r.json();
        return data?.user?.id ? 'ok' : 'no';
      } catch {
        return 'no';
      }
    });
    return status;
  }, { timeout: 15000 }).toBe('ok');

  // Close and reopen browser context
  await page.close();
  const newPage = await context.newPage();
  
  // Should still be logged in
  await newPage.goto(base + '/user/profile');
  await expect(newPage.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Cleanup
  await newPage.goto(base + '/user/account/delete-account');
  const deleteBtn = newPage.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
  await deleteBtn.click();
  const confirmBtn = newPage.getByRole('button', { name: /Confirm|Confirmar/i });
  await confirmBtn.click();
  await expect(newPage).toHaveURL(/\/$|\/auth\/login/, { timeout: 10000 });
});

test('login without remember me expires after browser close', async ({ browser }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create new context (simulates new browser session)
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  
  // Create user and logout
  const { email, password } = await createTestUser(page1);
  await logout(page1);

  // Login WITHOUT remember me
  await page1.goto(base + '/auth/login');
  await page1.getByLabel(/Email/i).fill(email);
  await page1.getByLabel(/Password|Senha/i).fill(password);
  
  // Ensure remember me is NOT checked
  const rememberCheckbox = page1.getByRole('checkbox', { name: /Remember me|Lembrar/i });
  if (await rememberCheckbox.isVisible().catch(() => false)) {
    await rememberCheckbox.uncheck();
  }

  await page1.locator('form').getByRole('button', { name: /Sign in|Entrar|Login/i }).first().click();

  await expect.poll(async () => {
    const status = await page1.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/session', { credentials: 'include' });
        if (!r.ok) return 'no';
        const data = await r.json();
        return data?.user?.id ? 'ok' : 'no';
      } catch {
        return 'no';
      }
    });
    return status;
  }, { timeout: 15000 }).toBe('ok');

  // Close context (simulates browser close)
  await context1.close();

  // Open new context (simulates reopening browser)
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  
  // Should NOT be logged in (session expired)
  await page2.goto(base + '/user/profile');
  await expect(page2).toHaveURL(/\/auth\/login/, { timeout: 5000 });

  await context2.close();
});

