#!/usr/bin/env tsx

import { chromium } from 'playwright';

async function checkSignInPage() {
  console.log('🔍 サインインページの詳細確認...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://needport.jp/sign-in');
    await page.waitForLoadState('networkidle');
    
    // ページタイトル確認
    const title = await page.title();
    console.log(`📄 Page Title: ${title}`);
    
    // Clerk要素の確認
    const clerkElements = await page.locator('[data-testid="signin-link"], .cl-sign-in, [data-clerk-sign-in], .cl-rootBox, form[class*="cl-"]').count();
    console.log(`🔑 Clerk Elements Found: ${clerkElements}`);
    
    // すべてのボタンテキストを取得
    const buttons = await page.locator('button').all();
    console.log(`🔘 Total Buttons Found: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      console.log(`  Button ${i + 1}: "${text}" (visible: ${isVisible}, enabled: ${isEnabled})`);
    }
    
    // リンクも確認
    const links = await page.locator('a').all();
    console.log(`🔗 Total Links Found: ${links.length}`);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) { // 最初の10個のリンクのみ
      const link = links[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      const isVisible = await link.isVisible();
      if (text && text.includes('Google') || text && text.includes('ログイン') || text && text.includes('Continue')) {
        console.log(`  Link ${i + 1}: "${text}" href="${href}" (visible: ${isVisible})`);
      }
    }
    
    // スクリーンショット保存
    await page.screenshot({ 
      path: 'artifacts/prod/signin-page-debug.png',
      fullPage: true 
    });
    console.log('📷 Screenshot saved: artifacts/prod/signin-page-debug.png');
    
    // HTMLの一部を保存（デバッグ用）
    const html = await page.content();
    require('fs').writeFileSync('artifacts/prod/signin-page-debug.html', html);
    console.log('📄 HTML saved: artifacts/prod/signin-page-debug.html');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  checkSignInPage().catch(console.error);
}