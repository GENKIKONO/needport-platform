import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('should redirect to login when accessing admin without auth', async ({ page }) => {
    // Try to access admin page directly
    await page.goto('/admin/needs');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/admin\/login/);
    
    // Check for login form
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should handle admin login with correct PIN', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Wait for the form to be visible
    await expect(page.locator('input[name="key"]')).toBeVisible();
    
    // Use test admin key (should match ADMIN_ACCESS_TOKEN env var)
    await page.fill('input[name="key"]', 'test-admin-123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    
    // Check for admin content - use more specific selector
    await expect(page.locator('h1, h2').filter({ hasText: /管理|Admin/ })).toBeVisible({ timeout: 5000 });
  });

  test('should show error with incorrect PIN', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Wait for the form to be visible
    await expect(page.locator('input[name="key"]')).toBeVisible();
    
    // Enter incorrect PIN
    await page.fill('input[name="key"]', '9999');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.text-red-600, [class*="error"], text=無効なキー').or(page.locator('text=エラー').or(page.locator('text=Invalid')))).toBeVisible({ timeout: 5000 });
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
