#!/usr/bin/env tsx
/**
 * scripts/prod/run-oauth-e2e.ts
 * 本番 Google OAuth 手動検証の半自動化スクリプト
 * 
 * シナリオ：
 * 1. /sign-in → 「Continue with Google」選択
 * 2. 🔸手動操作：Google同意画面で人間が認証
 * 3. リダイレクト後 /needs/new 到達
 * 4. title/body 入力 → 投稿成功（201）
 * 5. /me で下書きカード表示確認
 */

import { chromium, Page, Browser, BrowserContext } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

// 設定
const PROD_BASE_URL = process.env.PROD_BASE_URL || 'https://needport.jp';
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const PROD_ARTIFACTS_DIR = path.join(ARTIFACTS_DIR, 'prod');
const E2E_ARTIFACTS_DIR = path.join(ARTIFACTS_DIR, 'e2e');

// 必要なディレクトリを作成
mkdirSync(PROD_ARTIFACTS_DIR, { recursive: true });
mkdirSync(E2E_ARTIFACTS_DIR, { recursive: true });

interface TestResult {
  timestamp: string;
  baseUrl: string;
  status: 'success' | 'failed' | 'manual_intervention_required';
  steps: Array<{
    step: string;
    status: 'success' | 'failed' | 'skipped' | 'manual';
    duration?: number;
    screenshot?: string;
    error?: string;
  }>;
  needId?: string;
  error?: string;
}

