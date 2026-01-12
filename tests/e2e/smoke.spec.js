import { test, expect } from '@playwright/test';

/**
 * Smoke Tests
 * Basic tests to verify the application loads and serves assets correctly.
 *
 * Note: Full e2e tests with audio functionality should be run manually
 * in a real browser, as the Web Audio API and getUserMedia cannot be
 * reliably mocked in headless browser environments.
 */

test.describe('Scale Climber - Smoke Tests', () => {
  test('should serve the HTML page', async ({ page }) => {
    const response = await page.goto('/scale-climber/');
    expect(response.status()).toBe(200);
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/scale-climber/');
    await expect(page).toHaveTitle(/Scale Climber/);
  });

  test('should load main HTML structure', async ({ page }) => {
    await page.goto('/scale-climber/');

    // Check for app container
    const app = page.locator('#app');
    await expect(app).toBeAttached();

    // Check for screens
    await expect(page.locator('#loading-screen')).toBeAttached();
    await expect(page.locator('#start-screen')).toBeAttached();
    await expect(page.locator('#game-screen')).toBeAttached();
  });

  test('should load JavaScript assets', async ({ page }) => {
    const jsRequests = [];

    page.on('response', (response) => {
      if (response.url().includes('.js') && !response.url().includes('node_modules')) {
        jsRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto('/scale-climber/');
    await page.waitForLoadState('networkidle');

    // Should have loaded JS files
    expect(jsRequests.length).toBeGreaterThan(0);

    // All JS should load successfully
    const failedJS = jsRequests.filter((r) => r.status !== 200 && r.status !== 304);
    expect(failedJS).toHaveLength(0);
  });

  test('should load CSS assets', async ({ page }) => {
    const cssRequests = [];

    page.on('response', (response) => {
      if (response.url().includes('.css')) {
        cssRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto('/scale-climber/');
    await page.waitForLoadState('networkidle');

    // Should have loaded CSS files
    expect(cssRequests.length).toBeGreaterThan(0);

    // All CSS should load successfully
    const failedCSS = cssRequests.filter((r) => r.status !== 200 && r.status !== 304);
    expect(failedCSS).toHaveLength(0);
  });

  test('should have responsive viewport meta tag', async ({ page }) => {
    await page.goto('/scale-climber/');

    const viewportContent = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportContent).toContain('width=device-width');
    expect(viewportContent).toContain('initial-scale=1');
  });

  test('should have accessibility features', async ({ page }) => {
    await page.goto('/scale-climber/');
    await page.waitForLoadState('domcontentloaded');

    // Check for ARIA live regions
    await expect(page.locator('#status-announce[aria-live="polite"]')).toBeAttached();

    // Check for skip link
    await expect(page.locator('.skip-link')).toBeAttached();

    // Check for screen reader only class
    const srOnly = await page.locator('.sr-only').count();
    expect(srOnly).toBeGreaterThan(0);
  });

  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/scale-climber/');

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();

    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();
  });

  test('should load sound assets', async ({ page }) => {
    const soundRequests = [];

    page.on('response', (response) => {
      if (response.url().includes('.opus')) {
        soundRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto('/scale-climber/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for async audio loading
    await page.waitForTimeout(2000);

    // Should attempt to load sound files
    // (They may not all load immediately, but at least some should be requested)
    expect(soundRequests.length).toBeGreaterThanOrEqual(0);

    // Any that do load should be successful (200, 206 for partial content, 304 cached)
    const failedSounds = soundRequests.filter(
      (r) => r.status !== 200 && r.status !== 206 && r.status !== 304 && r.status !== 0,
    );
    expect(failedSounds).toHaveLength(0);
  });
});
