#!/usr/bin/env ts-node

/**
 * Headless Sign-in Health Check
 * 
 * Uses Playwright to verify Clerk UI rendering and Google login availability.
 * Performs comprehensive UI verification without requiring actual authentication.
 * 
 * Checks:
 * 1. Clerk <SignIn /> component renders correctly
 * 2. Google login button is present and functional
 * 3. Clerk scripts load successfully
 * 4. No console errors related to authentication
 * 5. Proper error handling for configuration issues
 * 
 * Exit codes:
 * 0 = All UI elements healthy
 * 1 = UI rendering failures detected
 * 2 = Configuration or network errors
 */

import { chromium, type Browser, type Page } from 'playwright';

interface SignInHealthReport {
  timestamp: string;
  url: string;
  status: 'healthy' | 'degraded' | 'failed';
  checks: {
    pageLoad: boolean;
    clerkScripts: boolean;
    signInComponent: boolean;
    googleButton: boolean;
    noConsoleErrors: boolean;
  };
  errors: string[];
  screenshots?: {
    full: string;
    signInArea: string;
  };
  performance: {
    loadTime: number;
    domContentLoaded: number;
    networkIdle: number;
  };
}

class SignInHealthChecker {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private baseUrl: string;
  private errors: string[] = [];

  constructor(baseUrl: string = 'https://needport.jp') {
    this.baseUrl = baseUrl;
  }

  private async initBrowser(): Promise<void> {
    console.log('🚀 Launching headless browser...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });

    this.page = await this.browser.newPage({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    // Capture console errors
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.errors.push(`Console Error: ${msg.text()}`);
      }
    });

    // Capture network failures
    this.page.on('response', (response) => {
      if (!response.ok() && response.url().includes('clerk')) {
        this.errors.push(`Network Error: ${response.status()} ${response.url()}`);
      }
    });
  }

