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

  test('brand story section is visible', async ({ page }) => {
    await page.goto('/');
    
    // Check that brand story section exists (CMS editable)
    await expect(page.locator('h2:has-text("NeedPortについて")')).toBeVisible();
    
    // Check basic brand story content (CMS editable placeholders)
    await expect(page.locator('text=地域のニーズと事業者をつなぐプラットフォームです。')).toBeVisible();
    await expect(page.locator('text=匿名性と安全性を確保しながら、あなたの「欲しい」を実現へと導きます。')).toBeVisible();
  });

  test('service mechanism section is visible', async ({ page }) => {
    await page.goto('/');
    
    // Check that service mechanism section exists (CMS editable)
    await expect(page.locator('h2:has-text("サービスの仕組み")')).toBeVisible();
    
    // Check basic mechanism content (CMS editable placeholders)
    await expect(page.locator('text=地域のニーズと事業者をマッチングするプラットフォームです。')).toBeVisible();
    await expect(page.locator('text=安全で透明性の高い取引を実現します。')).toBeVisible();
  });

  test('CTA buttons are correctly labeled', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section CTA buttons specifically using the hero gradient background selector
    await expect(page.locator('.bg-gradient-to-br.from-blue-50\\/30 a[href="/needs/new"]')).toContainText('ニーズを投稿');
    await expect(page.locator('.bg-gradient-to-br.from-blue-50\\/30 a[href="/needs"]')).toContainText('ニーズを探す');
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