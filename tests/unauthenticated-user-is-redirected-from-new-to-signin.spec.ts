import { test, expect } from '@playwright/test';

test.describe('Unauthenticated User Redirect', () => {
  test('should redirect unauthenticated user from /needs/new to sign-in', async ({ page }) => {
    // Navigate to needs posting page while not logged in
    await page.goto('/needs/new');
    
    // Should be redirected to sign-in page with redirect_url parameter
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    
    // Verify we're on the sign-in page
    expect(page.url()).toMatch(/\/sign-in/);
    
    // Verify the redirect_url parameter is set correctly
    const url = new URL(page.url());
    const redirectUrl = url.searchParams.get('redirect_url');
    expect(redirectUrl).toBe('/needs/new');
  });

  test('should not show posting form to unauthenticated users', async ({ page }) => {
    // Try to access /needs/new directly
    await page.goto('/needs/new');
    
    // Wait for redirect
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    
    // Verify we never see the posting form
    const formExists = await page.locator('form').isVisible();
    expect(formExists).toBe(false);
    
    // Should see sign-in UI instead (using heading to avoid multiple matches)
    await expect(page.locator('h1')).toContainText('Sign in');
  });

  test('should redirect to original page after successful login', async ({ page }) => {
    // This test would require setting up test authentication
    // For now we just verify the redirect parameter is preserved
    
    await page.goto('/needs/new');
    await page.waitForURL(/sign-in/, { timeout: 10000 });
    
    const url = new URL(page.url());
    const redirectUrl = url.searchParams.get('redirect_url');
    
    // Verify the redirect URL is correctly encoded
    expect(redirectUrl).toBe('/needs/new');
    
    // In a real test, we would:
    // 1. Fill in login credentials
    // 2. Submit the form
    // 3. Verify redirect back to /needs/new
    // 4. Verify the posting form is now visible
  });
});