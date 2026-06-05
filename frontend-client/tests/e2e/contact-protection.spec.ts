import { test, expect } from '@playwright/test';

test.describe('Protección de Contactos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('usuario no puede enviar número de teléfono', async ({ page }) => {
    await page.goto('/dashboard/messages');

    await page.fill('textarea[name="content"]', 'Mi número es 3001234567');
    await page.click('button:has-text("Enviar")');

    await expect(page.locator('text=número bloqueado')).toBeVisible();
  });

  test('usuario no puede evadir con palabras clave', async ({ page }) => {
    await page.goto('/dashboard/messages');

    await page.fill('textarea[name="content"]', 'Escríbeme al WhatsApp 3001234567');
    await page.click('button:has-text("Enviar")');

    await expect(page.locator('text=información de contacto')).toBeVisible();
  });

  test('usuario puede bloquear contacto', async ({ page }) => {
    await page.goto('/dashboard/messages');

    await page.click('text=Bloquear');
    await page.click('text=Confirmar');

    await expect(page.locator('text=Usuario bloqueado')).toBeVisible();
  });

  test('usuario puede desbloquear contacto', async ({ page }) => {
    await page.goto('/dashboard/messages');

    await page.click('text=Bloqueados');
    await page.click('text=Desbloquear');

    await expect(page.locator('text=Usuario desbloqueado')).toBeVisible();
  });
});