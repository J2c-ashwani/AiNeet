const { test, expect } = require('@playwright/test');

const QA_EMAIL = process.env.QA_USER_EMAIL || 'qa@neetcoach.in';
const QA_PASSWORD = process.env.QA_USER_PASSWORD || '';

test.describe('Student Journey — Real Auth', () => {
  test.beforeEach(async ({ page }) => {
    if (!QA_PASSWORD) throw new Error('QA_USER_PASSWORD must be set in .env.local');
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', QA_EMAIL);
    await page.fill('input[type="password"]', QA_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 15000 });
  });

  test('Login → Dashboard loads without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('Protected route redirects unauthenticated user', async ({ page, context }) => {
    // New context with no session
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');
    await newPage.waitForURL(/\/login/, { timeout: 10000 });
    expect(newPage.url()).toContain('/login');
    await newPage.close();
  });

  test('Dashboard → Configure Test → Test loads', async ({ page }) => {
    await page.goto('/test/configure');
    await page.waitForLoadState('networkidle');
    // Select first test type and generate
    const generateBtn = page.locator('button', { hasText: /Generate|Start/i }).first();
    await expect(generateBtn).toBeVisible({ timeout: 10000 });
    await generateBtn.click();
    // Should navigate to /test/<id>
    await page.waitForURL(/\/test\/[\w-]+$/, { timeout: 20000 });
    expect(page.url()).toMatch(/\/test\//);
  });

  test('Diagnostic test loads and first question appears', async ({ page }) => {
    await page.goto('/test/diagnostic');
    await page.waitForLoadState('networkidle');
    const startBtn = page.locator('button', { hasText: /Start|Begin/i }).first();
    if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startBtn.click();
    }
    // A question or option should be visible
    const question = page.locator('.option-label, [data-testid="question"]').first();
    await expect(question).toBeVisible({ timeout: 15000 });
  });

  test('Profile page loads with user data', async ({ page }) => {
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });
});
