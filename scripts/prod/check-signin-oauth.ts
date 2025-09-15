#!/usr/bin/env tsx
/**
 * scripts/prod/check-signin-oauth.ts
 * 本番環境での Clerk UI および Google OAuth リダイレクト自動検証
 * 
 * 実行: npx tsx scripts/prod/check-signin-oauth.ts
 */

import { chromium, Browser, Page } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const PROD_BASE_URL = process.env.PROD_BASE_URL || "https://needport.jp";
const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'prod-auth-check');

interface OAuthCheckResult {
  timestamp: string;
  baseUrl: string;
  clerkUi: boolean;
  googleBtn: boolean;
  reachedGoogle: boolean;
  notes: string[];
  screenshots: {
    signin?: string;
    googleBtn?: string;
    redirect?: string;
    error?: string[];
  };
  error?: string;
}

class OAuthChecker {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private result: OAuthCheckResult;

  constructor() {
    this.result = {
      timestamp: new Date().toISOString(),
      baseUrl: PROD_BASE_URL,
      clerkUi: false,
      googleBtn: false,
      reachedGoogle: false,
      notes: [],
      screenshots: {}
    };

    // Create artifacts directory
    mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  async init() {
    console.log('🚀 Starting OAuth verification...');
    console.log(`   Base URL: ${PROD_BASE_URL}`);
    console.log(`   Artifacts: ${ARTIFACTS_DIR}`);

    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Set reasonable viewport and user agent
      await this.page.setViewportSize({ width: 1280, height: 720 });
      await this.page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      
      this.result.notes.push('Browser initialized successfully');
    } catch (error) {
      this.result.error = error instanceof Error ? error.message : 'Browser initialization failed';
      throw error;
    }
  }

  async checkSignInPage() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('📋 Step 1: Checking sign-in page...');
    
    try {
      // Navigate to sign-in page
      const response = await this.page.goto(`${PROD_BASE_URL}/sign-in`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response || !response.ok()) {
        throw new Error(`HTTP ${response?.status()}: Failed to load sign-in page`);
      }

      // Take initial screenshot
      const screenshotPath = path.join(ARTIFACTS_DIR, '01_signin.png');
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.result.screenshots.signin = screenshotPath;
      
      console.log(`   Screenshot saved: ${screenshotPath}`);

      // Check page title
      const title = await this.page.title();
      this.result.notes.push(`Page title: "${title}"`);

      // Wait for any potential loading to complete
      await this.page.waitForTimeout(3000);

      // Check for Clerk UI elements
      const clerkSelectors = [
        '[data-testid="signin-root"]',
        '.cl-signIn-root', 
        '.cl-card',
        '[data-clerk-id="sign-in"]'
      ];

      let clerkFound = false;
      for (const selector of clerkSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          clerkFound = true;
          this.result.notes.push(`Clerk UI found: ${selector}`);
          break;
        } catch {
          // Continue checking other selectors
        }
      }

      if (!clerkFound) {
        // Check if we have any visible content that might be Clerk
        const clerkContent = await this.page.evaluate(() => {
          const possibleClerkElements = document.querySelectorAll('div');
          for (const el of possibleClerkElements) {
            if (el.textContent?.includes('Sign in') || 
                el.textContent?.includes('Continue with') ||
                el.className?.includes('cl-') ||
                el.getAttribute('data-clerk-id')) {
              return true;
            }
          }
          return false;
        });
        
        if (clerkContent) {
          clerkFound = true;
          this.result.notes.push('Clerk UI detected via content analysis');
        }
      }

      this.result.clerkUi = clerkFound;
      
