import { test, expect } from '@playwright/test';
import { createTestUser, loginTestUser } from './helpers/auth-helpers';

test('delete account → redirect to home → cannot login', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create a test user
  const { email, password } = await createTestUser(page);

  // Navigate to delete account page
  await page.goto(base + '/user/account/delete-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Click delete button
  const deleteBtn = page.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
  await deleteBtn.click();

  // Verify dialog appears
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/Are you sure|Tem certeza/i)).toBeVisible();

  // Test cancel button
  const cancelBtn = page.getByRole('button', { name: /Cancel|Cancelar/i });
  await cancelBtn.click();

  // Dialog should close
  await expect(dialog).not.toBeVisible({ timeout: 3000 });

  // Click delete again
  await deleteBtn.click();
  await expect(dialog).toBeVisible();

  // Confirm deletion
  const confirmBtn = page.getByRole('button', { name: /Confirm|Confirmar/i });
  await confirmBtn.click();

  // Wait for deletion to complete
  await page.waitForTimeout(3000);

  // Check if we're logged out by trying to access a protected page
  await page.goto(base + '/user/profile');

  // Should redirect to login or show login form
  await page.waitForTimeout(2000);
  const currentUrl = page.url();
  const isOnLogin = currentUrl.includes('/auth/login');
  const hasLoginLink = await page.getByRole('link', { name: /Login/i }).first().isVisible().catch(() => false);

  // Either redirected to login or can see login link
  expect(isOnLogin || hasLoginLink).toBe(true);

  // Try to login with deleted account (should fail)
  if (!isOnLogin) {
    await page.goto(base + '/auth/login');
  }

  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();

  // Should stay on login page (account deleted)
  await page.waitForTimeout(3000);
  const finalUrl = page.url();
  expect(finalUrl).toContain('/auth/login');
});

test('delete account cancel button works', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create a test user
  const { email, password } = await createTestUser(page);

  await page.goto(base + '/user/account/delete-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Click delete button
  const deleteBtn = page.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
  await deleteBtn.click();

  // Click cancel
  const cancelBtn = page.getByRole('button', { name: /Cancel|Cancelar/i });
  await cancelBtn.click();

  // Should still be on delete page
  await expect(page).toHaveURL(/\/user\/account\/delete-account/);

  // Verify can still access profile (account not deleted)
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Cleanup - actually delete now
  await page.goto(base + '/user/account/delete-account');
  await deleteBtn.click();
  const confirmBtn = page.getByRole('button', { name: /Confirm|Confirmar/i });
  await confirmBtn.click();
  await expect(page).toHaveURL(/\/$|\/auth\/login/, { timeout: 10000 });
});

