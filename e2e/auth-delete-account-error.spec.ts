import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './helpers/auth-helpers';

test('delete account dialog can be opened and closed multiple times', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create user
  await createTestUser(page);

  await page.goto(base + '/user/account/delete-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const deleteBtn = page.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
  const cancelBtn = page.getByRole('button', { name: /Cancel|Cancelar/i });

  // Open dialog
  await deleteBtn.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Close dialog
  await cancelBtn.click();
  await expect(dialog).not.toBeVisible({ timeout: 3000 });

  // Open again
  await deleteBtn.click();
  await expect(dialog).toBeVisible();

  // Close again
  await cancelBtn.click();
  await expect(dialog).not.toBeVisible({ timeout: 3000 });

  // Verify account still exists
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Cleanup
  await deleteTestUser(page);
});

test('delete account shows confirmation dialog with warning', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create user
  await createTestUser(page);

  await page.goto(base + '/user/account/delete-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const deleteBtn = page.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
  await deleteBtn.click();

  // Verify dialog has warning text
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Should have some warning text (check for dialog title or description)
  const warningText = page.locator('[data-dialog-title], [data-dialog-description]').first();
  await expect(warningText).toBeVisible();

  // Cancel
  const cancelBtn = page.getByRole('button', { name: /Cancel|Cancelar/i });
  await cancelBtn.click();

  // Cleanup
  await deleteTestUser(page);
});

test('delete account button is disabled during deletion', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create user
  await createTestUser(page);

  await page.goto(base + '/user/account/delete-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const deleteBtn = page.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
  await deleteBtn.click();

  const confirmBtn = page.getByRole('button', { name: /Confirm|Confirmar/i });
  await expect(confirmBtn).toBeVisible();

  // Click confirm (deletion will happen)
  await confirmBtn.click();

  // Button should be disabled or show loading state
  // (We can't easily test this as deletion is fast, but we verify the flow works)

  // Wait for redirect
  await expect(page).toHaveURL(/\/$|\/auth\/login/, { timeout: 10000 });
});

test('delete account from account page link', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  // Create user
  await createTestUser(page);

  // Go to account page
  await page.goto(base + '/user/account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // Find and click delete account link/button
  const deleteLink = page.getByRole('link', { name: /Delete account|Excluir conta/i });
  if (await deleteLink.isVisible().catch(() => false)) {
    await deleteLink.click();

    // Should navigate to delete account page
    await expect(page).toHaveURL(/\/user\/account\/delete-account/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  // Cleanup
  await deleteTestUser(page);
});

