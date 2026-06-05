import { test, expect } from '@playwright/test';

test.describe('Navegación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('puede navegar al dashboard', async ({ page }) => {
    await page.click('text=Dashboard');
    await expect(page.locator('text=Bienvenido')).toBeVisible();
  });

  test('puede navegar a B2B', async ({ page }) => {
    await page.click('text=B2B');
    await expect(page).toHaveURL(/b2b/);
  });

  test('puede navegar a Leads', async ({ page }) => {
    await page.click('text=Leads');
    await expect(page).toHaveURL(/leads/);
  });

  test('puede navegar a Mensajes', async ({ page }) => {
    await page.click('text=Mensajes');
    await expect(page).toHaveURL(/messages/);
  });

  test('puede navegar a Wallet', async ({ page }) => {
    await page.click('text=Wallet');
    await expect(page).toHaveURL(/wallet/);
  });

  test('puede navegar a Asesores', async ({ page }) => {
    await page.click('text=Asesores');
    await expect(page).toHaveURL(/advisors/);
  });

  test('puede navegar a Publicidad', async ({ page }) => {
    await page.click('text=Publicidad');
    await expect(page).toHaveURL(/advertising/);
  });

  test('puede navegar a AI', async ({ page }) => {
    await page.click('text=AI');
    await expect(page).toHaveURL(/ai/);
  });
});