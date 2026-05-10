const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 2000 });

  console.log('Navigating to login page...');
  await page.goto('https://ai-neet.vercel.app/login', { waitUntil: 'networkidle0' });

  console.log('Logging in...');
  await page.type('input[type="email"]', 'jhasalcreativepeople@gmail.com');
  await page.type('input[type="password"]', 'JaiShreeRam@123');
  await page.click('button[type="submit"]');

  console.log('Waiting for navigation to dashboard...');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  console.log('Navigating to analytics...');
  await page.goto('https://ai-neet.vercel.app/analytics', { waitUntil: 'networkidle0' });

  console.log('Waiting for charts to render...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('Capturing screenshot...');
  const path = '/Users/ashwanikumar/.gemini/antigravity/brain/3cd9a5d1-349a-4c01-8fad-2dbac6e523ef/dashboard_graphs_full.png';
  await page.screenshot({ path, fullPage: true });

  console.log('Done! Screenshot saved to:', path);
  await browser.close();
})();
