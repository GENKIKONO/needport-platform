import { test, expect } from '@playwright/test';

test.describe('Public Entry Submission', () => {
  test('should submit entry successfully', async ({ page }) => {
    const testNeedId = process.env.NP_TEST_NEED_ID;
    
    if (!testNeedId) {
      test.skip('NP_TEST_NEED_ID environment variable not set');
      return;
    }

    // 1. Navigate to public need page
    await page.goto(`/needs/${testNeedId}`);
    
    // 2. Check if entry form is visible (only if adopted)
    const entryForm = page.locator('form:has-text("参加申し込み")');
    if (await entryForm.count() === 0) {
      test.skip('Entry form not visible - need may not be adopted');
      return;
    }
    
    // 3. Fill entry form
    await page.fill('input[placeholder="山田太郎"]', 'テスト太郎');
    await page.fill('input[placeholder="example@email.com"]', 'test@example.com');
    await page.selectOption('select', '2'); // Select 2 people
    await page.fill('textarea[placeholder*="ご質問"]', 'テスト用の申し込みです');
    
    // 4. Submit form
    await page.click('button:has-text("申し込む")');
    
    // 5. Wait for success message
    await page.waitForSelector('text=お申し込みを受け付けました', { timeout: 10000 });
    await expect(page.locator('text=お申し込みを受け付けました')).toBeVisible();
    
    // 6. Verify form is reset
    await expect(page.locator('input[placeholder="山田太郎"]')).toHaveValue('');
    await expect(page.locator('input[placeholder="example@email.com"]')).toHaveValue('');
  });
  
  test('should show validation errors', async ({ page }) => {
    const testNeedId = process.env.NP_TEST_NEED_ID;
    
    if (!testNeedId) {
      test.skip('NP_TEST_NEED_ID environment variable not set');
      return;
    }

    await page.goto(`/needs/${testNeedId}`);
    
    const entryForm = page.locator('form:has-text("参加申し込み")');
    if (await entryForm.count() === 0) {
      test.skip('Entry form not visible - need may not be adopted');
      return;
    }
    
    // Try to submit empty form
    await page.click('button:has-text("申し込む")');
    
    // Should show validation errors
    await expect(page.locator('text=名前を入力してください')).toBeVisible();
    await expect(page.locator('text=メールアドレスを入力してください')).toBeVisible();
  });
});
