import { test, expect } from '@playwright/test';

test.describe('Tiendas', () => {
  test('puede ver lista de tiendas', async ({ page }) => {
    await page.goto('/stores');

    await expect(page.locator('text=Tiendas')).toBeVisible();
    await expect(page.locator('.store-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('puede buscar tiendas', async ({ page }) => {
    await page.goto('/stores');

    await page.fill('input[placeholder*="Buscar"]', 'tech');
    await page.press('input[placeholder*="Buscar"]', 'Enter');

    await expect(page.locator('.store-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('puede ver perfil de tienda', async ({ page }) => {
    await page.goto('/stores');

    await page.click('.store-card >> text=Ver tienda');
    await page.waitForURL(/\/stores\//);

    await expect(page.locator('text=Productos')).toBeVisible();
  });
});