import { test, expect } from '@playwright/test';

test.describe('AI Insights', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('puede ver dashboard de AI', async ({ page }) => {
    await page.goto('/ai');

    await expect(page.locator('text=AI Insights')).toBeVisible();
    await expect(page.locator('text=Productos')).toBeVisible();
  });

  test('puede ver productos trending', async ({ page }) => {
    await page.goto('/ai');

    await expect(page.locator('text=Trending')).toBeVisible();
    await expect(page.locator('.trending-product').first()).toBeVisible({ timeout: 5000 });
  });

  test('puede obtener sugerencias de categoría', async ({ page }) => {
    await page.goto('/ai');

    await page.fill('input[name="product_name"]', 'Camiseta algodón');
    await page.fill('textarea[name="description"]', 'Camisetas de algodón premium para hombre');

    await page.click('button:has-text("Sugerir")');

    await expect(page.locator('text=Categoría sugerida')).toBeVisible({ timeout: 5000 });
  });

  test('puede moderar contenido', async ({ page }) => {
    await page.goto('/ai');

    await page.fill('textarea[name="content"]', 'Este es un producto de buena calidad');

    await page.click('button:has-text("Moderar")');

    await expect(page.locator('text=Apropiado')).toBeVisible({ timeout: 5000 });
  });
});