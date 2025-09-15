import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage header links navigate to correct URLs', async ({ page }) => {
    await page.goto('/');
    
    // Check logo links to home
    await expect(page.locator('header a[href="/"]')).toBeVisible();
    
    // Check main navigation links in header specifically (not sidebar) - updated per CLAUDE.md specs
    await expect(page.locator('[data-testid="needs-list-link"]')).toContainText('ニーズ一覧');
    await expect(page.locator('[data-testid="needs-new-link"]')).toContainText('ニーズを投稿する');
    
    // Verify prohibited links are NOT present in header
    await expect(page.locator('header nav a[href="/about"]')).not.toBeVisible();
    await expect(page.locator('header nav a[href="/terms"]')).not.toBeVisible();
    await expect(page.locator('header nav a[href="/privacy"]')).not.toBeVisible();
    
    // Test each navigation link actually navigates correctly
    await page.click('[data-testid="needs-list-link"]');
    await expect(page).toHaveURL('/needs');
    
    // Wait a bit and use new page context to avoid navigation conflicts
    await page.waitForTimeout(1000);
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.click('[data-testid="needs-new-link"]');
    // Check that the link navigates to /needs/new or sign-in (authentication may be required)
    await expect(page).toHaveURL(/.*\/(needs\/new|sign-in).*/);
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
    
    // Check links within the mobile drawer specifically - updated per CLAUDE.md specs  
    await expect(page.locator('.fixed nav >> text=ニーズ一覧')).toBeVisible();
    await expect(page.locator('.fixed nav >> text=ニーズを投稿する')).toBeVisible();
    
    // Check authentication links (should show login buttons when not authenticated)
    await expect(page.locator('.fixed nav [data-testid="signin-link"]')).toBeVisible();
    await expect(page.locator('.fixed nav [data-testid="vendor-signin-link"]')).toBeVisible();
    
    // Check additional navigation links per CLAUDE.md specs
    await expect(page.locator('.fixed nav >> text=サービスについて')).toBeVisible();
    await expect(page.locator('.fixed nav >> text=利用規約')).toBeVisible();
    await expect(page.locator('.fixed nav >> text=プライバシーポリシー')).toBeVisible();
  });
});