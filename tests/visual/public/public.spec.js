const { test, expect, waitForFonts } = require('../fixtures');

test.describe('Public Pages UI', () => {
  test('Home Page', async ({ page }) => {
    await page.goto('/');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
  });

  test('Login Page', async ({ page }) => {
    await page.goto('/login');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
  });

  test('Pricing Page', async ({ page }) => {
    await page.goto('/pricing');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('pricing-page.png', { fullPage: true });
  });

  test('404 Not Found', async ({ page }) => {
    await page.goto('/non-existent-page-for-404-test');
    await waitForFonts(page);
    await expect(page).toHaveScreenshot('404-page.png', { fullPage: true });
  });
});
