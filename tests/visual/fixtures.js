const { test: base, expect } = require('@playwright/test');

// Create a custom fixture that automatically stabilizes the UI
const test = base.extend({
  page: async ({ page }, use) => {
    // 1. Stabilize network: Mock dates, random IDs, or tracking pixels if necessary
    await page.route('**/api/telemetry/**', route => route.abort());
    await page.route('https://www.google-analytics.com/**', route => route.abort());
    
    // Inject animation freeze attribute
    await page.addInitScript(() => {
      document.documentElement.setAttribute('data-test-visual', 'true');
      
      // Mock Math.random to stabilize generated IDs/Layouts if any
      const originalRandom = Math.random;
      Math.random = () => 0.42;
      
      // Freeze Date
      const constantDate = new Date('2026-05-01T12:00:00Z');
      Date.now = () => constantDate.getTime();
    });

    // We let the page go to the test URL first in individual tests,
    // so we can't await document.fonts.ready here. We provide a helper.

    await use(page);
  },
});

async function waitForFonts(page) {
    await page.evaluate(async () => {
        await document.fonts.ready;
    });
}

module.exports = { test, expect, waitForFonts };
