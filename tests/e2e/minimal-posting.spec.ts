import { test, expect } from '@playwright/test';

test.describe('Minimal Posting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set the environment variable for minimal posting flow
    await page.addInitScript(() => {
      Object.defineProperty(window, 'process', {
        value: { env: { NEXT_PUBLIC_MINIMAL_POST_FLOW: 'true' } }
      });
    });
  });

  test('should show minimal form when flag is enabled', async ({ page }) => {
    await page.goto('/needs/new');
    
    // Check that minimal form UI is displayed
    await expect(page.locator('h2:has-text("ニーズ投稿（簡単モード）")')).toBeVisible();
    
    // Check that only title and body fields are visible
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="body"]')).toBeVisible();
    
    // Check that extended form fields are NOT visible
    await expect(page.locator('select[name="category"]')).not.toBeVisible();
    await expect(page.locator('input[name="region"]')).not.toBeVisible();
    await expect(page.locator('input[name="summary"]')).not.toBeVisible();
    await expect(page.locator('input[name="pii_email"]')).not.toBeVisible();
    await expect(page.locator('input[name="pii_phone"]')).not.toBeVisible();
    await expect(page.locator('input[name="pii_address"]')).not.toBeVisible();
  });

  test('should post minimal need with title and body only', async ({ page }) => {
    // Mock the API response
    await page.route('/api/needs', (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postData();
        const payload = JSON.parse(postData || '{}');
        
        // Verify payload contains only title and body
        expect(Object.keys(payload)).toEqual(['title', 'body']);
        
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-need-123',
            title: payload.title,
            created_at: new Date().toISOString()
          })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/needs/new');
    
    // Fill in minimal form
    await page.fill('input[name="title"]', 'Test Need Title');
    await page.fill('textarea[name="body"]', 'This is the detailed description of my need.');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should redirect to the need detail page
    await expect(page).toHaveURL('/needs/test-need-123');
  });

  test('should validate required fields in minimal mode', async ({ page }) => {
    await page.goto('/needs/new');
    
    // Try to submit with empty form
    await page.click('button[type="submit"]');
    
    // Should show validation for required fields
    const titleInput = page.locator('input[name="title"]');
    const bodyInput = page.locator('textarea[name="body"]');
    
    await expect(titleInput).toHaveAttribute('required');
    await expect(bodyInput).toHaveAttribute('required');
  });

  test('should send correct minimal API payload', async ({ page }) => {
    let requestPayload: any;
    
    // Intercept the API call to verify payload
    await page.route('/api/needs', (route) => {
      if (route.request().method() === 'POST') {
        requestPayload = JSON.parse(route.request().postData() || '{}');
        
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-need-456',
            title: requestPayload.title,
            created_at: new Date().toISOString()
          })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/needs/new');
    
    const testTitle = 'Minimal Test Need';
    const testBody = 'This is a minimal test need description.';
    
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="body"]', testBody);
    
    await page.click('button[type="submit"]');
    
    // Verify the request payload structure
    expect(requestPayload).toEqual({
      title: testTitle,
      body: testBody
    });
    
    // Verify no extra fields were sent
    expect(Object.keys(requestPayload)).toHaveLength(2);
  });

  test('should handle API errors gracefully in minimal mode', async ({ page }) => {
    // Mock API error response
    await page.route('/api/needs', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'VALIDATION_ERROR',
            details: { title: ['Title is required'] }
          })
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/needs/new');
    
    await page.fill('input[name="title"]', 'Test');
    await page.fill('textarea[name="body"]', 'Test body');
    
    // Mock alert dialog
    page.on('dialog', dialog => dialog.accept());
    
    await page.click('button[type="submit"]');
    
    // Should remain on the form page
    await expect(page).toHaveURL('/needs/new');
  });
});

test.describe('Full Posting Flow (Flag Disabled)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the minimal posting flag is disabled
    await page.addInitScript(() => {
      Object.defineProperty(window, 'process', {
        value: { env: { NEXT_PUBLIC_MINIMAL_POST_FLOW: 'false' } }
      });
    });
  });

  test('should show full form when flag is disabled', async ({ page }) => {
    await page.goto('/needs/new');
    
    // Check that full form UI is displayed
    await expect(page.locator('h2:has-text("基本情報")')).toBeVisible();
    await expect(page.locator('h2:has-text("連絡先情報")')).toBeVisible();
    
    // Check that all form fields are visible
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('select[name="category"]')).toBeVisible();
    await expect(page.locator('input[name="region"]')).toBeVisible();
    await expect(page.locator('input[name="summary"]')).toBeVisible();
    await expect(page.locator('textarea[name="body"]')).toBeVisible();
    await expect(page.locator('input[name="pii_email"]')).toBeVisible();
    await expect(page.locator('input[name="pii_phone"]')).toBeVisible();
    await expect(page.locator('input[name="pii_address"]')).toBeVisible();
    
    // Check that minimal form heading is NOT visible
    await expect(page.locator('h2:has-text("ニーズ投稿（簡単モード）")')).not.toBeVisible();
  });
});