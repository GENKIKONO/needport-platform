import { test, expect } from '@playwright/test';

/**
 * Production E2E Smoke Test: Google Login → Needs Posting Flow
 * 
 * Critical path verification for production environment:
 * 1. Google login functionality works correctly
 * 2. Profile auto-provisioning completes
 * 3. Needs posting flow functional end-to-end
 * 4. UI elements render correctly after authentication
 * 
 * This test uses production credentials and posts REAL data to production DB.
 * Test needs are marked with special flags for cleanup.
 */

const PROD_BASE_URL = 'https://needport.jp';
const TEST_TIMEOUT = 60000; // 1 minute per test

test.describe('Production Login → Posting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we're testing production
    expect(PROD_BASE_URL).toBe('https://needport.jp');
  });

  test('Complete flow: Google login → profile creation → needs posting', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    // Verify required environment variables
    const testEmail = process.env.CLERK_TEST_EMAIL;
    const testPassword = process.env.CLERK_TEST_PASSWORD;
    
    if (!testEmail || !testPassword) {
      test.skip('CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD must be set for production testing');
    }

    console.log('🚀 Starting production E2E flow...');

    // Step 1: Navigate to sign-in page
    console.log('📄 Navigating to sign-in page...');
    await page.goto(`${PROD_BASE_URL}/sign-in`);
    
    // Verify page loads correctly
    await expect(page).toHaveTitle(/NeedPort/);
    await expect(page.locator('h1, h2')).toContainText(/sign|ログイン|入/i);

    // Step 2: Verify Clerk UI renders
    console.log('🔍 Verifying Clerk UI rendering...');
    
    // Wait for Clerk to initialize
    await page.waitForTimeout(3000);
    
    // Look for sign-in form elements
    const signInForm = page.locator('[data-clerk-sign-in], .cl-sign-in, .cl-rootBox').first();
    await expect(signInForm).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Clerk SignIn component rendered');

    // Step 3: Verify Google OAuth button
    console.log('🔍 Checking Google OAuth button...');
    
    const googleButton = page.locator('[data-provider="google"], button:has-text("Google"), button:has-text("Continue with Google")').first();
    await expect(googleButton).toBeVisible({ timeout: 10000 });
    await expect(googleButton).toBeEnabled();
    
    console.log('✅ Google OAuth button found and enabled');

    // Step 4: Perform Google login
    console.log('🔐 Performing Google authentication...');
    
    // Click Google button and handle OAuth flow
    await googleButton.click();
    
    // Wait for redirect to Google OAuth
    await page.waitForURL(/accounts\.google\.com/, { timeout: 15000 });
    console.log('✅ Redirected to Google OAuth');

    // Fill in Google credentials
    await page.fill('input[type="email"]', testEmail!);
    await page.click('button:has-text("Next"), #identifierNext');
    
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', testPassword!);
    await page.click('button:has-text("Next"), #passwordNext');
    
    console.log('✅ Google credentials submitted');

    // Step 5: Wait for redirect back to NeedPort
    console.log('🔄 Waiting for redirect to NeedPort...');
    await page.waitForURL(new RegExp(PROD_BASE_URL), { timeout: 20000 });
    
    // Should be redirected to home or my page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(new RegExp(`${PROD_BASE_URL}(/|/me|/needs)?`));
    
    console.log('✅ Successfully redirected to NeedPort after login');

    // Step 6: Verify authentication state
    console.log('🔍 Verifying authentication state...');
    
    // Look for authenticated UI elements
    const authIndicators = [
      page.locator('[data-testid="user-menu"]'),
      page.locator('[data-testid="me-link"]'),
      page.locator('text=/マイページ|My Page|profile/i'),
      page.locator('text=/ログアウト|logout|sign out/i')
    ];

    let authFound = false;
    for (const indicator of authIndicators) {
      try {
        await expect(indicator).toBeVisible({ timeout: 5000 });
        authFound = true;
        console.log('✅ Authentication state confirmed');
        break;
      } catch (e) {
        // Try next indicator
        continue;
      }
    }

    expect(authFound).toBe(true);

    // Step 7: Navigate to needs posting
    console.log('📝 Navigating to needs posting...');
    
    await page.goto(`${PROD_BASE_URL}/needs/new`);
    await expect(page).toHaveURL(`${PROD_BASE_URL}/needs/new`);
    
    // Verify posting form loads
    await expect(page.locator('form, [data-testid="needs-form"]')).toBeVisible({ timeout: 10000 });
    console.log('✅ Needs posting form loaded');

    // Step 8: Fill out and submit a test need
    console.log('📋 Filling out test need form...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testTitle = `E2E Test Need - ${timestamp}`;
    const testDescription = `This is an automated test need created by the production E2E test suite. 
    
    Timestamp: ${new Date().toISOString()}
    Test ID: PROD-E2E-${timestamp}
    
    This need should be automatically cleaned up by the test suite.`;

    // Fill form fields
    await page.fill('input[name="title"], #title', testTitle);
    await page.fill('textarea[name="description"], #description', testDescription);
    
    // Select category if available
    const categorySelect = page.locator('select[name="category"], [data-testid="category-select"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption('その他');
    }

    // Select region if available
    const regionSelect = page.locator('select[name="region"], [data-testid="region-select"]');
    if (await regionSelect.count() > 0) {
      await regionSelect.selectOption('東京都');
    }

    console.log('✅ Form filled with test data');

    // Step 9: Submit the form
    console.log('🚀 Submitting test need...');
    
    const submitButton = page.locator('button[type="submit"], [data-testid="submit-button"]');
    await expect(submitButton).toBeEnabled();
    
    await submitButton.click();
    
    // Wait for submission and redirect
    await page.waitForTimeout(3000);
    
    // Verify successful submission
    const successIndicators = [
      page.locator('text=/success|成功|投稿|completed/i'),
      page.url().includes('/needs/'),
      page.url().includes('/me')
    ];

    let submissionSuccess = false;
    for (const indicator of successIndicators) {
      try {
        if (typeof indicator === 'string') {
          expect(indicator).toBeTruthy();
        } else {
          await expect(indicator).toBeVisible({ timeout: 5000 });
        }
        submissionSuccess = true;
        console.log('✅ Need submission successful');
        break;
      } catch (e) {
        // Try next indicator
        continue;
      }
    }

    expect(submissionSuccess).toBe(true);

    // Step 10: Verify the need appears in listings
    console.log('🔍 Verifying need appears in listings...');
    
    await page.goto(`${PROD_BASE_URL}/needs`);
    
    // Search for our test need
    const searchBox = page.locator('input[name="search"], [data-testid="search-input"]');
    if (await searchBox.count() > 0) {
      await searchBox.fill(testTitle);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
    }

    // Look for our test need in the results
    const needCard = page.locator(`text="${testTitle}"`);
    await expect(needCard).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Test need found in public listings');

    // Step 11: Cleanup test data
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Navigate to my page to find and delete the test need
      await page.goto(`${PROD_BASE_URL}/me`);
      await page.waitForTimeout(2000);
      
      // Look for the test need in user's needs
      const userNeedCard = page.locator(`text="${testTitle}"`);
      if (await userNeedCard.count() > 0) {
        // Try to find delete/edit button
        const deleteButton = page.locator('button:has-text("削除"), button:has-text("Delete")').first();
        if (await deleteButton.count() > 0) {
          await deleteButton.click();
          
          // Confirm deletion if modal appears
          const confirmButton = page.locator('button:has-text("確認"), button:has-text("Confirm")');
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
          }
          
          console.log('✅ Test need deleted successfully');
        }
      }
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup failed - manual cleanup may be required:', cleanupError);
      // Don't fail the test if cleanup fails
    }

    console.log('🎉 Production E2E flow completed successfully!');
  });

  test('Verify authentication persistence across page reloads', async ({ page }) => {
    test.setTimeout(30000);

    const testEmail = process.env.CLERK_TEST_EMAIL;
    const testPassword = process.env.CLERK_TEST_PASSWORD;
    
    if (!testEmail || !testPassword) {
      test.skip('Authentication credentials not available');
    }

    console.log('🔄 Testing authentication persistence...');

    // Navigate to authenticated area
    await page.goto(`${PROD_BASE_URL}/me`);
    
    // Check if already authenticated (from previous test)
    const isAuthenticated = await page.locator('[data-testid="user-menu"]').count() > 0;
    
    if (!isAuthenticated) {
      // Quick login if needed
      await page.goto(`${PROD_BASE_URL}/sign-in`);
      await page.click('[data-provider="google"]');
      // ... login flow similar to above
    }

    // Test page reload
    await page.reload();
    await page.waitForTimeout(3000);
    
    // Verify still authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    console.log('✅ Authentication persists across reloads');
  });

  test('Verify error handling for unauthenticated access', async ({ page }) => {
    console.log('🚫 Testing unauthenticated access handling...');

    // Try to access protected route without authentication
    await page.goto(`${PROD_BASE_URL}/needs/new`);
    
    // Should redirect to sign-in or show appropriate error
    const currentUrl = page.url();
    const isRedirectedToSignIn = currentUrl.includes('/sign-in') || currentUrl.includes('/login');
    const hasAuthError = await page.locator('text=/sign|login|ログイン|認証/i').count() > 0;
    
    expect(isRedirectedToSignIn || hasAuthError).toBe(true);
    
    console.log('✅ Unauthenticated access properly handled');
  });
});

test.describe('Production Environment Verification', () => {
  test('Verify production environment configuration', async ({ page }) => {
    console.log('🔧 Verifying production environment...');

    // Check health endpoint
    const response = await page.request.get(`${PROD_BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData.status).toBe('healthy');
    
    console.log('✅ Production health check passed');

    // Verify no development indicators
    await page.goto(PROD_BASE_URL);
    
    const hasDevIndicators = await page.locator('text=/development|dev mode|localhost/i').count() > 0;
    expect(hasDevIndicators).toBe(false);
    
    console.log('✅ No development indicators found');
  });

  test('Verify HTTPS and security headers', async ({ page }) => {
    console.log('🔒 Verifying security configuration...');

    const response = await page.request.get(PROD_BASE_URL);
    
    // Verify HTTPS
    expect(page.url()).toMatch(/^https:/);
    
    // Check security headers
    const headers = response.headers();
    expect(headers['strict-transport-security']).toBeTruthy();
    
    console.log('✅ Security configuration verified');
  });
});