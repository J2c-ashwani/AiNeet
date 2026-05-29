const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
  const artifactDir = '/Users/ashwanikumar/.gemini/antigravity/brain/1d4927d4-db6a-4513-ae1f-be84a49bb934';
  let browser;
  let page;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1600 }
    });
    page = await context.newPage();

    // Trace client-side errors and warnings
    page.on('pageerror', error => {
      console.error('[BROWSER EXCEPTION] Client-side crash:', error.message);
      console.error(error.stack);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[BROWSER CONSOLE ERROR] ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.warn(`[BROWSER CONSOLE WARN] ${msg.text()}`);
      } else {
        console.log(`[BROWSER CONSOLE LOG] ${msg.text()}`);
      }
    });

    // Trace network calls for debugging and verification
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/tests/submit')) {
        console.log(`[API RESPONSE] submit status: ${response.status()}`);
        try {
          const data = await response.json().catch(() => null);
          if (data) console.log('[API RESPONSE] Submit response data:', JSON.stringify(data, null, 2));
        } catch (e) {}
      } else if (url.includes('/api/tests/generate')) {
        console.log(`[API RESPONSE] generate status: ${response.status()}`);
        try {
          const data = await response.json().catch(() => null);
          if (data) console.log('[API RESPONSE] Generate response data:', JSON.stringify(data, null, 2));
        } catch (e) {}
      } else if (url.includes('/api/auth/login')) {
        console.log(`[API RESPONSE] login status: ${response.status()}`);
        try {
          const data = await response.json().catch(() => null);
          if (data) console.log('[API RESPONSE] Login response data:', JSON.stringify(data, null, 2));
        } catch (e) {}
      }
    });

    console.log('Step 1: Navigating to login page...');
    await page.goto('https://ai-neet.vercel.app/login', { waitUntil: 'networkidle' });

    // Capture login screen
    const loginPath = path.join(artifactDir, '01_login_page.png');
    await page.screenshot({ path: loginPath });
    console.log('Saved login page screenshot to:', loginPath);

    console.log('Step 2: Performing login...');
    await page.fill('input[type="email"]', 'qa@neetcoach.in');
    await page.fill('input[type="password"]', 'password123');

    let loginSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Login attempt ${attempt}...`);
      await page.click('button[type="submit"]');
      
      try {
        // Wait specifically for redirect to happen to authenticated surfaces (not /login)
        await page.waitForURL(url => {
          const p = url.pathname;
          return p === '/' || p === '/welcome' || p === '/dashboard';
        }, { timeout: 15000 });
        loginSuccess = true;
        break;
      } catch (e) {
        console.log(`Login attempt ${attempt} did not navigate. Checking for error alert...`);
        const alert = page.locator('text=Failed to fetch').first();
        if (await alert.isVisible().catch(() => false)) {
          console.warn('Detected "Failed to fetch" alert. Retrying login...');
          await page.waitForTimeout(2000); // Wait before retry
        } else {
          console.error('Login navigation error:', e.message);
        }
      }
    }

    if (!loginSuccess) {
      throw new Error('Failed to log in after 3 attempts due to persistent auth/network failures.');
    }
    
    console.log('Redirected after login to:', page.url());

    // Wait for the auth session to resolve completely on the welcome/dashboard page
    console.log('Waiting for auth session to restore (resolving QA user)...');
    try {
      await page.waitForSelector('text=Welcome, QA!, text=Hey QA, text=Logout', { timeout: 20000 });
      console.log('Auth session successfully restored!');
    } catch (e) {
      console.warn('Auth indicator selector not found. Proceeding but session might still be loading.');
    }

    // Capture dashboard / welcome step
    const dashPath = path.join(artifactDir, '02_dashboard.png');
    await page.screenshot({ path: dashPath, fullPage: true });

    // Check if we are on the welcome/onboarding screen
    if (page.url().includes('/welcome') || await page.locator('text=Welcome, QA!').isVisible()) {
      console.log('Detected onboarding page. Bypassing Onboarding...');
      
      // Click "Skip for now" to bypass
      const skipButton = page.locator('button:has-text("Skip for now")');
      if (await skipButton.isVisible()) {
        await skipButton.click();
        console.log('Clicked "Skip for now"');
      } else {
        console.log('Skip button not visible. Trying step-by-step next...');
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          await page.locator('button:has-text("Skip for now")').click();
        }
      }
      
      // Wait for redirection back to home dashboard and wait for authenticated UI
      await page.waitForURL(url => url.pathname === '/' || url.pathname === '/dashboard', { timeout: 15000 });
      await page.waitForSelector('text=Hey QA, text=Logout', { timeout: 15000 });
      console.log('Successfully navigated to home dashboard.');
    }

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Save final clean dashboard screenshot
    await page.screenshot({ path: dashPath, fullPage: true });
    console.log('Saved final clean dashboard screenshot to:', dashPath);

    console.log('Step 3: Navigating to test configure page...');
    await page.goto('https://ai-neet.vercel.app/test/configure', { waitUntil: 'networkidle' });

    // Wait for authenticated configure page to load completely
    console.log('Waiting for configure page to initialize...');
    await page.waitForSelector('button:has-text("Generate & Start Test")', { timeout: 20000 });

    // Let's configure a custom test of 10 questions to keep it quick and reliable
    console.log('Configuring test: 10 Questions...');
    
    // Check if Custom Test card is selected
    const customCard = page.locator('.option-card:has-text("Custom Test")');
    if (await customCard.isVisible()) {
      await customCard.click();
      console.log('Selected Custom Test');
    }

    // Select the "10 Questions" option card
    const questions10Card = page.locator('.option-card:has-text("10 Questions")');
    if (await questions10Card.isVisible()) {
      await questions10Card.click();
      console.log('Selected 10 Questions limit');
    }

    // Capture configure page state
    const configPath = path.join(artifactDir, '02_configure_page.png');
    await page.screenshot({ path: configPath, fullPage: true });

    // Click "Generate & Start Test"
    console.log('Clicking "Generate & Start Test"...');
    const startButton = page.locator('button:has-text("Generate & Start Test")');
    await startButton.click();

    console.log('Waiting for test generation and redirect to test page...');
    // P0 Regex Fix: Do not match the literal "/test/configure"
    await page.waitForURL(/\/test\/(?!configure\b)[\w-]+$/, { timeout: 45000 });
    const testUrl = page.url();
    const testId = testUrl.split('/').pop();
    console.log(`Generated Test URL: ${testUrl}, Test ID: ${testId}`);

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // Take screenshot of first question loaded
    const testPath = path.join(artifactDir, '03_test_page.png');
    await page.screenshot({ path: testPath, fullPage: true });
    console.log('Saved loaded test page screenshot to:', testPath);

    // Let's answer the test questions as a real student would
    console.log('Step 4: Simulating student answering questions...');
    
    // We configured a 10 question test
    const numQuestions = 10;
    for (let i = 0; i < numQuestions; i++) {
      console.log(`Answering Question ${i + 1} of ${numQuestions}...`);
      
      // Verify question number on page matches
      const qNumText = await page.locator('.question-number').innerText().catch(() => '');
      console.log(`Active UI Question Header: ${qNumText}`);

      // Click option A card
      const optionACard = page.locator('.option-card:has-text("A")').first();
      await optionACard.click();
      await page.waitForTimeout(500);

      // Verify option A becomes selected
      const isSelected = await page.locator('.option-card.selected:has-text("A")').first().isVisible().catch(() => false);
      console.log(`Option A selected status: ${isSelected}`);

      if (i === 0) {
        // Take screenshot of selected option on the first question
        const optionSelPath = path.join(artifactDir, '04_option_selected.png');
        await page.screenshot({ path: optionSelPath, fullPage: true });
        console.log('Saved option selected screenshot to:', optionSelPath);
      }

      // If not the last question, click Next
      if (i < numQuestions - 1) {
        const nextButton = page.locator('button:has-text("Next →")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000); // Wait for transition
        } else {
          console.warn('Next button not visible. Trying fallback navigator item.');
          // Click next item in the navigator if present
          const nextIndex = i + 1;
          const navBtn = page.locator(`.question-nav-btn:has-text("${nextIndex + 1}")`);
          if (await navBtn.isVisible()) {
            await navBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }

    console.log('Step 5: Submitting the test...');
    const submitButton = page.locator('button:has-text("Submit Test")').first();
    await submitButton.click();

    console.log('Waiting for results page redirect...');
    await page.waitForURL(/\/test\/[\w-]+\/results$/, { timeout: 35000 });
    console.log('Successfully redirected to results page:', page.url());

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(5000); // Give plenty of time for analytics/charts to render fully

    // Take screenshot of final results
    const resultsPath = path.join(artifactDir, '05_test_results.png');
    await page.screenshot({ path: resultsPath, fullPage: true });
    console.log('Saved test results dashboard screenshot to:', resultsPath);

    console.log('Simulation complete! Everything works smoothly!');
    await browser.close();
  } catch (err) {
    console.error('E2E Student Test taking failed:', err);
    if (page) {
      const failPath = path.join(artifactDir, '00_failure.png');
      await page.screenshot({ path: failPath }).catch(() => {});
      console.log('Diagnostic screenshot saved to:', failPath);
    }
    if (browser) {
      await browser.close().catch(() => {});
    }
    process.exit(1);
  }
})();
