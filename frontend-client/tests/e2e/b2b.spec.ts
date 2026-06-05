import { test, expect } from '@playwright/test';

test.describe('B2B', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('puede ver directorio B2B', async ({ page }) => {
    await page.goto('/dashboard/b2b');

    await expect(page.locator('text=Perfiles Empresariales')).toBeVisible();
    await expect(page.locator('.b2b-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('puede buscar perfiles B2B', async ({ page }) => {
    await page.goto('/dashboard/b2b');

    await page.fill('input[placeholder*="Buscar"]', 'manufacturer');
    await page.press('input[placeholder*="Buscar"]', 'Enter');

    await expect(page.locator('.b2b-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('puede ver detalles de perfil B2B', async ({ page }) => {
    await page.goto('/dashboard/b2b');

    await page.click('.b2b-card >> text=Ver perfil');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Información de Contacto')).toBeVisible();
  });
});