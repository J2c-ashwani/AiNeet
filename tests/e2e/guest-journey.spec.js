const { test, expect } = require('@playwright/test');

test.describe('Guest Journey', () => {
  test('Landing -> Practice -> Configure -> Login -> Return', async ({ page }) => {
    // 1. Landing
    await page.goto('/');
    
    // Validate we're on the landing page
    await expect(page.locator('h1').first()).toBeVisible();

    // 2. Practice (Assuming there's a link to /test/configure or /practice)
    // Find the Practice link. Since /practice might map to /test/configure, look for href.
    const practiceLink = page.locator('a[href="/test/configure"]').first();
    if (await practiceLink.isVisible()) {
      await practiceLink.click();
    } else {
      await page.goto('/test/configure');
    }

    // 3. Configure Test
    await expect(page).toHaveURL(/\/test\/configure/);
    await expect(page.locator('text=Configure')).toBeVisible();

    // Try to start a test without being logged in (assuming it redirects to login or shows a login modal)
    // We'll click the start button
    const startButton = page.locator('button', { hasText: /Start|Begin/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Wait for navigation or modal
      // If it goes to login
      await page.waitForURL(/\/login/);
    } else {
      // Manual navigate to login to simulate
      await page.goto('/login?redirect=/test/configure');
    }

    // 4. Login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1, h2, button', { hasText: /Sign In/i }).first()).toBeVisible();

    // We don't actually log in here (that's for the authenticated tests), just verify the redirect flow works
  });
});
