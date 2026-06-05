import { test, expect } from '@playwright/test';

test.describe('Campañas Publicitarias', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('puede ver lista de campañas', async ({ page }) => {
    await page.goto('/advertising/campaigns');

    await expect(page.locator('text=Campañas')).toBeVisible();
    await expect(page.locator('text=Nueva Campaña')).toBeVisible();
  });

  test('puede crear nueva campaña', async ({ page }) => {
    await page.goto('/advertising/campaigns/new');

    await page.fill('input[name="name"]', 'Campaña Test ' + Date.now());
    await page.fill('input[name="budget"]', '500000');

    await page.click('button:has-text("Crear")');

    await expect(page).toHaveURL(/\/advertising\/campaigns/);
  });

  test('puede ver estadísticas de campaña', async ({ page }) => {
    await page.goto('/advertising/campaigns');

    await page.click('.campaign-card >> text=Ver estadísticas');
    await page.waitForTimeout(500);

    await expect(page.locator('text=Impresiones')).toBeVisible();
    await expect(page.locator('text=Clics')).toBeVisible();
  });
});