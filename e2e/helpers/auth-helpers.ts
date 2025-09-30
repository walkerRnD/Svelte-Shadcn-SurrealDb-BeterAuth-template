import { type Page, expect } from '@playwright/test';

/**
 * Generate a unique email for testing
 */
export function generateUniqueEmail(prefix = 'e2e'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}+${timestamp}${random}@example.com`;
}

/**
 * Create a test user account
 */
export async function createTestUser(
  page: Page,
  options: {
    name?: string;
    email?: string;
    password?: string;
  } = {}
): Promise<{ email: string; password: string; name: string }> {
  const base = process.env.BASE_URL || 'http://localhost:5173';
  const email = options.email || generateUniqueEmail();
  const password = options.password || 'TestPassword123!';
  const name = options.name || 'E2E Test User';

  await page.goto(base + '/auth/create-account');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

  // Fill form fields
  await page.getByLabel(/Name|Nome/i).fill(name);
  await page.getByLabel(/Email/i).fill(email);

  // Find password input fields (not buttons)
  const passwordInputs = page.locator('input[type="password"]');
  const passwordCount = await passwordInputs.count();

  if (passwordCount >= 2) {
    // Fill first password field (main password)
    await passwordInputs.nth(0).fill(password);
    // Fill second password field (confirm password)
    await passwordInputs.nth(1).fill(password);
  } else if (passwordCount === 1) {
    // Only one password field
    await passwordInputs.first().fill(password);
  } else {
    throw new Error('No password fields found on create account page');
  }

  // Accept terms checkbox (required)
  const termsCheckbox = page.locator('input[type="checkbox"]').first();
  if (await termsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await termsCheckbox.check();
  }

  // Click create account button
  await page.getByRole('button', { name: /Create account|Criar conta/i }).click();

  // Wait for session to be established (more reliable than URL check)
  try {
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
  } catch (error) {
    // If session check fails, check if we're on profile page
    const currentUrl = page.url();
    if (!currentUrl.includes('/user/profile')) {
      throw new Error(`Failed to create user. Current URL: ${currentUrl}`);
    }
  }

  return { email, password, name };
}

/**
 * Login with email and password
 */
export async function loginTestUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  await page.goto(base + '/auth/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

  // Fill login form using IDs
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  // Click submit button
  await page.locator('button[type="submit"]').click();

  // Wait for navigation or session establishment
  try {
    // Wait for either redirect or session
    await Promise.race([
      page.waitForURL(/\/user\/profile/, { timeout: 10000 }),
      expect.poll(async () => {
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
      }, { timeout: 10000, intervals: [500] }).toBe('ok')
    ]);
  } catch (error) {
    // Check if we're logged in anyway
    const currentUrl = page.url();
    if (!currentUrl.includes('/user/')) {
      throw new Error(`Login failed. Current URL: ${currentUrl}`);
    }
  }
}

/**
 * Login using Dev Login button (for tests that support it)
 */
export async function loginWithDevLogin(page: Page): Promise<void> {
  const base = process.env.BASE_URL || 'http://localhost:5173';

  await page.goto(base + '/auth/login');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const devBtn = page.getByRole('button', { name: 'Dev Login' });
  if (!(await devBtn.isVisible().catch(() => false))) {
    throw new Error('Dev Login not available in this build');
  }

  await Promise.race([
    devBtn.click(),
    page.waitForLoadState('networkidle'),
  ]);

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
}

/**
 * Logout from the application
 */
export async function logout(page: Page): Promise<void> {
  try {
    // First, try to click logout button if visible
    const logoutBtn = page.getByRole('button', { name: /Logout/i });
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    }

    // Also clear session via API to ensure logout
    await page.evaluate(async () => {
      try {
        await fetch('/api/auth/sign-out', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        console.log('API logout error:', e);
      }
    });

    // Clear all cookies and storage to ensure clean state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Wait a bit for everything to clear
    await page.waitForTimeout(1000);

    // Verify logged out by checking session
    const isStillLoggedIn = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/session', { credentials: 'include' });
        if (!r.ok) return false;
        const data = await r.json();
        return !!data?.user?.id;
      } catch {
        return false;
      }
    });

    if (isStillLoggedIn) {
      console.warn('⚠️ User still appears to be logged in after logout attempt');
    }
  } catch (error) {
    console.log('Logout error:', error);
  }
}

/**
 * Delete a test user account (cleanup)
 */
export async function deleteTestUser(page: Page): Promise<void> {
  try {
    const base = process.env.BASE_URL || 'http://localhost:5173';

    // Check if we're logged in first
    const isLoggedIn = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/session', { credentials: 'include' });
        if (!r.ok) return false;
        const data = await r.json();
        return !!data?.user?.id;
      } catch {
        return false;
      }
    });

    if (!isLoggedIn) {
      console.log('User not logged in, skipping delete');
      return;
    }

    await page.goto(base + '/user/account/delete-account');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

    const deleteBtn = page.getByRole('button', { name: /Delete my account|Excluir minha conta/i });
    await deleteBtn.click();

    // Wait for dialog
    const confirmBtn = page.getByRole('button', { name: /Confirm|Confirmar/i });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

    // Wait for redirect to home
    await expect(page).toHaveURL(/\/$|\/auth\/login/, { timeout: 10000 });
  } catch (error) {
    console.log('Error deleting test user:', error);
    // Don't throw - cleanup should not fail tests
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    const status = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/session', { credentials: 'include' });
        if (!r.ok) return false;
        const data = await r.json();
        return !!data?.user?.id;
      } catch {
        return false;
      }
    });
    return status;
  } catch {
    return false;
  }
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: RegExp, timeout = 10000): Promise<void> {
  try {
    await page.waitForURL(urlPattern, { timeout });
  } catch {
    // Fallback: check if we're on the expected URL
    await expect(page).toHaveURL(urlPattern, { timeout: 5000 });
  }
}

/**
 * Extract reset token from URL (for testing password reset)
 */
export function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('token');
  } catch {
    return null;
  }
}

/**
 * Fill password fields with visibility toggle
 */
export async function fillPasswordField(
  page: Page,
  label: string | RegExp,
  password: string
): Promise<void> {
  const field = page.getByLabel(label);
  await field.fill(password);
}

/**
 * Verify error banner is visible
 */
export async function expectErrorBanner(page: Page, timeout = 5000): Promise<void> {
  const banner = page.getByTestId('error-banner');
  await expect(banner).toBeVisible({ timeout });
}

/**
 * Verify success message is visible
 */
export async function expectSuccessMessage(page: Page, timeout = 5000): Promise<void> {
  const message = page.getByRole('status');
  await expect(message).toBeVisible({ timeout });
}

