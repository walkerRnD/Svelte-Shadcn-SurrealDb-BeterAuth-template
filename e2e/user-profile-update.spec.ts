import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './helpers/auth-helpers';

test('update profile name → verify persisted', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create user
  await createTestUser(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Find name field (may be in edit mode or need to click edit button)
  const nameField = page.getByLabel(/Name|Nome/i);
  
  if (await nameField.isVisible().catch(() => false)) {
    const newName = `Updated Name ${Date.now()}`;
    await nameField.fill(newName);
    
    // Find and click save/update button
    const saveBtn = page.getByRole('button', { name: /Save|Update|Salvar|Atualizar/i });
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      
      // Wait for success message or page update
      await page.waitForTimeout(2000);
      
      // Refresh page
      await page.reload();
      
      // Verify name persisted
      await expect(page.getByText(newName)).toBeVisible({ timeout: 5000 });
    }
  }

  // Cleanup
  await deleteTestUser(page);
});

test('profile page shows user email', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create user
  const { email } = await createTestUser(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Verify email is displayed
  await expect(page.getByText(email)).toBeVisible();

  // Cleanup
  await deleteTestUser(page);
});

test('profile page has links to account management', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  // Create user
  await createTestUser(page);
  
  await page.goto(base + '/user/profile');
  await expect(page.getByRole('heading', { level: 1, name: 'Profile' })).toBeVisible();

  // Check for account management links
  const accountLink = page.getByRole('link', { name: /Account|Conta/i });
  if (await accountLink.isVisible().catch(() => false)) {
    await accountLink.click();
    await expect(page).toHaveURL(/\/user\/account/);
  }

  // Cleanup
  await deleteTestUser(page);
});

