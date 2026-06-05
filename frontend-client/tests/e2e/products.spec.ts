import { test, expect } from '@playwright/test';

test.describe('Productos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('puede ver lista de productos', async ({ page }) => {
    await page.goto('/products');

    await expect(page.locator('text=Productos')).toBeVisible();
    await expect(page.locator('text=Categorías')).toBeVisible();
  });

  test('puede filtrar productos por categoría', async ({ page }) => {
    await page.goto('/products');

    await page.click('text=Electrónica');
    await page.waitForTimeout(500);

    await expect(page.locator('.product-card').first()).toBeVisible();
  });

  test('puede buscar productos', async ({ page }) => {
    await page.goto('/products');

    await page.fill('input[placeholder*="Buscar"]', 'laptop');
    await page.click('button:has-text("Buscar")');

    await expect(page.locator('.product-card').first()).toBeVisible();
  });
});