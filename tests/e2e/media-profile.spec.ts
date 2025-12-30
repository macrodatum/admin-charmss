import { test, expect } from '@playwright/test';

test.describe('Media profile tab E2E', () => {
  test('assign avatar and video from approved assets', async ({ page }) => {
    // Mock performers list
    await page.route('**/api/performers**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 2,
              firstName: 'Luis',
              lastName: 'Corredor',
              email: 'luis@example.com',
              studioId: 2,
              status: 0,
              appUserId: 'abc',
              performerProfile: { id: 1, performerId: 2, nickName: 'lgabrielcor' },
            },
          ],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    });

    // Mock album with approved photo and video
    await page.route('**/api/album/performer/1**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Test Album',
          creationDate: new Date().toISOString(),
          performerProfileId: 1,
          albumType: 0,
          premiumContent: false,
          price: 0,
          totalLike: 0,
          totalComment: 0,
          assets: [
            {
              id: 10,
              assetName: 'Approved Photo',
              albumId: 1,
              assetType: 1,
              loadDate: new Date().toISOString(),
              deactivatedDate: null,
              isActive: true,
              fileURL: 'https://example.com/approved-photo.jpg',
              fileURLThumb: 'https://example.com/thumb.jpg',
              price: 0,
              status: 3,
              assetOrder: 0,
              totalLike: 0,
              totalComment: 0,
            },
            {
              id: 20,
              assetName: 'Approved Video',
              albumId: 1,
              assetType: 2,
              loadDate: new Date().toISOString(),
              deactivatedDate: null,
              isActive: true,
              fileURL: 'https://example.com/video.mp4',
              fileURLThumb: 'https://example.com/video-thumb.jpg',
              price: 0,
              status: 3,
              assetOrder: 0,
              totalLike: 0,
              totalComment: 0,
            },
          ],
        }),
      });
    });

    // Capture patch requests
    let performerPatchRequest: any = null;
    await page.route('**/api/performers/2', (route) => {
      if (route.request().method() === 'PATCH') {
        performerPatchRequest = route.request();
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        route.continue();
      }
    });

    let profilePatchRequest: any = null;
    await page.route('**/api/performers/2/profile', (route) => {
      if (route.request().method() === 'PATCH') {
        profilePatchRequest = route.request();
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        route.continue();
      }
    });

    await page.goto('/performers');
    await page.waitForLoadState('networkidle');

    // Ensure performers list loaded
    await expect(page.locator('text=Administración de Performers')).toBeVisible({ timeout: 10000 });

    // Ensure the profile button is available and click it
    const profileButton = page.locator('button[title="Ver perfil"]').first();
    await expect(profileButton).toBeVisible({ timeout: 5000 });
    await profileButton.click();

    // Open Media profile tab
    await page.locator('button:has-text("Media profile")').click();

    // Select approved photo and assign avatar
    await page.locator('img[alt="Approved Photo"]').click();
    await page.locator('button:has-text("Asignar como avatar")').click();

    // Wait for PATCH request
    await page.waitForRequest('**/api/performers/2');
    const body = JSON.parse(await performerPatchRequest.postData() || '{}');
    expect(body).toEqual({ avatar: 'https://example.com/approved-photo.jpg' });

    // Select approved video and assign video
    await page.locator('img[alt="Approved Video"]').click();
    await page.locator('button:has-text("Asignar como video")').click();

    await page.waitForRequest('**/api/performers/2/profile');
    const profileBody = JSON.parse(await profilePatchRequest.postData() || '{}');
    expect(profileBody).toEqual({ videoAssetId: 20 });
  });
});
