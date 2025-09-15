import { test, expect } from '@playwright/test';

test.describe('My Page', () => {
  test('me page redirects to sign-in when logged out', async ({ page }) => {
    await page.goto('/me');
    
    // Should redirect to sign-in page with fallback redirect URL
    await expect(page).toHaveURL(/.*sign-in.*fallback_redirect_url.*me/);
    
    // Check that the sign-in page loads correctly
    await expect(page.locator('body')).toBeVisible();
  });

  // Note: This test would need proper authentication setup in real implementation
  test.skip('me page shows dashboard sections when logged in', async ({ page }) => {
    // In a real test, you would set up authentication state here
    // For now, we'll test the page structure assuming it loads correctly
    
    await page.goto('/me');
    
    // Check main dashboard sections exist
    await expect(page.locator('text=マイページ')).toBeVisible();
    
    // Check dashboard cards
    await expect(page.locator('text=進行中の取引')).toBeVisible();
    await expect(page.locator('text=投稿したニーズ')).toBeVisible();
    await expect(page.locator('text=未読メッセージ')).toBeVisible();
    await expect(page.locator('text=応募案件')).toBeVisible();
    
    // Check navigation links
    await expect(page.locator('a[href="/me/transactions"]')).toContainText('取引管理');
    await expect(page.locator('a[href="/me/payments"]')).toContainText('決済・領収書');
    await expect(page.locator('a[href="/me/posts"]')).toContainText('投稿管理');
    await expect(page.locator('a[href="/me/applications"]')).toContainText('応募案件');
    await expect(page.locator('a[href="/me/profile"]')).toContainText('プロフィール');
    
    // Check recent activity section
    await expect(page.locator('text=最近の活動')).toBeVisible();
    
    // Check quick action buttons
    await expect(page.locator('a[href="/needs/new"]')).toContainText('ニーズを投稿');
    await expect(page.locator('a[href="/needs"]')).toContainText('ニーズを探す');
    
    // Check guide section
    await expect(page.locator('text=ご利用ガイド')).toBeVisible();
  });

  test('me page correctly handles authentication requirement', async ({ page }) => {
    await page.goto('/me');
    
    // Should redirect to sign-in with correct fallback URL
    await expect(page).toHaveURL(/.*sign-in.*fallback_redirect_url.*me/);
    
    // The page should load without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('me subpages load correctly', async ({ page }) => {
    // Test that me subpages exist and load (even if showing login prompt)
    const subpages = ['/me/transactions', '/me/payments', '/me/posts', '/me/applications', '/me/profile'];
    
    for (const subpage of subpages) {
      await page.goto(subpage);
      // Should either show the actual page or redirect to login, but not crash
      await expect(page.locator('body')).toBeVisible();
      // Verify we're not redirected to /me when accessing subpages
      expect(page.url()).not.toBe(`${page.url().split('/').slice(0, 3).join('/')}/me`);
    }
  });
});