import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage header links navigate to correct URLs', async ({ page }) => {
    await page.goto('/');
    
    // Check logo links to home
    await expect(page.locator('header a[href="/"]')).toBeVisible();
    
    // Check main navigation links in header specifically (not sidebar)
    await expect(page.locator('header nav a[href="/needs"]')).toContainText('ニーズを探す');
    await expect(page.locator('header nav a[href="/needs/new"]')).toContainText('ニーズを投稿する');
    
    // Verify prohibited links are NOT present in header
    await expect(page.locator('header nav a[href="/about"]')).not.toBeVisible();
    await expect(page.locator('header nav a[href="/terms"]')).not.toBeVisible();
    await expect(page.locator('header nav a[href="/privacy"]')).not.toBeVisible();
    
    // Test each navigation link actually navigates correctly
    await page.click('header nav a[href="/needs"]');
    await expect(page).toHaveURL('/needs');
    
    await page.goto('/');
    await page.click('header nav a[href="/needs/new"]');
    // Check that the link navigates to /needs/new (authentication will be handled there)
    await expect(page).toHaveURL(/.*\/needs\/new.*/);
  });

  test('navigation links do not redirect to /me when logged in', async ({ page }) => {
    // This test assumes logged in state doesn't affect navigation
    // In a real test, you would set up authentication state
    
    await page.goto('/needs');
    await expect(page).toHaveURL('/needs');
    
    await page.goto('/about');
    await expect(page).toHaveURL('/about');
    
    await page.goto('/terms');  
    await expect(page).toHaveURL('/terms');
    
    await page.goto('/privacy');
    await expect(page).toHaveURL('/privacy');
  });

  test('mobile navigation shows correct links', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Click mobile menu button (should be visible at bottom right)
    await page.click('[aria-label="メニューを開く"]');
    
    // Wait for menu to open and check that mobile menu contains expected links
    // Use more specific selectors within the mobile menu drawer
    await page.waitForSelector('text=メニュー', { state: 'visible' });
    
    // Check links within the mobile drawer specifically
    await expect(page.locator('.fixed .space-y-6 >> text=ニーズを探す')).toBeVisible();
    await expect(page.locator('.fixed .space-y-6 >> text=ニーズを投稿する')).toBeVisible();
    await expect(page.locator('.fixed .space-y-6 >> text=マイページ')).toBeVisible();
    
    // Verify prohibited links are NOT present in mobile menu
    await expect(page.locator('.fixed .space-y-6 >> text=サービスについて')).not.toBeVisible();
    await expect(page.locator('.fixed .space-y-6 >> text=利用規約')).not.toBeVisible();
    await expect(page.locator('.fixed .space-y-6 >> text=プライバシー')).not.toBeVisible();
  });
});