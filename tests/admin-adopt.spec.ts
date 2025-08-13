import { test, expect } from '@playwright/test';

test.describe('Admin Adoption Flow', () => {
  test('should adopt and unadopt offers', async ({ page }) => {
    const adminPin = process.env.NP_ADMIN_PIN || '1234';
    const testNeedId = process.env.NP_TEST_NEED_ID;
    
    if (!testNeedId) {
      test.skip('NP_TEST_NEED_ID environment variable not set');
      return;
    }

    // 1. Start from admin login
    await page.goto('/admin/login');
    
    // 2. Input PIN
    await page.fill('input[name="pin"]', adminPin);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('/admin');
    
    // 3. Navigate to offers page
    await page.goto(`/admin/needs/${testNeedId}/offers`);
    
    // 4. Assert page loads with correct heading
    await expect(page.locator('h1')).toContainText('オファー比較');
    
    // Wait for offers to load
    await page.waitForSelector('[data-testid="offer-row"]', { timeout: 10000 });
    
    // 5. Click first "採用" button
    const adoptButtons = page.locator('text=採用');
    if (await adoptButtons.count() === 0) {
      test.skip('No adopt buttons found - no offers available');
      return;
    }
    
    await adoptButtons.first().click();
    
    // 6. Fill adoption settings
    await page.fill('input[name="minPeople"]', '3');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="deadline"]', tomorrowStr);
    
    await page.click('button[type="submit"]');
    
    // 7. Wait for page refresh and check for "採用済み" badge
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=採用済み').first()).toBeVisible();
    
    // 8. Click "採用解除" button
    const unadoptButtons = page.locator('text=採用解除');
    await expect(unadoptButtons.first()).toBeVisible();
    await unadoptButtons.first().click();
    
    // 9. Confirm unadopt (if confirmation dialog exists)
    const confirmButton = page.locator('text=確認').or(page.locator('text=OK'));
    if (await confirmButton.count() > 0) {
      await confirmButton.first().click();
    }
    
    // 10. Wait for page refresh and check badge disappears
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=採用済み').first()).not.toBeVisible();
    
    // 11. Verify adopt button is back
    await expect(page.locator('text=採用').first()).toBeVisible();
  });
});
