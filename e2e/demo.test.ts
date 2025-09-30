import { test, expect } from '@playwright/test';

test('home page smoke: has Login link', async ({ page }) => {
	const base = process.env.BASE_URL || 'http://localhost:5173';
	await page.goto(base + '/');
	await expect(page.getByRole('link', { name: /Login/i }).first()).toBeVisible();
});
