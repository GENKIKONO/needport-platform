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
    
    // Enter correct PIN (dev environment)
    await page.fill('input[type="password"]', '1234');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    
    // Check for admin content
    await expect(page.locator('text=管理画面').or(page.locator('text=Admin'))).toBeVisible();
  });

  test('should show error with incorrect PIN', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Enter incorrect PIN
    await page.fill('input[type="password"]', '9999');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=エラー').or(page.locator('text=Invalid'))).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
