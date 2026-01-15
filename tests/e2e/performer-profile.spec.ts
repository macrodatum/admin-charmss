import { test, expect } from '@playwright/test';

test.describe('Performer Profile - Personal Information Tab', () => {
  test.beforeEach(async ({ page }) => {
    // Login primero
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Navegar a performers
    await page.goto('http://localhost:5173/performers');
    await page.waitForLoadState('networkidle');
  });

  test('should open performer profile modal', async ({ page }) => {
    // Click en el primer performer para abrir el modal
    await page.click('[data-testid="performer-row"]:first-child');

    // Verificar que el modal se abre
    await expect(page.locator('text=Profile Management')).toBeVisible();
  });

  test('should display personal information tab by default', async ({ page }) => {
    await page.click('[data-testid="performer-row"]:first-child');

    // Verificar que el tab Personal Information está activo
    await expect(page.locator('button:has-text("Personal Information")')).toHaveClass(
      /border-pink/
    );

    // Verificar campos del formulario
    await expect(page.locator('label:has-text("NickName")')).toBeVisible();
    await expect(page.locator('label:has-text("Headline")')).toBeVisible();
    await expect(page.locator('label:has-text("My live")')).toBeVisible();
  });

  test('should edit and save personal information', async ({ page }) => {
    await page.click('[data-testid="performer-row"]:first-child');

    // Editar nickname
    const nicknameInput = page.locator('input').first();
    await nicknameInput.fill('NewNickname123');

    // Editar headline
    const headlineTextarea = page.locator('textarea').first();
    await headlineTextarea.fill('New exciting headline!');

    // Click en Save personal
    await page.click('button:has-text("Save personal")');

    // Verificar mensaje de éxito
    await expect(page.locator('text=Personal guardado correctamente')).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Performer Profile - Profile Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:5173/performers');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="performer-row"]:first-child');
  });

  test('should switch to profile tab', async ({ page }) => {
    await page.click('button:has-text("Profile")');

    // Verificar que el tab Profile está activo
    await expect(page.locator('button:has-text("Profile")').first()).toHaveClass(/border-pink/);

    // Verificar campos del formulario
    await expect(page.locator('label:has-text("Age")')).toBeVisible();
    await expect(page.locator('label:has-text("Height")')).toBeVisible();
    await expect(page.locator('label:has-text("Weight")')).toBeVisible();
  });

  test('should adjust age slider', async ({ page }) => {
    await page.click('button:has-text("Profile")');

    // Obtener el slider de edad
    const ageSlider = page.locator('input[type="range"]').first();
    await ageSlider.fill('30');

    // Verificar que el valor se actualiza
    await expect(page.locator('text=30 years')).toBeVisible();
  });

  test('should save profile data', async ({ page }) => {
    await page.click('button:has-text("Profile")');

    // Ajustar algunos valores
    const ageSlider = page.locator('input[type="range"]').first();
    await ageSlider.fill('28');

    // Click en Save profile
    await page.click('button:has-text("Save profile")');

    // Verificar mensaje de éxito
    await expect(page.locator('text=Profile guardado correctamente')).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Performer Profile - Pricing Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:5173/performers');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="performer-row"]:first-child');
  });

  test('should switch to pricing tab and display products', async ({ page }) => {
    await page.click('button:has-text("Pricing")');

    // Verificar que el tab Pricing está activo
    await expect(page.locator('button:has-text("Pricing")').first()).toHaveClass(/border-pink/);

    // Esperar a que carguen los productos
    await page.waitForTimeout(1000);

    // Verificar que hay sliders de precio o mensaje de no productos
    const hasProducts = await page.locator('input[type="range"]').count();
    const hasNoProductsMessage = await page.locator('text=No hay productos configurables').count();

    expect(hasProducts > 0 || hasNoProductsMessage > 0).toBeTruthy();
  });
});

