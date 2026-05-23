const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env.local'), override: true });

const baseURL = process.env.E2E_BASE_URL || 'https://ai-neet.vercel.app';

module.exports = defineConfig({
  testDir: './tests/production',
  fullyParallel: false,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-production', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: false,
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
  projects: [
    {
      name: 'desktop-production',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'tablet-production',
      use: { ...devices['iPad Pro 11'], viewport: { width: 834, height: 1194 } },
    },
    {
      name: 'android-production',
      use: { ...devices['Pixel 5'], viewport: { width: 393, height: 851 } },
    },
  ],
});