  private async checkPageLoad(): Promise<boolean> {
    console.log('🔍 Checking page load...');
    
    try {
      const startTime = Date.now();
      await this.page!.goto(`${this.baseUrl}/sign-in`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Page loaded in ${loadTime}ms`);
      
      // Wait for potential dynamic content
      await this.page!.waitForTimeout(2000);
      
      return true;
    } catch (error) {
      this.errors.push(`Page load failed: ${error}`);
      console.error(`❌ Page load failed: ${error}`);
      return false;
    }
  }

  private async checkClerkScripts(): Promise<boolean> {
    console.log('🔍 Checking Clerk scripts...');
    
    try {
      // Check for Clerk script in the DOM
      const clerkScript = await this.page!.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        return scripts.some(script => 
          script.src && (
            script.src.includes('clerk') || 
            script.src.includes('frontend-api')
          )
        );
      });

      if (clerkScript) {
        console.log('✅ Clerk scripts detected');
      } else {
        this.errors.push('Clerk scripts not found in DOM');
        console.error('❌ Clerk scripts not found');
      }

      // Check for window.Clerk object
      const clerkObject = await this.page!.evaluate(() => {
        return typeof (window as any).Clerk !== 'undefined';
      });

      if (clerkObject) {
        console.log('✅ Clerk object available');
      } else {
        // Wait a bit more for async loading
        await this.page!.waitForTimeout(3000);
        const clerkObjectRetry = await this.page!.evaluate(() => {
          return typeof (window as any).Clerk !== 'undefined';
        });
        
        if (clerkObjectRetry) {
          console.log('✅ Clerk object available (after delay)');
        } else {
          this.errors.push('Clerk object not available on window');
          console.error('❌ Clerk object not available');
          return false;
        }
      }

      return true;
    } catch (error) {
      this.errors.push(`Clerk scripts check failed: ${error}`);
      console.error(`❌ Clerk scripts check failed: ${error}`);
      return false;
    }
  }

  private async checkSignInComponent(): Promise<boolean> {
    console.log('🔍 Checking SignIn component rendering...');
    
    try {
      // Wait for potential async rendering
      await this.page!.waitForTimeout(3000);

      // Look for Clerk's SignIn component indicators
      const signInSelectors = [
        '[data-clerk-sign-in]',
        '.cl-sign-in',
        '.cl-rootBox',
        '[data-testid="sign-in-form"]',
        'form[data-clerk-sign-in-form]',
        // Fallback: look for common form elements
        'input[type="email"]',
        'input[name="identifier"]',
        'button[type="submit"]'
      ];

      let componentFound = false;
      let foundSelector = '';

      for (const selector of signInSelectors) {
        try {
          const element = await this.page!.locator(selector).first();
          const count = await element.count();
          
          if (count > 0) {
            componentFound = true;
            foundSelector = selector;
            console.log(`✅ SignIn component found: ${selector}`);
            break;
          }
        } catch (selectorError) {
          // Continue to next selector
          continue;
        }
      }

      if (!componentFound) {
        // Try to get page content for debugging
        const bodyText = await this.page!.textContent('body');
        const hasSignInText = bodyText?.toLowerCase().includes('sign in') || 
                            bodyText?.toLowerCase().includes('ログイン') ||
                            bodyText?.toLowerCase().includes('signin');

        if (hasSignInText) {
          this.errors.push('SignIn text found but no interactive component detected');
          console.error('❌ SignIn text found but no interactive component');
        } else {
          this.errors.push('No SignIn component or text found');
          console.error('❌ No SignIn component detected at all');
        }
        
        return false;
      }

      return true;
    } catch (error) {
      this.errors.push(`SignIn component check failed: ${error}`);
      console.error(`❌ SignIn component check failed: ${error}`);
      return false;
    }
  }

  private async checkGoogleButton(): Promise<boolean> {
    console.log('🔍 Checking Google login button...');
    
    try {
      // Wait for OAuth providers to load
      await this.page!.waitForTimeout(5000);

      const googleSelectors = [
        '[data-provider="google"]',
        'button[data-provider="google"]',
        '.cl-socialButtonsIconButton[data-provider="google"]',
        'button:has-text("Google")',
        'button:has-text("Continue with Google")',
        'button:has-text("Googleでログイン")',
        // Fallback: look for Google branding
        'button:has([alt*="Google"])',
        'button:has([src*="google"])',
        'svg[data-provider="google"]'
      ];

      let googleButtonFound = false;
      let foundSelector = '';

      for (const selector of googleSelectors) {
        try {
          const element = await this.page!.locator(selector).first();
          const count = await element.count();
          
          if (count > 0) {
            googleButtonFound = true;
            foundSelector = selector;
            console.log(`✅ Google button found: ${selector}`);

            // Check if button is visible and enabled
            const isVisible = await element.isVisible();
            const isEnabled = await element.isEnabled();
            
            console.log(`   - Visible: ${isVisible}`);
            console.log(`   - Enabled: ${isEnabled}`);
            
            if (!isVisible || !isEnabled) {
              this.errors.push(`Google button found but not interactive (visible: ${isVisible}, enabled: ${isEnabled})`);
            }
            
            break;
          }
        } catch (selectorError) {
          // Continue to next selector
          continue;
        }
      }

      if (!googleButtonFound) {
        // Check if OAuth providers section exists but is empty
        const socialButtons = await this.page!.locator('.cl-socialButtons, [data-clerk-social-buttons]').count();
        
        if (socialButtons > 0) {
          this.errors.push('OAuth providers section found but Google button missing');
          console.error('❌ OAuth section exists but Google button missing');
        } else {
          this.errors.push('No OAuth providers section found');
          console.error('❌ No OAuth providers section detected');
        }
        
        return false;
      }

      return true;
    } catch (error) {
      this.errors.push(`Google button check failed: ${error}`);
      console.error(`❌ Google button check failed: ${error}`);
      return false;
    }
  }

  private async captureScreenshots(): Promise<{ full: string; signInArea: string }> {
    console.log('📸 Capturing diagnostic screenshots...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotsDir = '/tmp/signin-health';
    
    try {
      // Ensure directory exists
      await this.page!.evaluate(() => {
        // This runs in browser context, can't use Node.js fs
      });

      const fullPath = `${screenshotsDir}/signin-full-${timestamp}.png`;
      const areaPath = `${screenshotsDir}/signin-area-${timestamp}.png`;

      // Full page screenshot
      await this.page!.screenshot({ 
        path: fullPath, 
        fullPage: true 
      });

      // Sign-in area screenshot (if component exists)
      try {
        const signInElement = this.page!.locator('[data-clerk-sign-in], .cl-sign-in, .cl-rootBox').first();
        const elementCount = await signInElement.count();
        
        if (elementCount > 0) {
          await signInElement.screenshot({ path: areaPath });
        }
      } catch (areaError) {
        console.log('⚠️ Could not capture sign-in area screenshot');
      }

      console.log(`✅ Screenshots saved to ${screenshotsDir}/`);
      
      return {
        full: fullPath,
        signInArea: areaPath
      };
    } catch (error) {
      console.error(`❌ Screenshot capture failed: ${error}`);
      return {
        full: '',
        signInArea: ''
      };
    }
  }

  private async measurePerformance(): Promise<SignInHealthReport['performance']> {
    console.log('⏱️ Measuring performance metrics...');
    
    try {
      const performanceEntries = await this.page!.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          networkIdle: Date.now() - navigation.fetchStart
        };
      });

      console.log(`✅ Performance measured: Load ${performanceEntries.loadTime}ms, DOMContentLoaded ${performanceEntries.domContentLoaded}ms`);
      
      return performanceEntries;
    } catch (error) {
      console.error(`❌ Performance measurement failed: ${error}`);
      return {
        loadTime: -1,
        domContentLoaded: -1,
        networkIdle: -1
      };
    }
  }

  public async checkHealth(): Promise<SignInHealthReport> {
    console.log('🏥 Starting SignIn health check...\n');
    
    const startTime = Date.now();
    
    try {
      await this.initBrowser();
      
      // Run all health checks
      const checks = {
        pageLoad: await this.checkPageLoad(),
        clerkScripts: await this.checkClerkScripts(),
        signInComponent: await this.checkSignInComponent(),
        googleButton: await this.checkGoogleButton(),
        noConsoleErrors: this.errors.filter(e => e.includes('Console Error')).length === 0
      };

      // Capture additional diagnostics
      const screenshots = await this.captureScreenshots();
      const performance = await this.measurePerformance();

      // Determine overall status
      const criticalChecks = [checks.pageLoad, checks.signInComponent];
      const importantChecks = [checks.clerkScripts, checks.googleButton];
      
      let status: SignInHealthReport['status'];
      if (criticalChecks.every(check => check) && importantChecks.every(check => check)) {
        status = 'healthy';
      } else if (criticalChecks.every(check => check)) {
        status = 'degraded';
      } else {
        status = 'failed';
      }

      const report: SignInHealthReport = {
        timestamp: new Date().toISOString(),
        url: `${this.baseUrl}/sign-in`,
        status,
        checks,
        errors: this.errors,
        screenshots,
        performance
      };

      return report;
    } catch (error) {
      console.error(`❌ Health check failed: ${error}`);
      
      return {
        timestamp: new Date().toISOString(),
        url: `${this.baseUrl}/sign-in`,
        status: 'failed',
        checks: {
          pageLoad: false,
          clerkScripts: false,
          signInComponent: false,
          googleButton: false,
          noConsoleErrors: false
        },
        errors: [...this.errors, `Health check failure: ${error}`],
        performance: {
          loadTime: -1,
          domContentLoaded: -1,
          networkIdle: Date.now() - startTime
        }
      };
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private printReport(report: SignInHealthReport): void {
    console.log('\n📊 SignIn Health Report');
    console.log('='.repeat(50));
    console.log(`URL: ${report.url}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Overall Status: ${this.getStatusIcon(report.status)} ${report.status.toUpperCase()}`);
    
    console.log('\n🔍 Health Checks:');
    console.log(`  Page Load: ${report.checks.pageLoad ? '✅' : '❌'}`);
    console.log(`  Clerk Scripts: ${report.checks.clerkScripts ? '✅' : '❌'}`);
    console.log(`  SignIn Component: ${report.checks.signInComponent ? '✅' : '❌'}`);
    console.log(`  Google Button: ${report.checks.googleButton ? '✅' : '❌'}`);
    console.log(`  No Console Errors: ${report.checks.noConsoleErrors ? '✅' : '❌'}`);

    if (report.performance.loadTime > 0) {
      console.log('\n⏱️ Performance Metrics:');
      console.log(`  Load Time: ${report.performance.loadTime}ms`);
      console.log(`  DOM Content Loaded: ${report.performance.domContentLoaded}ms`);
    }

    if (report.errors.length > 0) {
      console.log('\n❌ Errors Detected:');
      report.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (report.screenshots?.full) {
      console.log('\n📸 Screenshots Available:');
      console.log(`  Full Page: ${report.screenshots.full}`);
      if (report.screenshots.signInArea) {
        console.log(`  SignIn Area: ${report.screenshots.signInArea}`);
      }
    }

    console.log('\n🏥 Health Assessment:');
    if (report.status === 'healthy') {
      console.log('✅ All systems operational. SignIn functionality appears to be working correctly.');
    } else if (report.status === 'degraded') {
      console.log('⚠️ Core functionality working but some features may be impaired.');
      console.log('   Consider checking Clerk Dashboard configuration.');
    } else {
      console.log('❌ Critical issues detected. SignIn functionality may not work.');
      console.log('   Immediate attention required:');
      console.log('   1. Verify Clerk Live environment configuration');
      console.log('   2. Check OAuth applications setup');
      console.log('   3. Confirm domain and allowed origins settings');
    }
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'failed': return '🔴';
      default: return '⚪';
    }
  }

  public async run(): Promise<boolean> {
    const report = await this.checkHealth();
    this.printReport(report);
    
    // Return success only if status is healthy
    return report.status === 'healthy';
  }
}

// Execute health check
async function main() {
  const baseUrl = process.env.BASE_URL || 'https://needport.jp';
  const checker = new SignInHealthChecker(baseUrl);
  
  try {
    const isHealthy = await checker.run();
    process.exit(isHealthy ? 0 : 1);
  } catch (error) {
    console.error('❌ Health check process failed:', error);
    process.exit(2);
  }
}

if (require.main === module) {
  main();
}

export { SignInHealthChecker };