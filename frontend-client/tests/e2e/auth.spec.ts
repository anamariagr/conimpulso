import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('usuario puede registrarse', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'Test User ' + Date.now());
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="password_confirmation"]', 'password123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard|onboarding/);
  });

  test('usuario puede hacer login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);
  });

  test('login falla con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid')).toBeVisible();
  });
});