class OAuthE2ERunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private result: TestResult;

  constructor() {
    this.result = {
      timestamp: new Date().toISOString(),
      baseUrl: PROD_BASE_URL,
      status: 'failed',
      steps: []
    };
  }

  private async addStep(step: string, status: 'success' | 'failed' | 'manual', screenshot = false, error?: string) {
    const stepResult = {
      step,
      status,
      duration: Date.now(),
      error
    };

    if (screenshot && this.page) {
      const screenshotPath = path.join(PROD_ARTIFACTS_DIR, `step_${this.result.steps.length + 1}_${step.replace(/[^a-z0-9]/gi, '_')}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      stepResult.screenshot = screenshotPath;
      console.log(`📷 Screenshot saved: ${screenshotPath}`);
    }

    this.result.steps.push(stepResult);
    console.log(`${status === 'success' ? '✅' : status === 'manual' ? '🔸' : '❌'} ${step}`);
    if (error) console.log(`   Error: ${error}`);
  }

  async setup() {
    console.log('🚀 Starting Google OAuth E2E validation...');
    console.log(`Target: ${PROD_BASE_URL}`);
    
    this.browser = await chromium.launch({ 
      headless: false, // 手動操作のため非ヘッドレス
      slowMo: 1000 // ゆっくり実行
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: PROD_ARTIFACTS_DIR,
        size: { width: 1280, height: 720 }
      }
    });
    
    this.page = await this.context.newPage();
    
    // ナビゲーション待機の設定
    this.page.setDefaultNavigationTimeout(30000);
    this.page.setDefaultTimeout(15000);
  }

  async step1_navigateToSignIn() {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      await this.page.goto(`${PROD_BASE_URL}/sign-in`);
      await this.page.waitForLoadState('networkidle');
      
      // ページタイトルとClerk UIの確認
      const title = await this.page.title();
      const hasClerkUI = await this.page.locator('[data-testid="signin-link"], .cl-sign-in, [data-clerk-sign-in], .cl-rootBox, form[class*="cl-"]').count() > 0;
      
      if (title.includes('NeedPort') && hasClerkUI) {
        await this.addStep('Navigate to sign-in page', 'success', true);
      } else {
        await this.addStep('Navigate to sign-in page', 'failed', true, `Title: ${title}, Clerk UI: ${hasClerkUI}`);
        return false;
      }
    } catch (error) {
      await this.addStep('Navigate to sign-in page', 'failed', true, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
    
    return true;
  }

  async step2_clickGeneralLogin() {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // まず「一般ログイン」リンクをクリックしてClerkモーダル/ページを開く
      console.log('🔍 Looking for 一般ログイン (General Login) link...');
      const generalLoginSelectors = [
        'a[data-testid="signin-link"]',
        'a:has-text("一般ログイン")',
        '.bg-blue-600:has-text("一般ログイン")',
        'a[href="/sign-in"]:has-text("一般ログイン")'
      ];
      
      let loginLink = null;
      for (const selector of generalLoginSelectors) {
        try {
          const link = this.page.locator(selector).first();
          await link.waitFor({ state: 'visible', timeout: 3000 });
          const isVisible = await link.isVisible();
          if (isVisible) {
            loginLink = link;
            console.log(`✅ Found general login link: ${selector}`);
            break;
          }
        } catch {
          console.log(`❌ General login selector failed: ${selector}`);
          continue;
        }
      }
      
      if (!loginLink) {
        await this.addStep('Click general login link', 'failed', true, 'General login link not found');
        return false;
      }
      
      // 一般ログインリンクをクリック
      await loginLink.click();
      console.log('✅ Clicked general login link');
      await this.addStep('Click general login link', 'success', true);
      
      // ページ遷移またはモーダル表示を待機
      await this.page.waitForTimeout(3000);
      
      return true;
    } catch (error) {
      await this.addStep('Click general login link', 'failed', true, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async step3_clickGoogleOAuth() {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // Clerkのローディング待機
      console.log('⏳ Waiting for Clerk to load after clicking general login...');
      try {
        await this.page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 30000 });
        console.log('✅ Clerk loading completed');
      } catch {
        console.log('⚠️ No loading spinner detected - continuing...');
      }
      
      // Clerk UIの表示を待機
      const clerkSelectors = [
        '.cl-signIn-root',
        '.cl-card', 
        '.cl-rootBox',
        'form[class*="cl-"]',
        '[data-clerk-element]',
        '.cl-formButtonPrimary',
        '.cl-socialButtonsBlockButton'
      ];
      
      console.log('🔍 Waiting for Clerk sign-in form to appear...');
      let clerkElementFound = false;
      for (const selector of clerkSelectors) {
        try {
          await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
          console.log(`✅ Found Clerk element: ${selector}`);
          clerkElementFound = true;
          break;
        } catch {
          console.log(`❌ Not found: ${selector}`);
          continue;
        }
      }
      
      if (!clerkElementFound) {
        await this.addStep('Wait for Clerk OAuth form', 'failed', true, 'Clerk OAuth form did not appear after clicking general login');
        return false;
      }
      
      // Google OAuthボタンを探す
      const googleSelectors = [
        'button:has-text("Continue with Google")',
        'button:has-text("Google")', 
        '[data-provider="google"]',
        'button[aria-label*="Google"]',
        'button[title*="Google"]',
        '.cl-socialButtonsBlockButton:has-text("Google")',
        '.cl-formButtonPrimary:has-text("Google")'
      ];
      
      console.log('🔍 Looking for Google OAuth button...');
      let googleButton = null;
      for (const selector of googleSelectors) {
        try {
          const button = this.page.locator(selector).first();
          await button.waitFor({ state: 'visible', timeout: 5000 });
          const isEnabled = await button.isEnabled();
          if (isEnabled) {
            googleButton = button;
            console.log(`✅ Found Google button: ${selector}`);
            break;
          }
        } catch {
          console.log(`❌ Google button selector failed: ${selector}`);
          continue;
        }
      }
      
      if (!googleButton) {
        await this.addStep('Click Google OAuth button', 'failed', true, 'Google OAuth button not found or not enabled');
        return false;
      }
      
      await googleButton.click();
      await this.addStep('Click Google OAuth button', 'success', true);
      
      // Googleリダイレクト待機
      try {
        await this.page.waitForURL(/accounts\.google\.com/, { timeout: 15000 });
        await this.addStep('Redirect to Google OAuth', 'success', true);
        return true;
      } catch {
        // リダイレクトが失敗した場合でも継続
        await this.addStep('Redirect to Google OAuth', 'manual', true, 'Manual intervention may be required');
        return true;
      }
    } catch (error) {
      await this.addStep('Click Google OAuth button', 'failed', true, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async step4_manualGoogleAuth() {
    console.log('\n🔸 **手動操作が必要です**');
    console.log('-------------------');
    console.log('ブラウザでGoogle認証を完了してください：');
    console.log('1. メールアドレスを入力');
    console.log('2. パスワードを入力');
    console.log('3. 権限同意（必要に応じて）');
    console.log('4. needport.jp にリダイレクトされるまで待機');
    console.log('');
    console.log('⚠️  認証完了後、Enter キーを押して続行してください...');
    
    // 標準入力待機（Enterキー）
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        console.log('👍 手動認証完了。検証を続行します...\n');
        resolve();
      });
    });
    
    await this.addStep('Manual Google authentication', 'manual', true);
    return true;
  }

  async step5_verifyRedirectAndNavigate() {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      // 現在のURLを確認
      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('needport.jp')) {
        await this.addStep('Redirect back to NeedPort', 'success', true);
      } else {
        await this.addStep('Redirect back to NeedPort', 'failed', true, `Unexpected URL: ${currentUrl}`);
        return false;
      }
      
      // 認証状態の確認
      const authIndicators = [
        this.page.locator('[data-testid="user-menu"]'),
        this.page.locator('[data-testid="me-link"]'),
        this.page.locator('text=/マイページ|profile/i')
      ];
      
      let authenticated = false;
      for (const indicator of authIndicators) {
        try {
          await indicator.waitFor({ state: 'visible', timeout: 5000 });
          authenticated = true;
          break;
        } catch {
          continue;
        }
      }
      
      if (authenticated) {
        await this.addStep('Verify authentication state', 'success', true);
      } else {
        await this.addStep('Verify authentication state', 'failed', true, 'No authentication indicators found');
        return false;
      }
      
      // /needs/new に移動
      await this.page.goto(`${PROD_BASE_URL}/needs/new`);
      await this.page.waitForLoadState('networkidle');
      
      const hasForm = await this.page.locator('form, [data-testid="needs-form"]').count() > 0;
      if (hasForm) {
        await this.addStep('Navigate to needs posting', 'success', true);
        return true;
      } else {
        await this.addStep('Navigate to needs posting', 'failed', true, 'Needs form not found');
        return false;
      }
    } catch (error) {
      await this.addStep('Verify redirect and navigate', 'failed', true, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async step6_fillAndSubmitNeed() {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const testTitle = `[E2E] OAuth Test Need - ${timestamp}`;
      const testDescription = `This is an automated test need created by the OAuth E2E validation script.

Timestamp: ${new Date().toISOString()}
Test ID: OAUTH-E2E-${timestamp}

This need should be automatically cleaned up by the test suite.`;

      // フォーム入力
      await this.page.fill('input[name="title"], #title', testTitle);
      await this.page.fill('textarea[name="description"], #description', testDescription);
      
      // カテゴリ選択（可能な場合）
      const categorySelect = this.page.locator('select[name="category"], [data-testid="category-select"]');
      if (await categorySelect.count() > 0) {
        await categorySelect.selectOption('その他');
      }
      
      // 地域選択（可能な場合）
      const regionSelect = this.page.locator('select[name="region"], [data-testid="region-select"]');
      if (await regionSelect.count() > 0) {
        await regionSelect.selectOption('東京都');
      }
      
      await this.addStep('Fill need form', 'success', true);
      
      // 送信ボタンクリック前にネットワーク応答を監視
      const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/api/needs') && response.request().method() === 'POST',
        { timeout: 10000 }
      );
      
      const submitButton = this.page.locator('button[type="submit"], [data-testid="submit-button"]');
      await submitButton.click();
      
      // API応答待機
      const response = await responsePromise;
      const responseData = await response.json();
      
      if (response.status() === 201 || response.status() === 200) {
        this.result.needId = responseData.id;
        await this.addStep('Submit need (API 201)', 'success', true);
        return true;
      } else {
        await this.addStep('Submit need (API 201)', 'failed', true, `API returned ${response.status()}: ${JSON.stringify(responseData)}`);
        return false;
      }
    } catch (error) {
      await this.addStep('Fill and submit need', 'failed', true, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async step7_verifyDraftInMyPage() {
    if (!this.page) throw new Error('Page not initialized');
    
    try {
      await this.page.goto(`${PROD_BASE_URL}/me`);
      await this.page.waitForLoadState('networkidle');
      
      // 下書きカードを探す
      const draftCards = this.page.locator('[data-testid="need-card"]');
      const draftCount = await draftCards.count();
      
      if (draftCount > 0) {
        // 作成したニーズを探す
        const testNeed = draftCards.filter({ hasText: '[E2E] OAuth Test Need' });
        const foundTestNeed = await testNeed.count() > 0;
        
        if (foundTestNeed) {
          await this.addStep('Verify draft in /me page', 'success', true);
          
          // 最終スクリーンショット
          await this.page.screenshot({ 
            path: path.join(PROD_ARTIFACTS_DIR, 'needs_post_e2e.png'), 
            fullPage: true 
          });
          console.log(`📷 Final screenshot saved: needs_post_e2e.png`);
          
          return true;
        } else {
          await this.addStep('Verify draft in /me page', 'failed', true, 'Test need not found in /me page');
          return false;
        }
      } else {
        await this.addStep('Verify draft in /me page', 'failed', true, 'No draft cards found');
        return false;
      }
    } catch (error) {
      await this.addStep('Verify draft in /me page', 'failed', true, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  async cleanup() {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.setup();

      // Step 1: /sign-in に移動
      if (!await this.step1_navigateToSignIn()) {
        this.result.status = 'failed';
        return this.result;
      }

      // Step 2: 一般ログインリンクをクリック
      if (!await this.step2_clickGeneralLogin()) {
        this.result.status = 'failed';
        return this.result;
      }

      // Step 3: Google OAuthボタンクリック
      if (!await this.step3_clickGoogleOAuth()) {
        this.result.status = 'failed';
        return this.result;
      }

      // Step 4: 手動Google認証
      await this.step4_manualGoogleAuth();

      // Step 5: リダイレクト確認と /needs/new 移動
      if (!await this.step5_verifyRedirectAndNavigate()) {
        this.result.status = 'failed';
        return this.result;
      }

      // Step 6: ニーズ入力と送信
      if (!await this.step6_fillAndSubmitNeed()) {
        this.result.status = 'failed';
        return this.result;
      }

      // Step 7: /me で下書き確認
      if (!await this.step7_verifyDraftInMyPage()) {
        this.result.status = 'failed';
        return this.result;
      }

      this.result.status = 'success';
      console.log('\n🎉 OAuth E2E validation completed successfully!');

    } catch (error) {
      this.result.error = error instanceof Error ? error.message : 'Unknown error';
      this.result.status = 'failed';
      console.error('\n❌ OAuth E2E validation failed:', error);
    } finally {
      await this.cleanup();
      
      // 結果をJSONファイルに保存
      const resultPath = path.join(E2E_ARTIFACTS_DIR, 'response.json');
      writeFileSync(resultPath, JSON.stringify(this.result, null, 2));
      console.log(`\n📄 Results saved to: ${resultPath}`);
      
      return this.result;
    }
  }
}

// メイン実行
async function main() {
  const runner = new OAuthE2ERunner();
  const result = await runner.run();
  
  process.exit(result.status === 'success' ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

export { OAuthE2ERunner };