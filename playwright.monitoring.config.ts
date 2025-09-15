// playwright.monitoring.config.ts
// Playwright configuration optimized for production monitoring

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Run only monitoring tests
  testMatch: ['**/monitoring-critical.spec.ts'],
  
  // Monitoring-specific settings
  fullyParallel: false, // Run tests sequentially for monitoring
  forbidOnly: true, // Prevent .only in CI
  retries: 2, // Retry failed tests twice
  workers: 1, // Single worker for monitoring
  timeout: 30000, // 30 second timeout
  
  // Reporter configuration for monitoring
  reporter: [
    ['json', { outputFile: 'test-results/monitoring-results.json' }],
    ['html', { outputFolder: 'test-results/monitoring-report' }],
    ['list']
  ],
  
  use: {
    // Browser settings optimized for production monitoring
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: false, // Strict HTTPS checking
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Reasonable timeouts for production
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'production-monitoring',
      use: {
        // Use Chromium for consistent monitoring results
        ...require('@playwright/test').devices['Desktop Chrome'],
      },
    },
  ],

  // Output configuration
  outputDir: 'test-results/monitoring-artifacts',
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/monitoring-setup.ts'),
});