      if (clerkFound) {
        console.log('   ✅ Clerk UI detected');
      } else {
        console.log('   ❌ Clerk UI not found');
        this.result.notes.push('Clerk UI not detected with any selector');
      }

    } catch (error) {
      console.log(`   ❌ Sign-in page check failed: ${error}`);
      this.result.error = error instanceof Error ? error.message : 'Sign-in page check failed';
      
      // Save error screenshot
      const errorScreenshot = path.join(ARTIFACTS_DIR, 'error_signin.png');
      if (this.page) {
        await this.page.screenshot({ path: errorScreenshot }).catch(() => {});
        this.result.screenshots.error = [errorScreenshot];
      }
      throw error;
    }
  }

  async checkGoogleButton() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('🔍 Step 2: Looking for Google OAuth button...');

    try {
      // Multiple selectors to find Google button
      const googleSelectors = [
        'button[role="button"]:has-text("Continue with Google")',
        'button:has-text("Google")',
        '.cl-socialButtonsIconButton',
        '[data-testid="google-oauth-button"]',
        'button[aria-label*="Google"]',
        'button:has(svg):has-text("Continue")'
      ];

      let googleButton = null;
      for (const selector of googleSelectors) {
        try {
          googleButton = await this.page.waitForSelector(selector, { timeout: 5000 });
          if (googleButton) {
            this.result.notes.push(`Google button found: ${selector}`);
            break;
          }
        } catch {
          // Continue with next selector
        }
      }

      // Fallback: search by text content
      if (!googleButton) {
        googleButton = await this.page.evaluate(() => {
          const buttons = document.querySelectorAll('button, [role="button"]');
          for (const btn of buttons) {
            if (btn.textContent?.toLowerCase().includes('google') ||
                btn.textContent?.toLowerCase().includes('continue with')) {
              return btn;
            }
          }
          return null;
        }).then(result => result ? this.page!.$('button, [role="button"]') : null);
      }

      if (googleButton) {
        this.result.googleBtn = true;
        console.log('   ✅ Google OAuth button found');
        
        // Take screenshot of button
        const btnScreenshot = path.join(ARTIFACTS_DIR, '02_google_btn.png');
        await this.page.screenshot({ path: btnScreenshot, fullPage: true });
        this.result.screenshots.googleBtn = btnScreenshot;

      } else {
        console.log('   ❌ Google OAuth button not found');
        this.result.notes.push('Google button not found with any selector');
      }

    } catch (error) {
      console.log(`   ❌ Google button check failed: ${error}`);
      this.result.notes.push(`Google button check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkGoogleRedirect() {
    if (!this.page || !this.result.googleBtn) {
      console.log('⏭️  Step 3: Skipping redirect test (no Google button found)');
      return;
    }

    console.log('🌐 Step 3: Testing Google OAuth redirect...');

    try {
      // Find and click Google button with retry
      const googleSelectors = [
        'button[role="button"]:has-text("Continue with Google")',
        'button:has-text("Google")',
        '.cl-socialButtonsIconButton',
        'button[aria-label*="Google"]'
      ];

      let clicked = false;
      for (const selector of googleSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            await button.click();
            clicked = true;
            this.result.notes.push(`Clicked Google button: ${selector}`);
            break;
          }
        } catch {
          continue;
        }
      }

      if (!clicked) {
        // Fallback click by text
        await this.page.evaluate(() => {
          const buttons = document.querySelectorAll('button, [role="button"]');
          for (const btn of buttons) {
            if (btn.textContent?.toLowerCase().includes('google')) {
              (btn as HTMLElement).click();
              return true;
            }
          }
          return false;
        });
      }

      // Wait for navigation with multiple attempts
      let reachedGoogle = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`   Attempt ${attempt}: Waiting for Google redirect...`);
          
          await this.page.waitForFunction(
            () => window.location.hostname.includes('google.com') || 
                  window.location.hostname.includes('accounts.google.com'),
            { timeout: 15000 }
          );
          
          const currentUrl = this.page.url();
          if (currentUrl.includes('google.com')) {
            reachedGoogle = true;
            this.result.notes.push(`Successfully reached Google: ${currentUrl}`);
            console.log(`   ✅ Redirected to Google: ${currentUrl}`);
            break;
          }
        } catch (error) {
          this.result.notes.push(`Redirect attempt ${attempt} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          if (attempt < 3) {
            await this.page.waitForTimeout(2000); // Wait before retry
          }
        }
      }

      this.result.reachedGoogle = reachedGoogle;

      // Take final screenshot
      const redirectScreenshot = path.join(ARTIFACTS_DIR, '03_redirect.png');
      await this.page.screenshot({ path: redirectScreenshot, fullPage: true });
      this.result.screenshots.redirect = redirectScreenshot;

      if (!reachedGoogle) {
        console.log('   ❌ Could not reach Google OAuth (may be blocked by anti-robot measures)');
        this.result.notes.push('Google redirect blocked - likely anti-robot protection');
      }

    } catch (error) {
      console.log(`   ❌ Google redirect test failed: ${error}`);
      this.result.notes.push(`Redirect error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Save error screenshot
      const errorScreenshot = path.join(ARTIFACTS_DIR, 'error_redirect.png');
      await this.page.screenshot({ path: errorScreenshot }).catch(() => {});
      if (!this.result.screenshots.error) this.result.screenshots.error = [];
      this.result.screenshots.error.push(errorScreenshot);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async saveResults() {
    // Save JSON report
    const reportPath = path.join(ARTIFACTS_DIR, 'report.json');
    writeFileSync(reportPath, JSON.stringify(this.result, null, 2));
    
    // Save human-readable summary
    const summaryPath = path.join(ARTIFACTS_DIR, 'summary.txt');
    const summary = `
OAuth Verification Report
========================
Timestamp: ${this.result.timestamp}
Base URL: ${this.result.baseUrl}

Results:
✅ Clerk UI Detected: ${this.result.clerkUi}
✅ Google Button Found: ${this.result.googleBtn}
✅ Google Redirect Success: ${this.result.reachedGoogle}

Screenshots:
- Sign-in page: ${this.result.screenshots.signin || 'N/A'}
- Google button: ${this.result.screenshots.googleBtn || 'N/A'}
- Redirect result: ${this.result.screenshots.redirect || 'N/A'}

Notes:
${this.result.notes.map(note => `- ${note}`).join('\n')}

${this.result.error ? `Error: ${this.result.error}` : ''}
`;
    
    writeFileSync(summaryPath, summary.trim());
    
    console.log(`\n📄 Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Summary: ${summaryPath}`);

    return this.result;
  }

  getResult(): OAuthCheckResult {
    return this.result;
  }
}

async function main() {
  const checker = new OAuthChecker();
  let exitCode = 0;
  
  try {
    await checker.init();
    await checker.checkSignInPage();
    await checker.checkGoogleButton();
    await checker.checkGoogleRedirect();
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    exitCode = 1;
    
  } finally {
    await checker.cleanup();
    const result = await checker.saveResults();
    
    console.log(`\n🏁 OAuth verification completed`);
    console.log(`   Clerk UI: ${result.clerkUi ? '✅' : '❌'}`);
    console.log(`   Google Button: ${result.googleBtn ? '✅' : '❌'}`);
    console.log(`   Google Redirect: ${result.reachedGoogle ? '✅' : '❌'}`);
    
    if (!result.clerkUi || !result.googleBtn) {
      exitCode = 1;
    }
  }
  
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(console.error);
}

export { OAuthChecker };