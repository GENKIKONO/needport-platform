import { test, expect } from '@playwright/test';

test.describe('Home Page Copy', () => {
  test('hero text matches specification', async ({ page }) => {
    await page.goto('/');
    
    // Check main hero copy as per requirements specification
    await expect(page.locator('h1')).toContainText('欲しい暮らし、10人で叶える');
    
    // Check subtitle - as per requirements specification  
    await expect(page.locator('h1').locator('..').locator('p').first()).toContainText('「欲しい」と「できる」の橋渡し');
    
    // Check tag line
    await expect(page.locator('text=ニーズマッチングプラットフォーム')).toBeVisible();
  });

  test('こんな方におすすめ section is visible', async ({ page }) => {
    await page.goto('/');
    
    // Check "こんな方におすすめ" section exists
    await expect(page.locator('h2:has-text("こんな方におすすめ")')).toBeVisible();
    
    // Check the three recommendation cards
    await expect(page.locator('text=同じニーズを持つ人が何人いるか知りたい')).toBeVisible();
    await expect(page.locator('text=ニーズが集まったら事業化を検討したい')).toBeVisible();
    await expect(page.locator('text=まずは匿名で「気になる」だけ押したい')).toBeVisible();
  });

  test('collective demand meter explanation is present', async ({ page }) => {
    await page.goto('/');
    
    // Check that collective demand meter explanation is visible
    await expect(page.locator('text=集合的需要メーターで、ニーズの実現可能性を見える化')).toBeVisible();
    await expect(page.locator('text=購入したい・興味あり・気になる（匿名）のメーターで需要量を確認')).toBeVisible();
  });

  test('CTA buttons are correctly labeled', async ({ page }) => {
    await page.goto('/');
    
    // Check CTA buttons with more flexible text matching
    await expect(page.locator('a[href="/needs/new"]')).toContainText('ニーズを投稿');
    await expect(page.locator('a[href="/needs"]')).toContainText('ニーズを探す');
  });

  test('prohibited copy is not present', async ({ page }) => {
    await page.goto('/');
    
    // Check that prohibited copy is NOT present
    await expect(page.locator('text=みんなで紡ぐ物語')).not.toBeVisible();
    await expect(page.locator('text=地域の事業者とマッチング')).not.toBeVisible();
    await expect(page.locator('text=埋もれた声を、つなぐ')).not.toBeVisible();
    await expect(page.locator('text=誰かの「困った」が誰かの「喜び」になる場所')).not.toBeVisible();
  });
});