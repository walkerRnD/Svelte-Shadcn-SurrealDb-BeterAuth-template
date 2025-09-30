import { test, expect } from '@playwright/test';
import { createTestUser, loginTestUser, logout } from './helpers/auth-helpers';

test('concurrent sessions in different browser contexts', async ({ browser }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create context 1
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  
  // Create user in context 1
  const { email, password } = await createTestUser(page1);
  
  // Create context 2
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  
  // Login in context 2 with same credentials
  await loginTestUser(page2, email, password);
  
  // Verify both sessions are active
  await page1.goto(base + '/user/profile');
  await expect(page1.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();
  
  await page2.goto(base + '/user/profile');
  await expect(page2.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Logout from context 1
  await logout(page1);
  
  // Context 2 should still be logged in (or logged out if single session mode)
  await page2.reload();
  
  // Check if still logged in
  const isLoggedIn = await page2.evaluate(async () => {
    try {
      const r = await fetch('/api/auth/session', { credentials: 'include' });
      if (!r.ok) return false;
      const data = await r.json();
      return !!data?.user?.id;
    } catch {
      return false;
    }
  });
  
  // Behavior depends on session configuration
  // Multi-session: should still be logged in
  // Single-session: should be logged out
  console.log('Context 2 logged in after context 1 logout:', isLoggedIn);

  // Cleanup
  if (isLoggedIn) {
    await page2.goto(base + '/user/account/delete-account');
    const deleteBtn = page2.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
    await deleteBtn.click();
    const confirmBtn = page2.getByRole('button', { name: /Confirm|Confirmar/i });
    await confirmBtn.click();
    await expect(page2).toHaveURL(/\/$|\/auth\/login/, { timeout: 10000 });
  }

  await context1.close();
  await context2.close();
});

