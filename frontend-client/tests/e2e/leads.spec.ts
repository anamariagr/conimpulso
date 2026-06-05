import { test, expect } from '@playwright/test';

test.describe('Leads', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('puede ver lista de leads', async ({ page }) => {
    await page.goto('/dashboard/leads');

    await expect(page.locator('text=Leads')).toBeVisible();
    await expect(page.locator('text=Nuevo Lead')).toBeVisible();
  });

  test('puede crear nuevo lead', async ({ page }) => {
    await page.goto('/dashboard/leads');

    await page.click('text=Nuevo Lead');
    await page.waitForSelector('form');

    await page.fill('input[name="name"]', 'Lead Test ' + Date.now());
    await page.fill('input[name="email"]', `lead${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', '3001234567');

    await page.click('button:has-text("Guardar")');

    await expect(page.locator('text=Lead creado')).toBeVisible();
  });

  test('puede filtrar leads por estado', async ({ page }) => {
    await page.goto('/dashboard/leads');

    await page.click('text=Nuevo');
    await page.waitForTimeout(300);

    await expect(page.locator('.lead-item').first()).toBeVisible({ timeout: 5000 });
  });
});