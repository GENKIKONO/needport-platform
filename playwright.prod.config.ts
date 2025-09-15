import { defineConfig, devices } from '@playwright/test';

/**
 * Production E2E Test Configuration
 * 
 * Specifically configured for testing against https://needport.jp
 * with real authentication and posting workflows.
 */

export default defineConfig({
  testDir: './tests/prod',
  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential for production tests
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: 1, // Single worker for production tests
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report-prod' }],
    ['json', { outputFile: 'test-results-prod/results.json' }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://needport.jp',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Longer timeouts for production environment */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Uncomment for cross-browser testing in production
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Global setup for production tests */
  globalSetup: './tests/prod/global-setup.ts',
  
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results-prod/',
  
  /* Configure timeout */
  timeout: 120000, // 2 minutes per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
});