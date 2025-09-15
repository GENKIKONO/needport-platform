import { chromium } from '@playwright/test';

/**
 * Global setup for production E2E tests
 * 
 * Validates environment variables and performs any necessary
 * pre-test setup for production testing.
 */

async function globalSetup() {
  console.log('🔧 Setting up production E2E tests...');
  
  // Validate required environment variables
  const requiredEnvVars = [
    'CLERK_TEST_EMAIL',
    'CLERK_TEST_PASSWORD'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables for production E2E tests:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables and try again.');
    process.exit(1);
  }
  
  // Basic connectivity check
  console.log('🌐 Checking production site connectivity...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://needport.jp', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Production site is accessible');
  } catch (error) {
    console.error('❌ Failed to access production site:', error);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
  console.log('🎯 Production E2E setup completed successfully');
}

export default globalSetup;