import { test, expect } from '@playwright/test';

const sampleOnboarding = {
  id: 2,
  firstName: 'Luis',
  middleName: 'Gabriel Corredor',
  lastName: 'Combita',
  emailAddress: 'luis.corredor@macrodatum.com',
  nickName: 'luis',
  birthDate: '1978-07-16T00:00:00.000Z',
  countryCode: 'CO',
  gender: 1,
  requestDate: '2025-12-17T23:29:59.200Z',
  performerId: 2,
  studioId: 2,
  identificationNumber: '79999378',
  identificationType: 'CE',
  statusCardFrontFile: 2,
  statusCardBackFile: 2,
  statusCardFrontFaceFile: 2,
  statusCardBackFaceFile: 2,
  statusProfileImageFile: 2,
  statusOnboarding: null,
  notes: null,
  sign: 'https://example.com/sign.png',
  signedAt: null,
  securityRequest: null,
  requestDocuments: [
    {
      id: 7,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc1.png',
      documentType: 1,
      documentName: 'Front',
      loadDate: new Date().toISOString(),
    },
    {
      id: 8,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc2.png',
      documentType: 2,
      documentName: 'Back',
      loadDate: new Date().toISOString(),
    },
    {
      id: 9,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc3.png',
      documentType: 3,
      documentName: 'FrontFace',
      loadDate: new Date().toISOString(),
    },
    {
      id: 10,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc4.png',
      documentType: 4,
      documentName: 'BackFace',
      loadDate: new Date().toISOString(),
    },
    {
      id: 11,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc5.png',
      documentType: 5,
      documentName: 'ProfileImage',
      loadDate: new Date().toISOString(),
    },
    {
      id: 12,
      requestPerformerId: 2,
      fileName: 'https://example.com/contract.png',
      documentType: 6,
      documentName: 'Contract',
      loadDate: new Date().toISOString(),
    },
  ],
};

test.describe('Onboarding Modal UI', () => {
  test.skip('opens modal, previews document, approves and rejects', async ({ page }) => {
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
              lastName: 'Combita',
              email: 'luis.corredor@macrodatum.com',
              studioId: 2,
              status: 0,
              appUserId: 'abc',
              performerProfile: { id: 1, performerId: 2, nickName: 'luis' },
            },
          ],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    });

    // Mock onboarding endpoint
    await page.route('**/api/performer/onboarding/request/2**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleOnboarding),
      });
    });

    // Intercept decision PATCH and reply using the posted payload (statusOnboarding)
    await page.route('**/api/performer/onboarding/*/decision**', async (route) => {
      if (route.request().method() === 'PATCH') {
        const post = await route.request().postDataJSON();
        const status = post?.statusOnboarding ?? sampleOnboarding.statusOnboarding;
        const resp = { ...sampleOnboarding, statusOnboarding: status };
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) });
      } else {
        route.continue();
      }
    });

    // Inject auth
    await page.addInitScript(() => {
      window.sessionStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: { jwt: 'test-jwt', user: { id: 'admin' }, isLoggedIn: true },
          version: 0,
        })
      );
    });

    await page.goto('/performers');

    // Ensure at least one performer row is rendered, then click onboarding button
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });

    const onboardingBtn = page.locator('button[title="View Onboarding"]');
    await expect(onboardingBtn.first()).toBeVisible({ timeout: 10000 });
    await onboardingBtn.first().click();

    // Modal should appear
    await expect(page.locator('text=Onboarding')).toBeVisible();
    await expect(page.locator('text=Documents')).toBeVisible();

    // Documents should show
    await expect(page.locator('text=Front')).toBeVisible();
    await expect(page.locator('text=ProfileImage')).toBeVisible();

    // Click document to open preview
    await page.locator('img[alt="Front"]').click();
    await expect(page.locator('button[aria-label="Close preview"]')).toBeVisible();

    // Close preview
    await page.locator('button[aria-label="Close preview"]').click();

    // Approve flow
    await page.locator('button:has-text("Approve Registration")').click();
    await expect(page.locator('text=Confirm Approval')).toBeVisible();
    await page.locator('button:has-text("Approve")').click();

    await expect(page.locator('text=Registration approved')).toBeVisible();

    // Reject flow
    await page.locator('button:has-text("Reject Registration")').click();
    await page.locator('textarea').fill('Reason: illegible document');
    await page.locator('button:has-text("Confirm Rejection")').click();

    await expect(page.locator('text=Registration rejected')).toBeVisible();
  });
});
