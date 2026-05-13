# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public/public.spec.js >> Public Pages UI >> Login Page
- Location: tests/visual/public/public.spec.js:10:3

# Error details

```
Test timeout of 30000ms exceeded.
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
  3  | test.describe('Public Pages UI', () => {
  4  |   test('Home Page', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await waitForFonts(page);
  7  |     await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
  8  |   });
  9  | 
  10 |   test('Login Page', async ({ page }) => {
> 11 |     await page.goto('/login');
     |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  12 |     await waitForFonts(page);
  13 |     await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
  14 |   });
  15 | 
  16 |   test('Pricing Page', async ({ page }) => {
  17 |     await page.goto('/pricing');
  18 |     await waitForFonts(page);
  19 |     await expect(page).toHaveScreenshot('pricing-page.png', { fullPage: true });
  20 |   });
  21 | 
  22 |   test('404 Not Found', async ({ page }) => {
  23 |     await page.goto('/non-existent-page-for-404-test');
  24 |     await waitForFonts(page);
  25 |     await expect(page).toHaveScreenshot('404-page.png', { fullPage: true });
  26 |   });
  27 | });
  28 | 
```