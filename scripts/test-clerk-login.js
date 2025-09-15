#!/usr/bin/env node

/**
 * Clerk Login Test Script
 * 
 * Tests if Clerk Email/Password authentication is properly configured
 * and working for E2E testing.
 */

const { chromium } = require('playwright');

class ClerkLoginTester {
  constructor() {
    this.testEmail = process.env.CLERK_TEST_EMAIL;
    this.testPassword = process.env.CLERK_TEST_PASSWORD;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      canProceedWithE2E: false
    };
  }

  log(test, status, message, details = null) {
    const result = { test, status, message, details, timestamp: new Date().toISOString() };
    this.results.tests.push(result);
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ${test}: ${message}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async testSignInPageStructure() {
    this.log('SIGNIN_PAGE', 'INFO', 'Checking sign-in page structure');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      await page.goto('https://needport.jp/sign-in', { timeout: 30000 });
      
      // Check for email input
      const emailInput = page.locator('input[type="email"], input[name="identifier"], input[placeholder*="email" i]');
      const emailExists = await emailInput.count() > 0;
      
      // Check for password input
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      const passwordExists = await passwordInput.count() > 0;
      
      // Check for sign-in button
      const signInButton = page.locator('button:has-text("Sign in"), button:has-text("ログイン"), button[type="submit"]');
      const buttonExists = await signInButton.count() > 0;
      
      // Check for error messages indicating disabled auth
      const errorMessages = await page.locator('text=/email.*disabled|password.*disabled|authentication.*disabled/i').count();
      
      if (emailExists && passwordExists && buttonExists && errorMessages === 0) {
        this.log('SIGNIN_PAGE', 'PASS', 'Sign-in page structure is correct', {
          emailInput: emailExists,
          passwordInput: passwordExists,
          signInButton: buttonExists,
          noErrorMessages: errorMessages === 0
        });
        return true;
      } else {
        this.log('SIGNIN_PAGE', 'FAIL', 'Sign-in page structure has issues', {
          emailInput: emailExists,
          passwordInput: passwordExists,
          signInButton: buttonExists,
          errorMessages: errorMessages > 0
        });
        return false;
      }
      
    } catch (error) {
      this.log('SIGNIN_PAGE', 'FAIL', 'Failed to access sign-in page', { error: error.message });
      return false;
    } finally {
      await browser.close();
    }
  }

  async testCredentialsProvided() {
    this.log('CREDENTIALS', 'INFO', 'Checking if test credentials are provided');
    
    if (!this.testEmail || !this.testPassword) {
      this.log('CREDENTIALS', 'WARN', 'Test credentials not provided', {
        email: !!this.testEmail,
        password: !!this.testPassword,
        note: 'Set CLERK_TEST_EMAIL and CLERK_TEST_PASSWORD to enable login testing'
      });
      return false;
    }
    
    this.log('CREDENTIALS', 'PASS', 'Test credentials provided');
    return true;
  }

  async testActualLogin() {
    if (!this.testEmail || !this.testPassword) {
      this.log('LOGIN_TEST', 'SKIP', 'Skipping login test - no credentials provided');
      return null;
    }

    this.log('LOGIN_TEST', 'INFO', 'Testing actual login with provided credentials');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Navigate to sign-in
      await page.goto('https://needport.jp/sign-in', { timeout: 30000 });
      
      // Fill credentials
      const emailSelector = 'input[type="email"], input[name="identifier"]';
      const passwordSelector = 'input[type="password"], input[name="password"]';
      
      await page.waitForSelector(emailSelector, { timeout: 10000 });
      await page.fill(emailSelector, this.testEmail);
      await page.fill(passwordSelector, this.testPassword);
      
      // Submit form
      const submitButton = 'button:has-text("Sign in"), button:has-text("ログイン"), button[type="submit"]';
      await page.click(submitButton);
      
      // Wait for result
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      
      // Check for successful login (redirected away from sign-in)
      if (!currentUrl.includes('/sign-in')) {
        this.log('LOGIN_TEST', 'PASS', 'Login successful', {
          finalUrl: currentUrl,
          testEmail: this.testEmail
        });
        return true;
      } else {
        // Check for error messages
        const errorElement = await page.locator('[role="alert"], .error, .alert-error, text=/invalid|incorrect|error/i').first();
        const errorText = await errorElement.textContent().catch(() => 'No specific error found');
        
        this.log('LOGIN_TEST', 'FAIL', 'Login failed', {
          finalUrl: currentUrl,
          errorMessage: errorText,
          testEmail: this.testEmail
        });
        return false;
      }
      
    } catch (error) {
      this.log('LOGIN_TEST', 'FAIL', 'Login test encountered error', {
        error: error.message,
        testEmail: this.testEmail
      });
      return false;
    } finally {
      await browser.close();
    }
  }

  generateRecommendations() {
    const failed = this.results.tests.filter(t => t.status === 'FAIL');
    const warnings = this.results.tests.filter(t => t.status === 'WARN');
    
    console.log('\n🔧 RECOMMENDATIONS:');
    
    if (failed.some(t => t.test === 'SIGNIN_PAGE')) {
      console.log('❌ Sign-in page issues detected:');
      console.log('   1. Go to Clerk Dashboard → User & Authentication → Email, phone, username');
      console.log('   2. Set "Email address" to "Required"');
      console.log('   3. Set "Password" to "Required"');
      console.log('   4. Save and wait 5-10 minutes for changes to propagate');
    }
    
    if (warnings.some(t => t.test === 'CREDENTIALS')) {
      console.log('⚠️  Test credentials not provided:');
      console.log('   export CLERK_TEST_EMAIL="your-test@email.com"');
      console.log('   export CLERK_TEST_PASSWORD="YourTestPassword"');
    }
    
    if (failed.some(t => t.test === 'LOGIN_TEST')) {
      console.log('❌ Login test failed:');
      console.log('   1. Verify test account exists and is active');
      console.log('   2. Check password meets requirements (8+ chars, mixed case, numbers)');
      console.log('   3. Try manual login at https://needport.jp/sign-in');
      console.log('   4. Check Clerk Dashboard → Users for account status');
    }
    
    // Determine if E2E can proceed
    const structureOK = !failed.some(t => t.test === 'SIGNIN_PAGE');
    const credentialsOK = this.testEmail && this.testPassword;
    const loginOK = !failed.some(t => t.test === 'LOGIN_TEST');
    
    this.results.canProceedWithE2E = structureOK && credentialsOK && (loginOK !== false);
    
    console.log(`\n🎯 E2E Testing Ready: ${this.results.canProceedWithE2E ? '✅ YES' : '❌ NO'}`);
    
    if (this.results.canProceedWithE2E) {
      console.log('   Next step: npm run monitor:prod:e2e');
    } else {
      console.log('   Fix issues above before proceeding with E2E tests');
    }
  }

  async run() {
    console.log('🧪 Testing Clerk Login Configuration...\n');
    console.log(`Target: https://needport.jp/sign-in`);
    console.log(`Timestamp: ${this.results.timestamp}\n`);

    // Run tests
    await this.testSignInPageStructure();
    await this.testCredentialsProvided();
    await this.testActualLogin();

    // Generate recommendations
    this.generateRecommendations();

    // Save results
    const fs = require('fs');
    if (!fs.existsSync('artifacts/prod-e2e')) {
      fs.mkdirSync('artifacts/prod-e2e', { recursive: true });
    }
    fs.writeFileSync('artifacts/prod-e2e/clerk-login-test-results.json', JSON.stringify(this.results, null, 2));

    console.log('\n📁 Results saved to: artifacts/prod-e2e/clerk-login-test-results.json');

    return this.results.canProceedWithE2E;
  }
}

if (require.main === module) {
  const tester = new ClerkLoginTester();
  tester.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Clerk login test failed:', error);
    process.exit(1);
  });
}

module.exports = ClerkLoginTester;