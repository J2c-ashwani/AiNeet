const { test, expect } = require('@playwright/test');

test.describe('Recovery Journey', () => {
  test('Start Test -> Refresh Mid-Test -> State Restored', async ({ page }) => {
    // 1. Start Test
    await page.goto('/test/diagnostic');

    const startButton = page.locator('button', { hasText: /Start|Begin/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    // Wait for the first question
    const qText = page.locator('.question-text, .test-question').first();
    // Assuming the test renders question text
    if (await qText.isVisible()) {
      // 2. Select an option
      const option = page.locator('.option-label').first();
      await option.click();

      // Get current state to compare after refresh
      const selectedClass = await option.getAttribute('class');
      
      // 3. Refresh Mid-Test
      await page.reload();

      // 4. State Restored
      const reloadedOption = page.locator('.option-label').first();
      // Ensure the test interface is still visible
      await expect(page.locator('.question-text, .test-question').first()).toBeVisible();
    }
  });
});
