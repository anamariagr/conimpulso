import { test, expect } from '@playwright/test';

test.describe('Wallet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('puede ver balance de wallet', async ({ page }) => {
    await page.goto('/dashboard/wallet');

    await expect(page.locator('text=Billetera')).toBeVisible();
    await expect(page.locator('text=Saldo')).toBeVisible();
  });

  test('puede ver historial de transacciones', async ({ page }) => {
    await page.goto('/dashboard/wallet');

    await expect(page.locator('text=Transacciones')).toBeVisible();
    await expect(page.locator('.transaction-item').first()).toBeVisible({ timeout: 3000 });
  });

  test('puede solicitar recarga', async ({ page }) => {
    await page.goto('/dashboard/wallet');

    await page.click('text=Recargar');
    await page.waitForSelector('form');

    await page.fill('input[name="amount"]', '100000');
    await page.click('button:has-text("Solicitar")');

    await expect(page.locator('text=Solicitud enviada')).toBeVisible();
  });
});