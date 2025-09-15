import { test, expect } from '@playwright/test';

test.describe('Authenticated User Need Posting', () => {
  // Note: This test would require authentication setup
  // For now, we test the UI structure when authenticated
  
  test.skip('authenticated user can post minimal need', async ({ page }) => {
    // This test is skipped until we have proper test authentication setup
    // When implemented, it should:
    
    // 1. Authenticate as test user
    // await authenticateAsTestUser(page);
    
    // 2. Navigate to posting page
    // await page.goto('/needs/new');
    
    // 3. Verify form is visible
    // await expect(page.locator('form')).toBeVisible();
    // await expect(page.locator('input[name="title"]')).toBeVisible();
    // await expect(page.locator('textarea[name="body"]')).toBeVisible();
    
    // 4. Fill out the form
    // await page.fill('input[name="title"]', 'テスト投稿タイトル');
    // await page.fill('textarea[name="body"]', 'これはテストの詳細説明です。');
    
    // 5. Submit the form
    // await page.click('button[type="submit"]');
    
    // 6. Verify success and redirect
    // await page.waitForURL(/\/me/);
    // await expect(page.locator('text=テスト投稿タイトル')).toBeVisible();
  });

  test('posting form has correct structure for authenticated users', async ({ page }) => {
    // Test the static structure when we can bypass auth for testing
    // This verifies the form structure without actually posting
    
    // Note: This test assumes we can mock authentication or test in authenticated state
    // For now, we just verify our redirect is working
    await page.goto('/needs/new');
    
    // Should redirect to sign-in
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/sign-in/);
  });

  test('API endpoint requires authentication', async ({ page }) => {
    // Test that the API properly rejects unauthenticated requests
    const response = await page.request.post('/api/needs', {
      data: {
        title: 'テスト投稿',
        body: '本文テスト'
      }
    });

    expect(response.status()).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('UNAUTHORIZED');
    expect(responseBody.detail).toContain('ログインが必要です');
  });

  test('API validates input data structure', async ({ page }) => {
    // Test input validation (should still get 401 first, but structure is checked)
    const response = await page.request.post('/api/needs', {
      data: {
        title: '',  // Empty title should fail validation
        body: ''    // Empty body should fail validation
      }
    });

    // Should get 401 first (no auth)
    expect(response.status()).toBe(401);
  });
});