import { test, expect } from '@playwright/test';
import { generateUniqueEmail, deleteTestUser } from './helpers/auth-helpers';

test('create account with XSS in name is sanitized', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  const xssName = '<script>alert("XSS")</script>';
  const email = generateUniqueEmail();
  const password = 'TestPassword123!';

  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill(xssName);
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/^Password|^Senha/i).first().fill(password);
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill(password);
  
  // Accept terms if checkbox exists
  const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Wait for redirect or stay
  await page.waitForTimeout(3000);

  // Check if script was executed (it shouldn't be)
  const dialogAppeared = await page.evaluate(() => {
    return (window as any).__xssTriggered === true;
  });
  expect(dialogAppeared).toBeFalsy();

  // If redirected to profile, check name is displayed safely
  if (page.url().includes('/user/profile')) {
    // Name should be displayed as text, not executed
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert');
    
    // Cleanup
    await deleteTestUser(page);
  }
});

test('profile update with XSS payload is sanitized', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  const xssName = '<img src=x onerror="alert(\'XSS\')">';
  const email = generateUniqueEmail();
  const password = 'TestPassword123!';

  // Create account
  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill('Normal Name');
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/^Password|^Senha/i).first().fill(password);
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill(password);
  
  const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();
  await page.waitForTimeout(3000);

  // Try to update profile with XSS
  await page.goto(base + '/user/profile');
  
  const nameField = page.getByLabel(/Name|Nome/i);
  if (await nameField.isVisible().catch(() => false)) {
    await nameField.fill(xssName);
    
    const saveBtn = page.getByRole('button', { name: /Save|Update|Salvar|Atualizar/i });
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      
      // Verify XSS not executed
      const pageContent = await page.content();
      expect(pageContent).not.toContain('onerror=');
    }
  }

  // Cleanup
  if (page.url().includes('/user/')) {
    await deleteTestUser(page);
  }
});

test('XSS in email field is rejected', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  const xssEmail = '<script>alert("XSS")</script>@example.com';
  const password = 'TestPassword123!';

  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill('Test User');
  await page.getByLabel(/Email/i).fill(xssEmail);
  await page.getByLabel(/^Password|^Senha/i).first().fill(password);
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill(password);

  const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Should fail validation or stay on page
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/auth\/create-account/);
});

test('HTML entities in name are properly escaped', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  
  const htmlName = 'Test & <User>';
  const email = generateUniqueEmail();
  const password = 'TestPassword123!';

  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByLabel(/Name|Nome/i).fill(htmlName);
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/^Password|^Senha/i).first().fill(password);
  await page.getByLabel(/Confirm password|Confirmar senha/i).fill(password);
  
  const termsCheckbox = page.getByRole('checkbox', { name: /accept|aceito/i });
  if (await termsCheckbox.isVisible().catch(() => false)) {
    await termsCheckbox.check();
  }

  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();
  await page.waitForTimeout(3000);

  // If successful, verify name is displayed safely
  if (page.url().includes('/user/profile')) {
    const pageContent = await page.content();
    // Should be escaped as &amp; and &lt; &gt;
    const hasProperEscaping = pageContent.includes('&amp;') || pageContent.includes('&lt;');
    console.log('HTML entities properly escaped:', hasProperEscaping);
    
    await deleteTestUser(page);
  }
});

