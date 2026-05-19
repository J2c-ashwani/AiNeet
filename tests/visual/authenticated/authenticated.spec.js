const { test, expect, waitForFonts } = require('../fixtures');

// QA credentials — set QA_USER_EMAIL and QA_USER_PASSWORD in .env.local
// Never use a real student account for E2E tests
const QA_EMAIL = process.env.QA_USER_EMAIL || 'qa@neetcoach.in';
const QA_PASSWORD = process.env.QA_USER_PASSWORD || '';

if (!QA_PASSWORD) {
  throw new Error('QA_USER_PASSWORD must be set in .env.local before running authenticated E2E tests');
}

test.describe('Authenticated Pages UI', () => {
  // Authenticate before all tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    // Real Supabase login — do not use mock JWT for launch certification
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', QA_EMAIL);
    await page.fill('input[type="password"]', QA_PASSWORD);
    await page.click('button[type="submit"]');
    // Wait for successful redirect — dashboard or home
    await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 15000 });
  });

  test('Dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true });
  });

  test('Mistake Notebook', async ({ page }) => {
    await page.goto('/mistakes');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('mistakes.png', { fullPage: true });
  });

  test('Analytics', async ({ page }) => {
    await page.goto('/analytics');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('analytics.png', { fullPage: true });
  });

  test('Leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('leaderboard.png', { fullPage: true });
  });

  test('Doubt Solver', async ({ page }) => {
    await page.goto('/doubts');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('doubts.png', { fullPage: true });
  });

  test('Profile', async ({ page }) => {
    await page.goto('/profile');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('profile.png', { fullPage: true });
  });
});
