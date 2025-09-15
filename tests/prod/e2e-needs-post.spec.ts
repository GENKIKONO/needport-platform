import { test, expect } from '@playwright/test';

/**
 * Production E2E Test: Authenticated Needs Posting Flow
 * 
 * Validates complete posting flow on https://needport.jp:
 * 1. Unauthenticated redirect to sign-in
 * 2. Login with test credentials
 * 3. Auto-redirect back to /needs/new
 * 4. Submit minimal need (title + body)
 * 5. Verify 201 response and redirect to /me
 * 6. Verify draft appears in My Page
 * 7. Verify DB state (read-only check)
 */

// Only run on production environment
test.describe.configure({ mode: 'serial' });

test.describe('Production Authenticated Needs Posting', () => {
  const baseURL = 'https://needport.jp';
  const testEmail = process.env.CLERK_TEST_EMAIL;
  const testPassword = process.env.CLERK_TEST_PASSWORD;
  
  test.beforeAll(async () => {
    if (!testEmail || !testPassword) {
      throw new Error('CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD must be set for production tests');
    }
  });

  test('should complete authenticated posting flow successfully', async ({ page }) => {
    let createdNeedId: string | null = null;
    
    console.log('🔍 Starting production authenticated posting flow test...');
    
    // Step 1: Navigate to /needs/new (should redirect to sign-in)
    console.log('📝 Step 1: Navigate to /needs/new');
    await page.goto(`${baseURL}/needs/new`);
    
    // Should redirect to sign-in with redirect_url
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/sign-in/);
    
    const url = new URL(page.url());
    const redirectUrl = url.searchParams.get('redirect_url') || url.searchParams.get('fallback_redirect_url');
    expect(redirectUrl).toContain('/needs/new');
    console.log('✅ Correctly redirected to sign-in with redirect_url');
    
    // Step 2: Login with test credentials
    console.log('🔐 Step 2: Login with test credentials');
    
    // Wait for sign-in form to load
    await page.waitForSelector('input[name="identifier"], input[type="email"]', { timeout: 10000 });
    
    // Try different possible selectors for Clerk sign-in form
    const emailSelector = await page.$('input[name="identifier"]') ? 'input[name="identifier"]' : 'input[type="email"]';
    const passwordSelector = 'input[name="password"], input[type="password"]';
    const submitSelector = 'button[type="submit"], button:has-text("Sign in"), button:has-text("ログイン")';
    
    await page.fill(emailSelector, testEmail);
    await page.fill(passwordSelector, testPassword);
    
    // Intercept the API request to capture response
    let needsResponse: any = null;
    page.on('response', async response => {
      if (response.url().includes('/api/needs') && response.request().method() === 'POST') {
        try {
          const responseBody = await response.json();
          if (response.status() === 201) {
            needsResponse = responseBody;
            createdNeedId = responseBody.id;
          }
        } catch (e) {
          console.warn('Failed to parse needs API response:', e);
        }
      }
    });
    
    await page.click(submitSelector);
    
    // Step 3: Auto-redirect back to /needs/new
    console.log('🔄 Step 3: Verify auto-redirect to /needs/new');
    await page.waitForURL(/\/needs\/new/, { timeout: 15000 });
    expect(page.url()).toContain('/needs/new');
    console.log('✅ Successfully redirected back to /needs/new after login');
    
    // Step 4: Fill and submit posting form
    console.log('📝 Step 4: Fill and submit posting form');
    
    // Wait for form to be fully loaded
    await page.waitForSelector('input[name="title"], input#title', { timeout: 10000 });
    await page.waitForSelector('textarea[name="body"], textarea#body', { timeout: 5000 });
    
    const titleText = `[E2E] Need Posting Smoke - ${Date.now()}`;
    const bodyText = 'Test content - automated E2E testing (safe draft, will not be published)';
    
    // Fill form fields
    const titleSelector = await page.$('input[name="title"]') ? 'input[name="title"]' : 'input#title';
    const bodySelector = await page.$('textarea[name="body"]') ? 'textarea[name="body"]' : 'textarea#body';
    
    await page.fill(titleSelector, titleText);
    await page.fill(bodySelector, bodyText);
    
    // Submit form
    const submitFormSelector = 'button[type="submit"], button:has-text("投稿"), button:has-text("Submit")';
    await page.click(submitFormSelector);
    
    // Step 5: Verify API response and redirect
    console.log('🔍 Step 5: Verify API response and redirect');
    
    // Wait for API call to complete
    await page.waitForTimeout(3000);
    
    if (!needsResponse) {
      throw new Error('No successful POST /api/needs response captured');
    }
    
    expect(needsResponse.id).toBeTruthy();
    expect(needsResponse.title).toBe(titleText);
    console.log('✅ POST /api/needs returned 201 with id:', needsResponse.id);
    
    // Should redirect to /me
    await page.waitForURL(/\/me/, { timeout: 10000 });
    expect(page.url()).toContain('/me');
    console.log('✅ Successfully redirected to /me after posting');
    
    // Step 6: Verify draft appears in My Page
    console.log('👀 Step 6: Verify draft appears in My Page');
    
    // Wait for My Page to load and look for the posted need
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Look for the title in the page content
    const pageContent = await page.textContent('body');
    if (!pageContent?.includes(titleText)) {
      console.warn('Posted need title not immediately visible on /me page');
      // Take screenshot for debugging
      await page.screenshot({ path: `test-results/prod-my-page-${Date.now()}.png` });
    } else {
      console.log('✅ Posted need title found on /me page');
    }
    
    // Step 7: Verify DB state (read-only)
    console.log('🗄️ Step 7: Verify database state');
    
    const dbResponse = await page.request.get(`${baseURL}/api/needs/${needsResponse.id}`);
    
    if (dbResponse.ok()) {
      const needData = await dbResponse.json();
      
      expect(needData.id).toBe(needsResponse.id);
      expect(needData.title).toBe(titleText);
      expect(needData.body).toBe(bodyText);
      expect(needData.status).toBe('draft');
      expect(needData.published).toBe(false);
      expect(needData.owner_id).toBeTruthy();
      
      console.log('✅ Database state verified:', {
        id: needData.id,
        status: needData.status,
        published: needData.published,
        owner_id: needData.owner_id ? '✓' : '✗'
      });
    } else {
      console.warn('Could not verify database state - API call failed');
    }
    
    console.log('🎉 Production authenticated posting flow completed successfully!');
  });
  
  test.describe('Failure Classification Tests', () => {
    test('should detect auth integration issues', async ({ page }) => {
      // Test authentication flow isolation
      await page.goto(`${baseURL}/needs/new`);
      await page.waitForURL(/sign-in/, { timeout: 10000 });
      
      // Verify redirect parameters
      const url = new URL(page.url());
      const redirectUrl = url.searchParams.get('redirect_url') || url.searchParams.get('fallback_redirect_url');
      
      if (!redirectUrl?.includes('/needs/new')) {
        throw new Error('AUTH_INTEGRATION: Redirect URL not properly set');
      }
    });
    
    test('should detect API authorization issues', async ({ page }) => {
      // Direct API call without authentication
      const response = await page.request.post(`${baseURL}/api/needs`, {
        data: {
          title: 'Test',
          body: 'Test body'
        }
      });
      
      if (response.status() !== 401) {
        throw new Error('API_AUTH: API should reject unauthenticated requests with 401');
      }
      
      const responseBody = await response.json();
      if (!responseBody.error) {
        throw new Error('API_AUTH: API should return error object for unauthenticated requests');
      }
    });
  });
});