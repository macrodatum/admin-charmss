import { test, expect } from '@playwright/test';

test.describe('Packages CRUD', () => {
  test('should create, view, edit, and delete a package', async ({ page }) => {
    let nextId = 1;

    type TestPackage = {
      id: number;
      name: string;
      lifeTime: number;
      price: number;
      status: boolean;
      bonus: number;
      totalCredit: number;
      logoImage: string;
      createdAt?: string;
      updatedAt?: string;
    };

    const packages: TestPackage[] = [];

    // Mock GET /api/packages
    await page.route('**/api/packages', async (route) => {
      const req = route.request();
      if (req.method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(packages),
          headers: { 'Content-Type': 'application/json' },
        });
        return;
      }

      if (req.method() === 'POST') {
        const body = await req.postData();
        try {
          const data = body ? (JSON.parse(body) as Partial<TestPackage>) : {};
          const created: TestPackage = {
            id: nextId++,
            name: data.name || '',
            lifeTime: data.lifeTime || 30,
            price: data.price || 0,
            status: data.status ?? true,
            bonus: data.bonus || 0,
            totalCredit: data.totalCredit || 100,
            logoImage: data.logoImage || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          packages.unshift(created);
          await route.fulfill({
            status: 201,
            body: JSON.stringify(created),
            headers: { 'Content-Type': 'application/json' },
          });
        } catch {
          await route.fulfill({ status: 400 });
        }
        return;
      }

      await route.continue();
    });

    // Mock /api/packages/{id} (GET, PATCH, DELETE)
    await page.route('**/api/packages/**', async (route) => {
      const req = route.request();
      const url = req.url();
      const parts = url.split('/');
      const idStr = parts[parts.length - 1];
      const id = Number(idStr);

      if (req.method() === 'GET') {
        const found = packages.find((p) => p.id === id);
        if (found) {
          await route.fulfill({
            status: 200,
            body: JSON.stringify(found),
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          await route.fulfill({ status: 404 });
        }
        return;
      }

      if (req.method() === 'PATCH') {
        const body = JSON.parse((await req.postData()) || '{}');
        const idx = packages.findIndex((p) => p.id === id);
        if (idx >= 0) {
          packages[idx] = {
            ...packages[idx],
            ...body,
            updatedAt: new Date().toISOString(),
          };
          await route.fulfill({
            status: 200,
            body: JSON.stringify(packages[idx]),
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          await route.fulfill({ status: 404 });
        }
        return;
      }

      if (req.method() === 'DELETE') {
        const idx = packages.findIndex((p) => p.id === id);
        if (idx >= 0) {
          packages.splice(idx, 1);
          await route.fulfill({ status: 204 });
        } else {
          await route.fulfill({ status: 404 });
        }
        return;
      }

      await route.continue();
    });

    // Navigate to packages page
    await page.goto('http://localhost:5173/packages');

    // Should show empty state initially
    await expect(page.getByText('No hay paquetes registrados')).toBeVisible();

    // Click create button
    await page.getByTestId('create-package').click();

    // Fill out the form
    await page.getByPlaceholder('Ej: Premium Package').fill('Premium Package Test');
    await page.getByPlaceholder('99.99').fill('149.99');
    await page.getByPlaceholder('30').fill('60');
    await page.getByPlaceholder('100').fill('500');
    await page.getByPlaceholder('0').fill('50');
    await page.getByPlaceholder('https://example.com/logo.png').fill('https://test.com/logo.png');

    // Submit the form
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Package should appear in the list
    await expect(page.getByText('Premium Package Test')).toBeVisible();
    await expect(page.getByText('60 días')).toBeVisible();
    await expect(page.getByText('$149.99')).toBeVisible();
    await expect(page.getByText('500 créditos')).toBeVisible();
    await expect(page.getByText('+50 bonus')).toBeVisible();

    // Click view button to see details
    const packageCard = page.getByTestId('package-card-1');
    await packageCard.getByRole('button', { name: 'Ver' }).click();

    // Check modal shows details
    await expect(page.getByText('Detalle del Paquete')).toBeVisible();
    await expect(page.getByText('Premium Package Test')).toBeVisible();
    await expect(page.getByText('Activo')).toBeVisible();

    // Close detail modal
    await page.getByRole('button', { name: 'Cerrar' }).first().click();

    // Click edit button
    await packageCard.getByRole('button', { name: 'Editar' }).click();

    // Edit the name
    await page.locator('input[value="Premium Package Test"]').fill('Updated Premium Package');

    // Save changes
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Check updated name appears
    await expect(page.getByText('Updated Premium Package')).toBeVisible();

    // Click delete button
    await packageCard.getByRole('button', { name: 'Borrar' }).click();

    // Confirm deletion in modal
    await expect(page.getByText('Confirmar Eliminación')).toBeVisible();
    await expect(page.getByText('"Updated Premium Package"')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).click();

    // Package should be removed
    await expect(page.getByText('Updated Premium Package')).not.toBeVisible();
    await expect(page.getByText('No hay paquetes registrados')).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    const packages: never[] = [];

    await page.route('**/api/packages', async (route) => {
      const req = route.request();
      if (req.method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(packages),
          headers: { 'Content-Type': 'application/json' },
        });
      }
    });

    await page.goto('http://localhost:5173/packages');
    await page.getByTestId('create-package').click();

    // Try to submit empty form
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Should show validation errors
    await expect(page.getByText('El nombre es requerido')).toBeVisible();

    // Fill name but invalid price
    await page.getByPlaceholder('Ej: Premium Package').fill('Test Package');
    await page.getByPlaceholder('99.99').fill('0');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.getByText('El precio debe ser mayor a 0')).toBeVisible();

    // Fix price but invalid lifeTime
    await page.getByPlaceholder('99.99').fill('99.99');
    await page.getByPlaceholder('30').fill('0');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.getByText('La duración debe ser mayor a 0')).toBeVisible();

    // Fix lifeTime but invalid totalCredit
    await page.getByPlaceholder('30').fill('30');
    await page.getByPlaceholder('100').fill('0');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.getByText('Los créditos totales deben ser mayor a 0')).toBeVisible();

    // Fix totalCredit but invalid URL
    await page.getByPlaceholder('100').fill('100');
    await page.getByPlaceholder('https://example.com/logo.png').fill('not-a-url');
    await page.getByRole('button', { name: 'Guardar' }).click();

    await expect(page.getByText('Debe ser una URL válida')).toBeVisible();
  });

  test('should display different package statuses', async ({ page }) => {
    let nextId = 1;

    type TestPackage = {
      id: number;
      name: string;
      lifeTime: number;
      price: number;
      status: boolean;
      bonus: number;
      totalCredit: number;
      logoImage: string;
      createdAt: string;
      updatedAt: string;
    };

    const packages: TestPackage[] = [
      {
        id: nextId++,
        name: 'Active Package',
        lifeTime: 30,
        price: 99.99,
        status: true,
        bonus: 50,
        totalCredit: 500,
        logoImage: 'https://example.com/active.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: nextId++,
        name: 'Inactive Package',
        lifeTime: 60,
        price: 149.99,
        status: false,
        bonus: 0,
        totalCredit: 1000,
        logoImage: 'https://example.com/inactive.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await page.route('**/api/packages', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(packages),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto('http://localhost:5173/packages');

    // Both packages should be visible
    await expect(page.getByText('Active Package')).toBeVisible();
    await expect(page.getByText('Inactive Package')).toBeVisible();

    // Check status labels
    await expect(page.getByText('Activo')).toBeVisible();
    await expect(page.getByText('Inactivo')).toBeVisible();

    // Check different durations and prices
    await expect(page.getByText('30 días')).toBeVisible();
    await expect(page.getByText('60 días')).toBeVisible();
    await expect(page.getByText('$99.99')).toBeVisible();
    await expect(page.getByText('$149.99')).toBeVisible();

    // Check bonus display (only for active package)
    await expect(page.getByText('+50 bonus')).toBeVisible();
    await expect(page.queryByText('+0 bonus')).not.toBeVisible();
  });

  test('should handle logo image errors', async ({ page }) => {
    const packages = [
      {
        id: 1,
        name: 'Package with Logo',
        lifeTime: 30,
        price: 99.99,
        status: true,
        bonus: 0,
        totalCredit: 500,
        logoImage: 'https://invalid-url.com/nonexistent.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await page.route('**/api/packages', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(packages),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto('http://localhost:5173/packages');

    // Package should still be visible even with broken image
    await expect(page.getByText('Package with Logo')).toBeVisible();
  });
});
