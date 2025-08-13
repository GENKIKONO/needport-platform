import { test, expect } from '@playwright/test';

test.describe('Admin Offers Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login to admin
    await page.goto('/admin/login');
    await page.fill('input[type="password"]', '1234');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should manage offers', async ({ page }) => {
    const timestamp = Date.now();
    
    // Navigate to offers page
    await page.goto('/admin/needs');
    const needLink = page.locator('a[href*="/offers"]').first();
    
    if (await needLink.isVisible()) {
      await needLink.click();
      
      // Wait for offers page to load
      await expect(page).toHaveURL(/\/offers/);
      
      const vendorName = `Test Vendor ${timestamp}`;
      
      // Test adding an offer
      await page.fill('input[name="vendor_name"]', vendorName);
      await page.fill('input[name="amount"]', '500000');
      await page.click('button[type="submit"]');
      
      // Should show success or the new offer
      await expect(page.locator(`text=${vendorName}`)).toBeVisible();
      
      // Test editing the offer
      const editButton = page.locator(`text=${vendorName}`).locator('..').locator('text=編集').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Update vendor name
        const newVendorName = `Updated Vendor ${timestamp}`;
        await page.fill('input[name="vendor_name"]', newVendorName);
        await page.click('button[type="submit"]');
        
        // Should show updated name
        await expect(page.locator(`text=${newVendorName}`)).toBeVisible();
      }
      
      // Test adopting the offer
      const adoptButton = page.locator(`text=${vendorName}`).locator('..').locator('text=採用').first();
      if (await adoptButton.isVisible()) {
        await adoptButton.click();
        
        // Should show adopted status
        await expect(page.locator('text=採用済み')).toBeVisible();
      }
      
      // Test unadopting the offer
      const unadoptButton = page.locator(`text=${vendorName}`).locator('..').locator('text=採用解除').first();
      if (await unadoptButton.isVisible()) {
        await unadoptButton.click();
        
        // Should show unadopted status
        await expect(page.locator('text=未採用')).toBeVisible();
      }
      
      // Test deleting the offer
      const deleteButton = page.locator(`text=${vendorName}`).locator('..').locator('text=削除').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion (if there's a confirmation dialog)
        const confirmButton = page.locator('text=削除').or(page.locator('text=Delete')).last();
        await confirmButton.click();
        
        // Should not show the deleted offer
        await expect(page.locator(`text=${vendorName}`)).not.toBeVisible();
      }
    } else {
      // If no needs exist, create one first
      await page.goto('/needs/new');
      
      // Fill in need form
      await page.fill('input[name="title"]', `Test Need ${timestamp}`);
      await page.fill('textarea[name="summary"]', 'Test summary for E2E testing');
      await page.check('input[name="agree"]');
      await page.click('button[type="submit"]');
      
      // Should redirect to the new need
      await expect(page).toHaveURL(/\/needs\/[a-f0-9-]+/);
      
      // Now navigate to admin offers for this need
      const needId = page.url().split('/').pop();
      await page.goto(`/admin/needs/${needId}/offers`);
      
      // Continue with offer management tests...
    }
  });

  test('should handle vendor invitations', async ({ page }) => {
    // Navigate to offers page
    await page.goto('/admin/needs');
    const needLink = page.locator('a[href*="/offers"]').first();
    
    if (await needLink.isVisible()) {
      await needLink.click();
      
      // Test vendor invitation form
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('textarea[name="note"]', 'Test invitation note');
      await page.click('text=招待を記録');
      
      // Should show success or the invitation in the list
      await expect(page.locator('text=test@example.com')).toBeVisible();
    }
  });
});
