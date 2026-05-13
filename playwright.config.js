const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  // Use a local dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // MD Directive: Mock animations to reduce flakiness
    contextOptions: {
      reducedMotion: 'reduce'
    }
  },

  expect: {
    // MD Directive: Visual Thresholds 
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'iPhone 14',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Redmi Android',
      use: {
        ...devices['Pixel 5'], // Generic Android baseline for Playwright
        viewport: { width: 393, height: 851 },
      },
    },
  ],
});
