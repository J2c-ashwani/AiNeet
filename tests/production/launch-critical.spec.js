const { test, expect } = require('@playwright/test');

const QA_EMAIL = process.env.QA_USER_EMAIL || process.env.E2E_QA_EMAIL || '';
const QA_PASSWORD = process.env.QA_USER_PASSWORD || process.env.E2E_QA_PASSWORD || '';
const REQUIRE_AUTH = process.env.E2E_REQUIRE_AUTH === 'true';
const MUTATION_DRILLS = process.env.E2E_ENABLE_MUTATION_DRILLS === 'true';

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/pricing',
  '/leaderboard',
  '/ncert',
  '/test/diagnostic',
];

function installStrictGuards(page) {
  const failures = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const isNoise = /favicon|ResizeObserver loop|Failed to load resource: the server responded with a status of 404.*manifest|Failed to fetch|TypeError: Failed to fetch|TypeError: Load failed|Failed to load chunk|status of 429|status of 404/i.test(text);
    const isHydration = /hydration|did not match|server html|client html/i.test(text);
    if ((msg.type() === 'error' || isHydration) && !isNoise) {
      failures.push(`console:${msg.type()}: ${text}`);
    }
  });

  page.on('pageerror', (error) => {
    const isNoise = /access control checks|Failed to fetch|TypeError: Failed to fetch|TypeError: Load failed/i.test(error.message);
    if (!isNoise) {
      failures.push(`pageerror: ${error.message}`);
    }
  });

  page.on('requestfailed', (request) => {
    const url = request.url();
    const type = request.resourceType();
    const failure = request.failure()?.errorText || 'unknown';
    const ignored = ['image', 'font', 'media'].includes(type);
    const isAborted = failure === 'net::ERR_ABORTED' || failure === 'cancelled' || failure.includes('abort');
    if (!ignored && !isAborted && url.includes(new URL(page.url()).host)) {
      failures.push(`requestfailed: ${request.method()} ${url} ${failure}`);
    }
  });

  return async function assertClean() {
    await page.waitForTimeout(500);
    expect(failures, failures.join('\n')).toEqual([]);
  };
}

async function assertPageHealthy(page) {
  await expect(page.locator('body')).toBeVisible();
  const fatalText = page.getByText(/application error|internal server error|something went wrong/i);
  await expect(fatalText).toHaveCount(0);
}

async function login(page) {
  if (!QA_EMAIL || !QA_PASSWORD) {
    throw new Error('QA_USER_EMAIL and QA_USER_PASSWORD are required for production authenticated certification.');
  }

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"]', QA_EMAIL);
  await page.fill('input[type="password"]', QA_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|home|profile|$)/, { timeout: 20_000 });
}

test.beforeAll(() => {
  if (REQUIRE_AUTH && (!QA_EMAIL || !QA_PASSWORD)) {
    throw new Error('E2E_REQUIRE_AUTH=true requires QA_USER_EMAIL and QA_USER_PASSWORD.');
  }
});

test.describe('Public launch smoke', () => {
  for (const route of publicRoutes) {
    test(`${route} renders without launch-blocking browser failures`, async ({ page }) => {
      const assertClean = installStrictGuards(page);
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await assertPageHealthy(page);
      await assertClean();
    });
  }
});

test.describe('Authenticated launch certification', () => {
  test.skip(!REQUIRE_AUTH && (!QA_EMAIL || !QA_PASSWORD), 'Set QA_USER_EMAIL and QA_USER_PASSWORD for authenticated production certification.');

  test('login, session restore, dashboard, and logout stay stable', async ({ page, context }) => {
    const assertClean = installStrictGuards(page);
    await login(page);
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await assertPageHealthy(page);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/login/);

    const secondPage = await context.newPage();
    const secondAssertClean = installStrictGuards(secondPage);
    await secondPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(secondPage).not.toHaveURL(/\/login/);
    await assertPageHealthy(secondPage);
    await secondAssertClean();
    await secondPage.close();

    const logout = page.getByRole('button', { name: /logout|sign out/i }).or(page.getByRole('link', { name: /logout|sign out/i })).first();
    if (await logout.isVisible().catch(() => false)) {
      await logout.click();
      await page.waitForURL(/\/login|\/$/, { timeout: 10_000 }).catch(() => {});
    }
    await assertClean();
  });

  test('core student surfaces load after authentication', async ({ page }) => {
    const assertClean = installStrictGuards(page);
    await login(page);

    for (const route of ['/dashboard', '/test/configure', '/profile', '/leaderboard', '/ncert']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await assertPageHealthy(page);
    }

    await assertClean();
  });

  test('test generation drill is controlled and explicit', async ({ page }) => {
    test.skip(!MUTATION_DRILLS, 'Set E2E_ENABLE_MUTATION_DRILLS=true to create/submit real production test data.');

    const assertClean = installStrictGuards(page);
    await login(page);
    await page.goto('/test/configure', { waitUntil: 'domcontentloaded' });
    const start = page.getByRole('button', { name: /generate|start|begin/i }).first();
    await expect(start).toBeVisible({ timeout: 10_000 });
    await start.click();
    await page.waitForURL(/\/test\/[\w-]+$/, { timeout: 30_000 });
    await assertPageHealthy(page);
    await assertClean();
  });
});
