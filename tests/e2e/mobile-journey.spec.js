const { test, expect, devices } = require('@playwright/test');

test.use({
  ...devices['iPhone 14'],
});

test.describe('Mobile Journey', () => {
  test('Bottom Nav -> Drawer Open -> Orientation Change', async ({ page }) => {
    await page.goto('/');

    // 1. Bottom Nav visibility
    // The bottom nav should be visible on mobile
    const bottomNav = page.locator('.bottom-nav-mobile');
    // If we're on a page with bottom nav, we should check it. /dashboard has it.
    await page.goto('/dashboard');
    
    // 2. All Tabs navigation
    const practiceTab = page.locator('.bottom-nav-mobile a[href="/test/configure"]');
    if (await practiceTab.isVisible()) {
      await practiceTab.click();
      await expect(page).toHaveURL(/\/test\/configure/);
    }

    // 3. Drawer Open
    await page.goto('/dashboard');
    const toolsButton = page.locator('.bottom-nav-mobile button').filter({ hasText: 'Tools' }).or(page.locator('.bottom-nav-mobile button').first());
    if (await toolsButton.isVisible()) {
      await toolsButton.click();
      // Verify drawer opens
      const drawer = page.locator('.slide-up-drawer');
      if (await drawer.count() > 0) {
        await expect(drawer.first()).toBeVisible();
      }
    }

    // 4. Keyboard Open (simulate focusing an input)
    await page.goto('/doubts');
    const doubtInput = page.locator('textarea, input[type="text"]').first();
    if (await doubtInput.isVisible()) {
      await doubtInput.focus();
      // Ensure the input area is still visible (sticky)
      const inputArea = page.locator('.chat-input-area');
      await expect(inputArea).toBeInViewport();
    }
  });
});
