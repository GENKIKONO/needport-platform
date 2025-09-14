// tests/e2e/needsPosting.spec.ts  
// Playwright E2E test for needs posting flow

import { test, expect } from '@playwright/test';

test.describe('Needs Posting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary test environment
    await page.goto('/');
  });

  test('should load needs posting page without authentication', async ({ page }) => {
    // Go to actual posting page (not new-simple)
    await page.goto('/needs/new');
    
    // Page should load (form is visible even without auth, but API will reject)
    await expect(page.locator('h1')).toContainText('ニーズを投稿');
    
    // Form should be visible (authentication is checked on API level)
    await expect(page.locator('form')).toBeVisible();
    
    // Basic form elements should be present
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('select[name="category"]')).toBeVisible();
    await expect(page.locator('input[name="region"]')).toBeVisible();
    await expect(page.locator('textarea[name="body"]')).toBeVisible();
  });

  test('should handle unauthenticated form submission gracefully', async ({ page }) => {
    await page.goto('/needs/new');
    
    // Monitor for API errors
    const apiErrors: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/needs') && response.status() >= 400) {
        apiErrors.push({
          url: response.url(),
          status: response.status()
        });
      }
    });
    
    // Fill out the form with test data
    await page.fill('input[name="title"]', 'Test Need Title');
    await page.selectOption('select[name="category"]', 'その他');
    await page.fill('input[name="region"]', 'Test Region');
    await page.fill('textarea[name="body"]', 'Test need description');
    
    // Try to submit without authentication
    await page.click('button[type="submit"]');
    
    // Wait for API call and error
    await page.waitForTimeout(2000);
    
    // Should get 401 Unauthorized from API
    const authErrors = apiErrors.filter(err => err.status === 401);
    expect(authErrors.length).toBeGreaterThanOrEqual(1);
    
    // Page should show some error feedback (alert or error message)
    // The page should handle the error gracefully without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate required form fields', async ({ page }) => {
    await page.goto('/needs/new');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Browser should prevent submission due to required fields
    // Check that required fields have required attribute
    await expect(page.locator('input[name="title"][required]')).toBeVisible();
    await expect(page.locator('select[name="category"][required]')).toBeVisible();
    await expect(page.locator('input[name="region"][required]')).toBeVisible();
    await expect(page.locator('textarea[name="body"][required]')).toBeVisible();
    
    // Fill minimum required fields
    await page.fill('input[name="title"]', 'Valid Title');
    await page.selectOption('select[name="category"]', 'その他');
    await page.fill('input[name="region"]', 'Valid Region');
    await page.fill('textarea[name="body"]', 'Valid description');
    
    // Now form should be submittable (though it will fail auth)
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });

  test('should return JSON errors from API, not HTML pages', async ({ page }) => {
    const apiResponses: any[] = [];
    
    // Monitor API responses
    page.on('response', async response => {
      if (response.url().includes('/api/needs')) {
        const contentType = response.headers()['content-type'] || '';
        const body = await response.text().catch(() => '');
        
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          contentType,
          isJson: contentType.includes('application/json'),
          isHtml: contentType.includes('text/html') || body.includes('<!DOCTYPE html>')
        });
      }
    });
    
    await page.goto('/needs/new');
    
    // Make direct API call that will fail (no auth)
    await page.evaluate(() => {
      fetch('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', body: 'Test body' })
      }).catch(() => {}); // Ignore failures
    });
    
    await page.waitForTimeout(1000);
    
    // Check that API responses are JSON, not HTML
    const apiErrors = apiResponses.filter(resp => resp.status >= 400);
    for (const error of apiErrors) {
      expect(error.isJson).toBeTruthy();
      expect(error.isHtml).toBeFalsy();
    }
  });

  test('should have proper navigation and page structure', async ({ page }) => {
    await page.goto('/needs/new');
    
    // Should have cancel/back navigation
    const cancelLink = page.getByRole('link', { name: /キャンセル/ });
    await expect(cancelLink).toBeVisible();
    expect(await cancelLink.getAttribute('href')).toBe('/needs');
    
    // Should have proper page structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    
    // Should have proper form sections
    await expect(page.getByText('基本情報')).toBeVisible();
    await expect(page.getByText('連絡先情報')).toBeVisible();
  });

  test('should load without console errors', async ({ page }) => {
    let consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/needs/new');
    
    // Allow time for any async errors
    await page.waitForTimeout(1000);
    
    // Filter out expected/benign errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.toLowerCase().includes('chunk') &&
      !error.toLowerCase().includes('network')
    );
    
    expect(criticalErrors).toHaveLength(0);
    
    // Page should load successfully
    await expect(page.locator('h1')).toContainText('ニーズを投稿');
  });
});

test.describe('Needs Posting - Authenticated Flow (Mock)', () => {
  // These tests would run with a mocked authentication state
  // For full implementation, you would set up Clerk test users
  
  test.skip('should create draft need when authenticated', async ({ page }) => {
    // This test would require:
    // 1. Setting up a test Clerk user
    // 2. Mocking the authentication state
    // 3. Filling out the form
    // 4. Verifying the API response
    // 5. Checking for success toast/redirect
    
    console.log('Skipping authenticated flow test - requires Clerk test setup');
  });
  
  test.skip('should show success toast after posting', async ({ page }) => {
    // Test for success feedback after successful posting
    console.log('Skipping success feedback test - requires Clerk test setup');
  });
  
  test.skip('should redirect after successful posting', async ({ page }) => {
    // Test for proper redirect after posting
    console.log('Skipping redirect test - requires Clerk test setup');
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/needs/new');
    
    // Page should be responsive
    await expect(page.locator('h1')).toBeVisible();
    
    // Form should be visible and usable on mobile
    await expect(page.locator('form')).toBeVisible();
    
    // Form inputs should be properly sized
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();
    
    // Submit button should be properly sized and accessible
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Cancel link should be accessible
    const cancelLink = page.getByRole('link', { name: /キャンセル/ });
    await expect(cancelLink).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/needs/new');
    
    // Should have proper heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('ニーズを投稿');
    
    // Should have section headings
    await expect(page.locator('h2')).toHaveCount(2); // 基本情報 and 連絡先情報
    
    // All form inputs should have labels (even if not with for/id)
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const inputName = await input.getAttribute('name');
      if (inputName && inputName !== 'undefined') {
        // Should have a label element before the input
        const hasLabel = await page.locator(`label:near(input[name="${inputName}"], 100)`).count() > 0;
        expect(hasLabel).toBeTruthy();
      }
    }
  });
  
  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/needs/new');
    
    // Tab navigation should work through form elements
    await page.keyboard.press('Tab');
    
    // Should be able to focus on form elements
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Tab to next element
    await page.keyboard.press('Tab');
    
    // Should move to next focusable element
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Should be able to reach the submit button via tab
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = await page.locator(':focus').getAttribute('type');
      if (currentFocus === 'submit') {
        break;
      }
    }
    
    const submitButton = page.locator('button[type="submit"]:focus');
    await expect(submitButton).toBeVisible();
  });
});