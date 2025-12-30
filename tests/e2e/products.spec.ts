import { test, expect } from '@playwright/test';

test.describe('Products CRUD', () => {
  test('should create, view, edit, and delete a product', async ({ page }) => {
    let nextId = 1;

    type TestProduct = {
      id: number;
      name: string;
      productType: number;
      durationDays: number;
      minPrice: number;
      maxPrice: number;
      defaultPrice: number;
      editPriceInProfile: boolean;
      createdAt?: string;
      updatedAt?: string;
    };

    const products: TestProduct[] = [];

    // Mock GET /api/products
    await page.route('**/api/products', async (route) => {
      const req = route.request();
      if (req.method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(products),
          headers: { 'Content-Type': 'application/json' },
        });
        return;
      }

      if (req.method() === 'POST') {
        const body = await req.postData();
        try {
          const data = body ? (JSON.parse(body) as Partial<TestProduct>) : {};
          const created: TestProduct = {
            id: nextId++,
            name: data.name || '',
            productType: data.productType || 1,
            durationDays: data.durationDays || 30,
            minPrice: data.minPrice || 0,
            maxPrice: data.maxPrice || 0,
            defaultPrice: data.defaultPrice || 0,
            editPriceInProfile: data.editPriceInProfile ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          products.unshift(created);
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

    // Mock /api/products/{id} (GET, PATCH, DELETE)
    await page.route('**/api/products/**', async (route) => {
      const req = route.request();
      const url = req.url();
      const parts = url.split('/');
      const idStr = parts[parts.length - 1];
      const id = Number(idStr);

      if (req.method() === 'GET') {
        const found = products.find((p) => p.id === id);
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
        const idx = products.findIndex((p) => p.id === id);
        if (idx >= 0) {
          products[idx] = {
            ...products[idx],
            ...body,
            updatedAt: new Date().toISOString(),
          };
          await route.fulfill({
            status: 200,
            body: JSON.stringify(products[idx]),
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          await route.fulfill({ status: 404 });
        }
        return;
      }

      if (req.method() === 'DELETE') {
        const idx = products.findIndex((p) => p.id === id);
        if (idx >= 0) {
          products.splice(idx, 1);
          await route.fulfill({ status: 204 });
        } else {
          await route.fulfill({ status: 404 });
        }
        return;
      }

      await route.continue();
    });

    // Navigate to products page
    await page.goto('http://localhost:5173/products');

    // Should show empty state initially
    await expect(page.getByText('No hay productos registrados')).toBeVisible();

    // Click create button
    await page.getByTestId('create-product').click();

    // Fill out the form
    await page.getByPlaceholder('Ej: Private Show').fill('Private Show Test');
    await page.getByPlaceholder('30').fill('45');
    await page.getByPlaceholder('150').fill('200');
    await page.getByPlaceholder('100').fill('150');
    await page.getByPlaceholder('500').fill('600');

    // Submit the form
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Product should appear in the list
    await expect(page.getByText('Private Show Test')).toBeVisible();
    await expect(page.getByText('45 días')).toBeVisible();
    await expect(page.getByText('$200')).toBeVisible();

    // Click view button to see details
    const productCard = page.getByTestId('product-card-1');
    await productCard.getByRole('button', { name: 'Ver' }).click();

    // Check modal shows details
    await expect(page.getByText('Detalle del Producto')).toBeVisible();
    await expect(page.getByText('Private Show Test')).toBeVisible();
    await expect(page.getByText('Show Privado')).toBeVisible();

    // Close detail modal
    await page.getByRole('button', { name: 'Cerrar' }).first().click();

    // Click edit button
    await productCard.getByRole('button', { name: 'Editar' }).click();

    // Edit the name
    await page.locator('input[value="Private Show Test"]').fill('Updated Private Show');

    // Save changes
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Check updated name appears
    await expect(page.getByText('Updated Private Show')).toBeVisible();

    // Click delete button
    await productCard.getByRole('button', { name: 'Borrar' }).click();

    // Confirm deletion in modal
    await expect(page.getByText('Confirmar Eliminación')).toBeVisible();
    await expect(page.getByText('"Updated Private Show"')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).click();

    // Product should be removed
    await expect(page.getByText('Updated Private Show')).not.toBeVisible();
    await expect(page.getByText('No hay productos registrados')).toBeVisible();
  });

  test('should validate price ranges', async ({ page }) => {
    const products: never[] = [];

    await page.route('**/api/products', async (route) => {
      const req = route.request();
      if (req.method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(products),
          headers: { 'Content-Type': 'application/json' },
        });
      }
    });

    await page.goto('http://localhost:5173/products');
    await page.getByTestId('create-product').click();

    // Fill form with invalid price range (min > max)
    await page.getByPlaceholder('Ej: Private Show').fill('Test Product');
    await page.getByPlaceholder('30').fill('30');
    await page.getByPlaceholder('150').fill('200');
    await page.getByPlaceholder('100').fill('600');
    await page.getByPlaceholder('500').fill('400');

    // Try to submit
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Should show validation error
    await expect(
      page.getByText('El precio mínimo no puede ser mayor al precio máximo')
    ).toBeVisible();

    // Fix min/max prices but make default price outside range
    await page.getByPlaceholder('600').fill('100');
    await page.getByPlaceholder('400').fill('500');
    await page.getByPlaceholder('200').fill('50');

    // Try to submit again
    await page.getByRole('button', { name: 'Guardar' }).click();

    // Should show different validation error
    await expect(
      page.getByText('El precio por defecto debe estar dentro del rango de precios')
    ).toBeVisible();
  });

  test('should filter and display different product types', async ({ page }) => {
    let nextId = 1;

    type TestProduct = {
      id: number;
      name: string;
      productType: number;
      durationDays: number;
      minPrice: number;
      maxPrice: number;
      defaultPrice: number;
      editPriceInProfile: boolean;
      createdAt: string;
      updatedAt: string;
    };

    const products: TestProduct[] = [
      {
        id: nextId++,
        name: 'Private Show',
        productType: 1,
        durationDays: 30,
        minPrice: 100,
        maxPrice: 500,
        defaultPrice: 150,
        editPriceInProfile: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: nextId++,
        name: 'Exclusive Content',
        productType: 2,
        durationDays: 60,
        minPrice: 50,
        maxPrice: 200,
        defaultPrice: 100,
        editPriceInProfile: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(products),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.goto('http://localhost:5173/products');

    // Both products should be visible
    await expect(page.getByText('Private Show')).toBeVisible();
    await expect(page.getByText('Exclusive Content')).toBeVisible();

    // Check product type labels
    await expect(page.getByText('Show Privado')).toBeVisible();
    await expect(page.getByText('Contenido Exclusivo')).toBeVisible();

    // Check durations
    await expect(page.getByText('30 días')).toBeVisible();
    await expect(page.getByText('60 días')).toBeVisible();
  });
});
