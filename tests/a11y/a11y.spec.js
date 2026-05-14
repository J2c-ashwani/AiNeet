const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('@axe-core/playwright');

const ROUTES = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/leaderboard'
];

test.describe('Accessibility (a11y) Governance', () => {
  for (const route of ROUTES) {
    test(`Page ${route} should not have automatically detectable accessibility violations`, async ({ page }) => {
      await page.goto(route);
      await injectAxe(page);

      // We explicitly exclude the splash screen if it's still animating
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
    });
  }
});
