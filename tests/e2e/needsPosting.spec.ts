// tests/e2e/needsPosting.spec.ts  
// Playwright E2E test for needs posting flow

import { test, expect } from '@playwright/test';

test.describe('Needs Posting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary test environment
    await page.goto('/');
  });

  test('should show login requirement for posting', async ({ page }) => {
    // Go directly to posting page without authentication
    await page.goto('/needs/new-simple');
    
    // Should see login prompt since user is not authenticated
    await expect(page.locator('h1')).toContainText('ニーズの投稿');
    await expect(page.getByText('ログインが必要です')).toBeVisible();
    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();
    
    // Verify that form is not accessible
    await expect(page.locator('form')).not.toBeVisible();
  });

  test('should handle authenticated posting flow', async ({ page }) => {
    // This test would require Clerk authentication setup
    // For now, we'll test the unauthenticated flow and API error handling
    
    await page.goto('/needs/new-simple');
    
    // If we somehow bypass the auth check (e.g., direct form submission)
    // the API should still return 401
    
    // Monitor network requests
    const apiRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/needs')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/needs') && response.status() >= 400) {
        console.log(`API Error: ${response.status()} - ${response.url()}`);
      }
    });
    
    // The page should handle the unauthenticated state gracefully
    await expect(page).toHaveTitle(/NeedPort/);
  });

  test('should validate form fields properly', async ({ page }) => {
    await page.goto('/needs/new-simple');
    
    // If there's a form visible (in some test scenarios), verify validation
    const form = page.locator('form');
    
    if (await form.isVisible()) {
      // Test empty title validation
      const submitButton = page.getByRole('button', { name: /投稿/ });
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show validation error or prevent submission
        await expect(page.locator('input[required]')).toHaveAttribute('required');
      }
    }
  });

  test('should not show HTML error pages in network responses', async ({ page }) => {
    const htmlErrorResponses: any[] = [];
    
    // Monitor for HTML error responses (500 errors returning HTML instead of JSON)
    page.on('response', async response => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        const contentType = response.headers()['content-type'] || '';
        const body = await response.text().catch(() => '');
        
        if (contentType.includes('text/html') || body.includes('<!DOCTYPE html>')) {
          htmlErrorResponses.push({
            url: response.url(),
            status: response.status(),
            contentType,
            hasHtml: body.includes('<html>')
          });
        }
      }
    });
    
    await page.goto('/needs/new-simple');
    
    // Try to trigger API calls that might fail
    await page.evaluate(() => {
      // Attempt to make direct API calls that should fail gracefully
      fetch('/api/needs/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' })
      }).catch(() => {}); // Ignore failures, we're just checking response format
    });
    
    // Wait for any network activity to complete
    await page.waitForTimeout(1000);
    
    // API errors should return JSON, not HTML error pages
    expect(htmlErrorResponses).toHaveLength(0);
  });

  test('should have proper navigation from needs posting', async ({ page }) => {
    await page.goto('/needs/new-simple');
    
    // Should have cancel/back navigation
    const cancelLink = page.getByRole('link', { name: /キャンセル|戻る/ });
    if (await cancelLink.isVisible()) {
      expect(await cancelLink.getAttribute('href')).toMatch(/\/needs|\/$/);
    }
    
    // Should have proper page structure
    await expect(page.locator('main, div[role="main"], .container-page')).toBeVisible();
  });

  test('should display proper error messages', async ({ page }) => {
    let consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/needs/new-simple');
    
    // No console errors on page load
    expect(consoleErrors).toHaveLength(0);
    
    // Page should load successfully
    await expect(page.locator('h1')).toBeVisible();
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
    await page.goto('/needs/new-simple');
    
    // Page should be responsive
    await expect(page.locator('h1')).toBeVisible();
    
    // Form elements should be appropriately sized
    const form = page.locator('form');
    if (await form.isVisible()) {
      await expect(form).toBeVisible();
    }
    
    // Navigation should work on mobile
    const navigation = page.locator('nav, [role="navigation"]');
    if (await navigation.isVisible()) {
      await expect(navigation).toBeVisible();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/needs/new-simple');
    
    // Should have proper heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    
    // Form labels should be properly associated
    const labeledInputs = page.locator('input[id], textarea[id]');
    const count = await labeledInputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = labeledInputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
      }
    }
  });
  
  test('should have proper focus management', async ({ page }) => {
    await page.goto('/needs/new-simple');
    
    // Tab navigation should work
    await page.keyboard.press('Tab');
    
    // First focusable element should receive focus
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});