test.describe('Performer Profile - Media Profile Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:5173/performers');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="performer-row"]:first-child');
  });

  test('should switch to media profile tab', async ({ page }) => {
    await page.click('button:has-text("Media profile")');

    // Verificar que el tab está activo
    await expect(page.locator('button:has-text("Media profile")').first()).toHaveClass(
      /border-pink/
    );

    // Verificar secciones
    await expect(page.locator('text=Avatar del perfil')).toBeVisible();
    await expect(page.locator('text=Video de presentación')).toBeVisible();
  });

  test('should display approved media items', async ({ page }) => {
    await page.click('button:has-text("Media profile")');

    // Esperar a que carguen los media items
    await page.waitForTimeout(1000);

    // Verificar si hay media o mensaje de no hay media
    const hasImages = await page.locator('img[alt*="Image"]').count();
    const noImagesMessage = await page
      .locator('text=No hay imágenes aprobadas disponibles')
      .count();

    expect(hasImages > 0 || noImagesMessage > 0).toBeTruthy();
  });
});

test.describe('Performer Profile - Payments Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:5173/performers');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="performer-row"]:first-child');
  });

  test('should switch to payments tab and display payment data', async ({ page }) => {
    await page.click('button:has-text("Payments")');

    // Verificar que el tab está activo
    await expect(page.locator('button:has-text("Payments")').first()).toHaveClass(/border-pink/);

    // Esperar a que carguen los datos
    await page.waitForTimeout(1000);

    // Verificar secciones de pagos
    await expect(page.locator('text=Total Earnings')).toBeVisible();
    await expect(page.locator('text=Weekly Payments')).toBeVisible();
    await expect(page.locator('text=Payment Methods')).toBeVisible();
    await expect(page.locator('text=Recent Transactions')).toBeVisible();
  });
});

test.describe('Performer Profile - Sales Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:5173/performers');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="performer-row"]:first-child');
  });

  test('should switch to sales tab and display sales data', async ({ page }) => {
    await page.click('button:has-text("Sales")');

    // Verificar que el tab está activo
    await expect(page.locator('button:has-text("Sales")').first()).toHaveClass(/border-pink/);

    // Esperar a que carguen los datos
    await page.waitForTimeout(1000);

    // Verificar secciones de ventas
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Sales by Product')).toBeVisible();
    await expect(page.locator('text=Top Customers')).toBeVisible();
  });
});

test.describe('Performer Profile - Like Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:5173/performers');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="performer-row"]:first-child');
  });

  test('should switch to like tab and display preferences', async ({ page }) => {
    await page.click('button:has-text("I like")');

    // Verificar que el tab está activo
    await expect(page.locator('button:has-text("I like")').first()).toHaveClass(/border-pink/);

    // Esperar a que carguen los datos
    await page.waitForTimeout(1000);

    // Verificar que hay categorías de preferencias
    await expect(page.locator('text=Cosas que me gustan')).toBeVisible();
  });

  test('should toggle preference selection', async ({ page }) => {
    await page.click('button:has-text("I like")');

    await page.waitForTimeout(1000);

    // Buscar un botón de preferencia y hacer click
    const preferenceButtons = page.locator('button').filter({ hasText: /Dancing|Music|Art/ });
    const count = await preferenceButtons.count();

    if (count > 0) {
      await preferenceButtons.first().click();
      // El botón debería cambiar de estilo al ser seleccionado
      await expect(preferenceButtons.first()).toHaveClass(/bg-pink/);
    }
  });
});

test.describe('Performer Profile - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:5173/performers');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="performer-row"]:first-child');
  });

  test('should close modal when X button is clicked', async ({ page }) => {
    // Verificar que el modal está abierto
    await expect(page.locator('text=Profile Management')).toBeVisible();

    // Click en botón X
    await page.click('button:has(svg.lucide-x)');

    // Verificar que el modal se cierra
    await expect(page.locator('text=Profile Management')).not.toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    const tabs = ['Profile', 'I like', 'Pricing', 'Media profile', 'Payments', 'Sales'];

    for (const tab of tabs) {
      await page.click(`button:has-text("${tab}")`);
      await expect(page.locator(`button:has-text("${tab}")`).first()).toHaveClass(/border-pink/);
      await page.waitForTimeout(500);
    }
  });
});
