import { test, expect } from '@playwright/test';

test('CRUD flow on gifts page (mocked API)', async ({ page }) => {
  let nextId = 1;

  type TestGift = {
    id: number;
    name?: string;
    description?: string;
    url?: string;
    price?: number;
    urlSound?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };

  const gifts: TestGift[] = [];

  await page.route('**/api/gifts', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      route.fulfill({
        status: 200,
        body: JSON.stringify(gifts),
        headers: { 'Content-Type': 'application/json' },
      });
      return;
    }

    if (req.method() === 'POST') {
      const d = await req.postData();
      try {
        const data = d ? (JSON.parse(d) as Record<string, unknown>) : {};
        const created = {
          id: nextId++,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        gifts.unshift(created as TestGift);
        route.fulfill({
          status: 201,
          body: JSON.stringify(created),
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        route.fulfill({ status: 400 });
      }
      return;
    }

    route.continue();
  });

  await page.route('**/api/gifts/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const parts = url.split('/');
    const idStr = parts[parts.length - 1];
    const id = Number(idStr);

    if (req.method() === 'PATCH') {
      const body = JSON.parse((await req.postData()) || '{}');
      const idx = gifts.findIndex((l) => l.id === id);
      if (idx >= 0) {
        gifts[idx] = { ...gifts[idx], ...body, updatedAt: new Date().toISOString() };
        route.fulfill({
          status: 200,
          body: JSON.stringify(gifts[idx]),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        route.fulfill({ status: 404 });
      }
      return;
    }

    if (req.method() === 'DELETE') {
      const idx = gifts.findIndex((l) => l.id === id);
      if (idx >= 0) {
        gifts.splice(idx, 1);
        route.fulfill({ status: 204 });
      } else {
        route.fulfill({ status: 404 });
      }
      return;
    }

    if (req.method() === 'GET' && url.includes('/api/gifts/name/')) {
      const name = decodeURIComponent(url.split('/api/gifts/name/')[1]);
      const found = gifts.find((l) => l.name === name);
      if (found) {
        route.fulfill({
          status: 200,
          body: JSON.stringify(found),
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        route.fulfill({ status: 404 });
      }
      return;
    }

    route.continue();
  });

  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          jwt: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjE5MDAwMDAwMDB9.',
          user: { id: 'test-admin-id', email: 'admin@test.com' },
          isLoggedIn: true,
        },
        version: 0,
      })
    );
  });

  await page.goto('/gifts');
  await expect(page.locator('h1:has-text("Gifts")')).toBeVisible();

  // Crear gift usando la UI con imagen y sonido
  await page.click('button[data-testid="create-gift"]');
  await page.fill('input[required]', 'Rose Bouquet');
  await page.fill('textarea', 'Beautiful red rose bouquet');
  await page.fill('input[type="number"]', '100');
  // Subir imagen y sonido usando import.meta.url y pathToFileURL
  const { pathToFileURL } = await import('url');
  const imagePath = pathToFileURL(
    new URL('../assets/test-image.png', import.meta.url).pathname
  ).pathname;
  await page.setInputFiles('#gift-image-input', imagePath);
  const soundPath = pathToFileURL(
    new URL('../assets/test-sound.mp3', import.meta.url).pathname
  ).pathname;
  await page.setInputFiles('#gift-sound-input', soundPath);
  await page.click('button[type="submit"]');

  await expect(page.locator('h3:has-text("Rose Bouquet")')).toBeVisible();

  // Verificar previsualización de imagen y sonido en la card
  const card = page.locator(`[data-testid^="gift-card-"]`).first();
  await expect(card.locator('img')).toBeVisible();
  await expect(card.locator('audio')).toBeVisible();

  // Ver modal y previsualización
  await card.locator('button[title="Ver"]').click();
  const modal = page.locator('div.fixed.inset-0');
  await expect(modal.locator('text=Beautiful red rose bouquet')).toBeVisible();
  await expect(modal.locator('img')).toBeVisible();
  await expect(modal.locator('audio')).toBeVisible();
  await modal.locator('button[title="Cerrar"]').click();

  // Edit (simulate update via API and reload list)
  await page.evaluate(async () => {
    await fetch('/api/gifts/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Rose Updated' }),
    });
  });

  // Verify server state directly
  const list = await page.evaluate(async () => await (await fetch('/api/gifts')).json());
  // eslint-disable-next-line no-console
  console.log('gifts list after patch:', list);
  await expect(list[0].name).toBe('Rose Updated');

  await page.reload();
  await expect(page.locator('text=Rose Updated')).toBeVisible();

  // Delete (simulate via API and reload)
  await page.evaluate(async () => {
    await fetch('/api/gifts/1', { method: 'DELETE' });
  });
  await page.reload();
  await expect(page.locator('text=Rose Updated')).not.toBeVisible();
});
