import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

(async () => {
  console.log('Starting Battleground Console and Exception Diagnostics...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Listen to console logs
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  // Listen to page errors
  page.on('pageerror', err => {
    console.error(`[PAGE ERROR] ${err.stack}`);
  });

  try {
    // 1. Log in
    console.log('Action: Logging in...');
    await page.goto('https://ai-neet.vercel.app/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'qa@neetcoach.in');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(url => url.pathname === '/' || url.pathname === '/dashboard', { timeout: 15000 });
    console.log(`Logged in successfully. URL: ${page.url()}`);

    // 2. Navigate to /battleground
    console.log('Action: Navigating to /battleground...');
    await page.goto('https://ai-neet.vercel.app/battleground', { waitUntil: 'load' });
    
    console.log('Waiting 10 seconds to collect console messages and page errors...');
    await page.waitForTimeout(10000);

  } catch (err) {
    console.error('Error during diagnostic:', err);
  } finally {
    await browser.close();
  }
})();
