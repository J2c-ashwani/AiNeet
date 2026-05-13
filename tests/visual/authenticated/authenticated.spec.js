const { test, expect, waitForFonts } = require('../fixtures');

// Seeded QA User Credentials
const QA_EMAIL = 'qa-seed@aineetcoach.com';
const QA_PASSWORD = 'password123';

test.describe('Authenticated Pages UI', () => {
  // Authenticate before all tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    // If there is an actual UI for this, we would fill it out:
    // await page.fill('input[type="email"]', QA_EMAIL);
    // await page.fill('input[type="password"]', QA_PASSWORD);
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/dashboard');
    
    // For now, if the UI is not fully bound in the local dev environment,
    // we can inject a mock JWT or session cookie here.
    // Replace with exact app logic:
    await page.evaluate(() => {
      document.cookie = `auth_token=mock_jwt_token; path=/`;
      // Alternatively set localStorage if auth uses that
      localStorage.setItem('auth', JSON.stringify({ token: 'mock', user: { id: 'qa-user' }}));
    });
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
