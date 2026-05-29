const { chromium } = require('@playwright/test');

(async () => {
  let browser;
  let page;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1600 }
    });
    page = await context.newPage();

    console.log('Navigating to login page...');
    await page.goto('https://ai-neet.vercel.app/login', { waitUntil: 'load' });

    console.log('Logging in...');
    await page.fill('input[type="email"]', 'qa@neetcoach.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    console.log('Waiting for navigation to dashboard...');
    await page.waitForURL(/\/(dashboard|home|profile|$)/, { timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000)); // extra buffer

    console.log('Capturing dashboard screenshot...');
    const dashPath = '/Users/ashwanikumar/.gemini/antigravity/brain/1d4927d4-db6a-4513-ae1f-be84a49bb934/dashboard_full.png';
    await page.screenshot({ path: dashPath, fullPage: true });
    console.log('Dashboard screenshot saved to:', dashPath);

    console.log('Navigating to analytics...');
    await page.goto('https://ai-neet.vercel.app/analytics', { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    console.log('Waiting for charts to render...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('Capturing analytics screenshot...');
    const analyticsPath = '/Users/ashwanikumar/.gemini/antigravity/brain/1d4927d4-db6a-4513-ae1f-be84a49bb934/analytics_full.png';
    await page.screenshot({ path: analyticsPath, fullPage: true });

    console.log('Done! Analytics screenshot saved to:', analyticsPath);
    await browser.close();
  } catch (err) {
    console.error('Playwright capture failed:', err);
    if (page) {
      const failPath = '/Users/ashwanikumar/.gemini/antigravity/brain/1d4927d4-db6a-4513-ae1f-be84a49bb934/failure.png';
      await page.screenshot({ path: failPath }).catch(() => {});
      console.log('Diagnostic screenshot saved to:', failPath);
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
    process.exit(1);
  }
})();
