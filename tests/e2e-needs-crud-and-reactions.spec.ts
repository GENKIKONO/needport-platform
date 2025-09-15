import { test, expect, type Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Needs CRUD and Reactions E2E Tests', () => {
  let testNeedId: string;
  let testNeedTitle: string;

  test.beforeEach(async ({ page }) => {
    // Set up test data
    testNeedTitle = `[E2E Test] ${Date.now()}`;
    
    // Navigate to the base URL
    await page.goto(BASE_URL);
  });

  test.describe('Authentication and Access Control', () => {
    test('未ログインで /needs/new にアクセス → ログイン強制', async ({ page }) => {
      await page.goto(`${BASE_URL}/needs/new`);
      
      // Should be redirected to sign-in page or show login form
      await expect(page.locator('[data-testid="sign-in-form"], .sign-in, [href*="sign-in"]')).toBeVisible({
        timeout: 10000
      });
    });

    test('未ログインで公開投稿の閲覧は可能', async ({ page }) => {
      await page.goto(`${BASE_URL}/needs`);
      
      // Should be able to see needs list
      await expect(page.locator('h1, h2')).toContainText(['ニーズ', 'needs', 'Needs'], {
        timeout: 10000
      });
    });
  });

  test.describe('Needs CRUD Operations', () => {
    test('投稿作成から削除までの完全フロー', async ({ page }) => {
      // 1. Login (assuming we have test credentials)
      await loginAsTestUser(page);
      
      // 2. Navigate to create need page
      await page.goto(`${BASE_URL}/needs/new`);
      
      // 3. Fill out the form
      await page.fill('[data-testid="need-title"], input[name="title"]', testNeedTitle);
      await page.fill('[data-testid="need-body"], textarea[name="body"]', 'This is a test need body for E2E testing.');
      
      // 4. Submit the form
      await page.click('[data-testid="submit-need"], button[type="submit"]');
      
      // 5. Verify creation success
      await expect(page.locator('.success, .toast-success, [data-testid="success-message"]')).toBeVisible({
        timeout: 5000
      });
      
      // 6. Extract need ID from URL or response
      const currentUrl = page.url();
      const needIdMatch = currentUrl.match(/\/needs\/([a-f0-9-]+)/);
      if (needIdMatch) {
        testNeedId = needIdMatch[1];
      }
      
      // 7. Navigate to my needs page to verify it appears
      await page.goto(`${BASE_URL}/me`);
      await expect(page.locator(`text="${testNeedTitle}"`)).toBeVisible();
      
      // 8. Edit the need
      await page.click(`[href*="/needs/${testNeedId}"] ~ button, [data-testid="edit-need-${testNeedId}"]`);
      const updatedTitle = `${testNeedTitle} - Updated`;
      await page.fill('[data-testid="need-title"], input[name="title"]', updatedTitle);
      await page.click('[data-testid="save-need"], button[type="submit"]');
      
      // 9. Verify update success
      await expect(page.locator(`text="${updatedTitle}"`)).toBeVisible();
      
      // 10. Delete the need
      await page.click('[data-testid="delete-need"], button[data-action="delete"]');
      await page.click('[data-testid="confirm-delete"], button:has-text("削除")');
      
      // 11. Verify deletion success
      await expect(page.locator(`text="${updatedTitle}"`)).not.toBeVisible();
    });

    test('権限制御: Aが作成 → A編集成功・B編集失敗', async ({ browser }) => {
      // Create two browser contexts for different users
      const contextA = await browser.newContext();
      const contextB = await browser.newContext();
      const pageA = await contextA.newPage();
      const pageB = await contextB.newPage();
      
      try {
        // User A creates a need
        await loginAsTestUser(pageA, 'userA');
        await pageA.goto(`${BASE_URL}/needs/new`);
        await pageA.fill('[data-testid="need-title"], input[name="title"]', testNeedTitle);
        await pageA.fill('[data-testid="need-body"], textarea[name="body"]', 'Test body');
        await pageA.click('[data-testid="submit-need"], button[type="submit"]');
        
        // Extract need ID
        const urlA = pageA.url();
        const needIdMatch = urlA.match(/\/needs\/([a-f0-9-]+)/);
        if (needIdMatch) {
          testNeedId = needIdMatch[1];
        }
        
        // User A can edit their own need
        await pageA.goto(`${BASE_URL}/needs/${testNeedId}/edit`);
        await expect(pageA.locator('[data-testid="need-title"], input[name="title"]')).toBeVisible();
        
        // User B tries to edit User A's need
        await loginAsTestUser(pageB, 'userB');
        const responseB = await pageB.goto(`${BASE_URL}/needs/${testNeedId}/edit`);
        
        // User B should be forbidden or redirected
        expect(responseB?.status()).toBe(403);
        
      } finally {
        await contextA.close();
        await contextB.close();
      }
    });
  });

  test.describe('Reaction System', () => {
    test('リアクショントグル: 押す→付く、再度押す→外れる', async ({ page }) => {
      // Setup: Create a published need first
      await setupPublishedNeed(page);
      
      // Navigate to the need detail page
      await page.goto(`${BASE_URL}/needs/${testNeedId}`);
      
      // Find reaction buttons
      const wantToBuyBtn = page.locator('[data-testid="reaction-want-to-buy"], [data-reaction="WANT_TO_BUY"]');
      const interestedBtn = page.locator('[data-testid="reaction-interested"], [data-reaction="INTERESTED"]');
      
      // Initial state: no reactions
      await expect(wantToBuyBtn).toHaveAttribute('data-active', 'false');
      await expect(interestedBtn).toHaveAttribute('data-active', 'false');
      
      // First click: add reaction
      await wantToBuyBtn.click();
      await expect(wantToBuyBtn).toHaveAttribute('data-active', 'true');
      
      // Verify count increased
      const countAfterAdd = await page.locator('[data-testid="reaction-count-want-to-buy"]').textContent();
      expect(parseInt(countAfterAdd || '0')).toBeGreaterThan(0);
      
      // Second click: remove reaction
      await wantToBuyBtn.click();
      await expect(wantToBuyBtn).toHaveAttribute('data-active', 'false');
      
      // Verify count decreased
      const countAfterRemove = await page.locator('[data-testid="reaction-count-want-to-buy"]').textContent();
      expect(parseInt(countAfterRemove || '0')).toBeLessThan(parseInt(countAfterAdd || '0'));
    });

    test('複数リアクション種類の独立性', async ({ page }) => {
      await setupPublishedNeed(page);
      await page.goto(`${BASE_URL}/needs/${testNeedId}`);
      
      const wantToBuyBtn = page.locator('[data-testid="reaction-want-to-buy"]');
      const interestedBtn = page.locator('[data-testid="reaction-interested"]');
      
      // Add both reactions
      await wantToBuyBtn.click();
      await interestedBtn.click();
      
      // Both should be active
      await expect(wantToBuyBtn).toHaveAttribute('data-active', 'true');
      await expect(interestedBtn).toHaveAttribute('data-active', 'true');
      
      // Remove one, other should remain
      await wantToBuyBtn.click();
      await expect(wantToBuyBtn).toHaveAttribute('data-active', 'false');
      await expect(interestedBtn).toHaveAttribute('data-active', 'true');
    });
  });

  test.describe('Auto-Archive Functionality', () => {
    test('60日経過シミュレーション → アーカイブ動作確認', async ({ page }) => {
      // This test requires admin API access to simulate time passage
      const adminApiKey = process.env.ADMIN_API_KEY;
      if (!adminApiKey) {
        test.skip('Admin API key not available for archive testing');
      }
      
      // Create a need with backdated published_at
      const response = await page.request.post(`${BASE_URL}/api/admin/needs/test-archive`, {
        data: {
          title: 'Test Archive Need',
          body: 'This need should be archived',
          published_at: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString() // 70 days ago
        },
        headers: {
          'Authorization': `Bearer ${adminApiKey}`
        }
      });
      
      const { need_id } = await response.json();
      
      // Run archive job
      await page.request.post(`${BASE_URL}/api/admin/jobs/archive-stale-needs`, {
        headers: {
          'Authorization': `Bearer ${adminApiKey}`
        }
      });
      
      // Verify need is not in public listing
      await page.goto(`${BASE_URL}/needs`);
      await expect(page.locator('text="Test Archive Need"')).not.toBeVisible();
      
      // Verify need appears in archive page (for authenticated users)
      await loginAsTestUser(page);
      await page.goto(`${BASE_URL}/needs/archive`);
      await expect(page.locator('text="Test Archive Need"')).toBeVisible();
    });
  });

  test.describe('Security and Anonymity', () => {
    test('一般一覧でPII非表示: DOM内に個人情報が存在しない', async ({ page }) => {
      await page.goto(`${BASE_URL}/needs`);
      
      // Get page content
      const pageContent = await page.content();
      
      // Check for email patterns
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = pageContent.match(emailPattern);
      
      // Should not contain any email addresses
      expect(emails).toBeNull();
      
      // Check for common test emails that shouldn't appear
      expect(pageContent).not.toContain('test@example.com');
      expect(pageContent).not.toContain('user@test.com');
      
      // Verify display names are shown instead of real names
      const authorElements = page.locator('[data-testid="author-name"], .author-name');
      const authorCount = await authorElements.count();
      
      for (let i = 0; i < authorCount; i++) {
        const authorText = await authorElements.nth(i).textContent();
        // Should show display names or anonymized IDs, not email addresses
        expect(authorText).not.toMatch(emailPattern);
      }
    });

    test('リアクション投稿時の認証チェック', async ({ page }) => {
      // Setup published need
      await setupPublishedNeed(page);
      
      // Logout if logged in
      await page.goto(`${BASE_URL}/logout`);
      
      // Try to react without authentication
      const response = await page.request.post(`${BASE_URL}/api/needs/${testNeedId}/reactions`, {
        data: { kind: 'INTERESTED' }
      });
      
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Performance and UI', () => {
    test('一覧ページの応答性能チェック', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/needs`);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Key elements should be visible
      await expect(page.locator('h1, .page-title')).toBeVisible();
      await expect(page.locator('[data-testid="needs-list"], .needs-grid')).toBeVisible();
    });

    test('リアクションボタンの即座反映', async ({ page }) => {
      await setupPublishedNeed(page);
      await loginAsTestUser(page);
      await page.goto(`${BASE_URL}/needs/${testNeedId}`);
      
      const reactionBtn = page.locator('[data-testid="reaction-interested"]');
      const countElement = page.locator('[data-testid="reaction-count-interested"]');
      
      const initialCount = parseInt(await countElement.textContent() || '0');
      
      // Click and verify immediate UI update (optimistic update)
      const clickTime = Date.now();
      await reactionBtn.click();
      
      // UI should update within 500ms
      await expect(reactionBtn).toHaveAttribute('data-active', 'true', { timeout: 500 });
      
      const reactionTime = Date.now() - clickTime;
      expect(reactionTime).toBeLessThan(500);
      
      // Count should increase
      const newCount = parseInt(await countElement.textContent() || '0');
      expect(newCount).toBe(initialCount + 1);
    });
  });
});

// Helper functions
async function loginAsTestUser(page: Page, userType: string = 'default'): Promise<void> {
  // This is a placeholder - implement according to your auth setup
  // For Clerk, you might need to use test credentials or mock authentication
  const testCredentials = {
    default: {
      email: process.env.TEST_USER_EMAIL || 'test@needport.test',
      password: process.env.TEST_USER_PASSWORD || 'testpass123'
    },
    userA: {
      email: process.env.TEST_USER_A_EMAIL || 'userA@needport.test',
      password: process.env.TEST_USER_A_PASSWORD || 'testpass123'
    },
    userB: {
      email: process.env.TEST_USER_B_EMAIL || 'userB@needport.test',
      password: process.env.TEST_USER_B_PASSWORD || 'testpass123'
    }
  };

  const creds = testCredentials[userType] || testCredentials.default;
  
  await page.goto(`${BASE_URL}/sign-in`);
  
  // Fill login form (adjust selectors based on your Clerk setup)
  await page.fill('[name="emailAddress"], [name="email"]', creds.email);
  await page.fill('[name="password"]', creds.password);
  await page.click('button[type="submit"], .cl-formButtonPrimary');
  
  // Wait for successful login
  await page.waitForURL(`${BASE_URL}/**`, { timeout: 10000 });
}

async function setupPublishedNeed(page: Page): Promise<void> {
  await loginAsTestUser(page);
  
  // Create and publish a need for testing
  const response = await page.request.post(`${BASE_URL}/api/needs`, {
    data: {
      title: `[E2E] Test Published Need ${Date.now()}`,
      body: 'This is a published test need for reactions testing.',
      status: 'published'
    }
  });
  
  const result = await response.json();
  testNeedId = result.need?.id || result.id;
  
  if (!testNeedId) {
    throw new Error('Failed to create test need');
  }
}