# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: authenticated/authenticated.spec.js >> Authenticated Pages UI >> Dashboard
- Location: tests/visual/authenticated/authenticated.spec.js:30:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1  | const { test, expect, waitForFonts } = require('../fixtures');
  2  | 
  3  | // Seeded QA User Credentials
  4  | const QA_EMAIL = 'qa-seed@aineetcoach.com';
  5  | const QA_PASSWORD = 'password123';
  6  | 
  7  | test.describe('Authenticated Pages UI', () => {
  8  |   // Authenticate before all tests
  9  |   test.use({ storageState: { cookies: [], origins: [] } });
  10 | 
  11 |   test.beforeEach(async ({ page }) => {
  12 |     // Navigate to login
> 13 |     await page.goto('/login');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  14 |     // If there is an actual UI for this, we would fill it out:
  15 |     // await page.fill('input[type="email"]', QA_EMAIL);
  16 |     // await page.fill('input[type="password"]', QA_PASSWORD);
  17 |     // await page.click('button[type="submit"]');
  18 |     // await page.waitForURL('/dashboard');
  19 |     
  20 |     // For now, if the UI is not fully bound in the local dev environment,
  21 |     // we can inject a mock JWT or session cookie here.
  22 |     // Replace with exact app logic:
  23 |     await page.evaluate(() => {
  24 |       document.cookie = `auth_token=mock_jwt_token; path=/`;
  25 |       // Alternatively set localStorage if auth uses that
  26 |       localStorage.setItem('auth', JSON.stringify({ token: 'mock', user: { id: 'qa-user' }}));
  27 |     });
  28 |   });
  29 | 
  30 |   test('Dashboard', async ({ page }) => {
  31 |     await page.goto('/dashboard');
  32 |     await waitForFonts(page);
  33 |     await expect(page).toHaveScreenshot('dashboard.png', { fullPage: true });
  34 |   });
  35 | 
  36 |   test('Mistake Notebook', async ({ page }) => {
  37 |     await page.goto('/mistakes');
  38 |     await waitForFonts(page);
  39 |     await expect(page).toHaveScreenshot('mistakes.png', { fullPage: true });
  40 |   });
  41 | 
  42 |   test('Analytics', async ({ page }) => {
  43 |     await page.goto('/analytics');
  44 |     await waitForFonts(page);
  45 |     await expect(page).toHaveScreenshot('analytics.png', { fullPage: true });
  46 |   });
  47 | 
  48 |   test('Leaderboard', async ({ page }) => {
  49 |     await page.goto('/leaderboard');
  50 |     await waitForFonts(page);
  51 |     await expect(page).toHaveScreenshot('leaderboard.png', { fullPage: true });
  52 |   });
  53 | 
  54 |   test('Doubt Solver', async ({ page }) => {
  55 |     await page.goto('/doubts');
  56 |     await waitForFonts(page);
  57 |     await expect(page).toHaveScreenshot('doubts.png', { fullPage: true });
  58 |   });
  59 | 
  60 |   test('Profile', async ({ page }) => {
  61 |     await page.goto('/profile');
  62 |     await waitForFonts(page);
  63 |     await expect(page).toHaveScreenshot('profile.png', { fullPage: true });
  64 |   });
  65 | });
  66 | 
```