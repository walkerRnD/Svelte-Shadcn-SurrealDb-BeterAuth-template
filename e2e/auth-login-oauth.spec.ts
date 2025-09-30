import { test, expect } from '@playwright/test';

// Skip by default - OAuth testing requires mock OAuth server or real credentials
const ENABLED = process.env.E2E_OAUTH === 'true';
if (!ENABLED) test.skip(true, 'E2E_OAUTH not enabled - requires OAuth configuration');

test('login with GitHub OAuth', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Find GitHub login button
  const githubBtn = page.getByRole('button', { name: /Sign in with GitHub|GitHub/i });
  if (await githubBtn.isVisible().catch(() => false)) {
    // This would trigger OAuth flow
    // In real test, would need to:
    // 1. Mock OAuth provider
    // 2. Or use test credentials
    // 3. Handle OAuth callback
    
    await githubBtn.click();
    
    // Wait for OAuth flow (would need proper handling)
    await page.waitForTimeout(5000);
  }
});

test('login with Google OAuth', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  await page.goto(base + '/auth/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Find Google login button
  const googleBtn = page.getByRole('button', { name: /Sign in with Google|Google/i });
  if (await googleBtn.isVisible().catch(() => false)) {
    // This would trigger OAuth flow
    await googleBtn.click();
    await page.waitForTimeout(5000);
  }
});

