import { test, expect } from '@playwright/test';

test.describe('Cookie consent E2E', () => {
  test('session accept, persistent accept and dismiss behavior', async ({ page, context }) => {
    // Clear cookies and sessionStorage before starting
    await context.clearCookies();

    // Mock GDPR fetch
    await page.route('**/api/legal/name/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, name: 'Política de privacidad', content: 'Contenido GDPR' }),
      });
    });

    // Navigate and ensure sessionStorage is cleared before the consent component reads it
    await page.goto('/');
    await page.evaluate(() => sessionStorage.removeItem('allowed-terms-session'));

    // Consent bar should be visible (wait longer in case of slow build)
    await page.waitForSelector('text=Usamos cookies para mejorar tu experiencia.', {
      timeout: 60000,
    });

    // Initially Aceptar por sesión is disabled until checkbox checked
    await expect(page.locator('button:has-text("Aceptar por sesión")')).toBeDisabled();

    // Check the GDPR checkbox by clicking the label (ensures React receives the change event)
    await page.waitForSelector('label:has-text("Acepto la cláusula GDPR")', {
      state: 'visible',
      timeout: 60000,
    });
    await page.click('label:has-text("Acepto la cláusula GDPR")');

    // Now the session accept button should be enabled
    await expect(page.locator('button:has-text("Aceptar por sesión")')).toBeEnabled();

    // Click accept session
    await page.click('button:has-text("Aceptar por sesión")');

    // Verify sessionStorage set
    const sessionFlag = await page.evaluate(() => sessionStorage.getItem('allowed-terms-session'));
    expect(sessionFlag).toBe('true');

    // Bar should disappear
    await expect(
      page.locator('text=Usamos cookies para mejorar tu experiencia.')
    ).not.toBeVisible();

    // Clear session and cookies and navigate again
    await page.evaluate(() => sessionStorage.removeItem('allowed-terms-session'));
    await context.clearCookies();
    await page.goto('/');

    // Wait for bar to re-appear
    await page.waitForSelector('text=Usamos cookies para mejorar tu experiencia.', {
      timeout: 60000,
    });

    // Persistent accept: click the label to set the checkbox and accept persistently
    await page.waitForSelector('label:has-text("Acepto la cláusula GDPR")', {
      state: 'visible',
      timeout: 60000,
    });
    await page.click('label:has-text("Acepto la cláusula GDPR")');
    await page.click('button:has-text("Aceptar cookies")');

    const cookies = await context.cookies();
    const allowed = cookies.find((c) => c.name === 'allowed-terms');
    expect(allowed).toBeTruthy();

    // Clear cookies and test dismiss behavior
    await context.clearCookies();
    await page.evaluate(() => sessionStorage.removeItem('allowed-terms-session'));
    await page.goto('/');

    await page.waitForSelector('text=Usamos cookies para mejorar tu experiencia.', {
      timeout: 60000,
    });
    await page.click('button:has-text("Cerrar")');

    // Dismiss should not set session flag
    const dismissed = await page.evaluate(() => sessionStorage.getItem('allowed-terms-session'));
    expect(dismissed).toBeNull();
    await expect(
      page.locator('text=Usamos cookies para mejorar tu experiencia.')
    ).not.toBeVisible();

    // After navigation the bar should reappear
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('text=Usamos cookies para mejorar tu experiencia.')).toBeVisible();
  });

  test('Leer política opens modal', async ({ page }) => {
    await page.route('**/api/legal/name/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, name: 'Política de privacidad', content: 'Contenido GDPR' }),
      });
    });

    await page.goto('/');

    await expect(page.locator('text=Usamos cookies para mejorar tu experiencia.')).toBeVisible();

    await page.click('button:has-text("Leer política")');

    // Modal should show and contain the content (scoped to modal)
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal.locator('text=Política de privacidad')).toBeVisible();
    await expect(modal.locator('text=Contenido GDPR')).toBeVisible();

    // Close modal
    await modal.locator('button[title="Cerrar"]').click();
    await expect(modal.locator('text=Política de privacidad')).not.toBeVisible();
  });
});
