#!/usr/bin/env node

/**
 * Sign-in Page HTML Analysis
 * 
 * Detailed analysis of the sign-in page HTML structure
 * to understand current Clerk configuration.
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function analyzeSignInPage() {
  console.log('🔍 Analyzing Sign-in Page HTML Structure...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to sign-in page
    await page.goto('https://needport.jp/sign-in', { timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for dynamic content
    
    // Take screenshot
    const screenshotPath = 'artifacts/prod-e2e/signin_check.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Get page title
    const title = await page.title();
    console.log(`📄 Page Title: "${title}"`);
    
    // Get main heading
    const h1Elements = await page.locator('h1').allTextContents();
    console.log(`📝 H1 Elements: ${JSON.stringify(h1Elements)}`);
    
    // Check for input elements
    const inputElements = await page.locator('input').all();
    console.log(`\n🔍 Input Elements Found: ${inputElements.length}`);
    
    for (let i = 0; i < inputElements.length; i++) {
      const input = inputElements[i];
      const type = await input.getAttribute('type') || 'text';
      const name = await input.getAttribute('name') || 'unnamed';
      const placeholder = await input.getAttribute('placeholder') || '';
      const id = await input.getAttribute('id') || '';
      
      console.log(`  ${i + 1}. Type: ${type}, Name: ${name}, Placeholder: "${placeholder}", ID: ${id}`);
    }
    
    // Check for buttons
    const buttonElements = await page.locator('button').all();
    console.log(`\n🔘 Button Elements Found: ${buttonElements.length}`);
    
    for (let i = 0; i < buttonElements.length; i++) {
      const button = buttonElements[i];
      const text = await button.textContent() || '';
      const type = await button.getAttribute('type') || 'button';
      const disabled = await button.isDisabled();
      
      console.log(`  ${i + 1}. Text: "${text.trim()}", Type: ${type}, Disabled: ${disabled}`);
    }
    
    // Check for error messages or notices
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '.alert',
      '.notice',
      '.warning',
      'text=/error|disabled|unavailable/i'
    ];
    
    console.log(`\n⚠️  Error/Notice Messages:`);
    for (const selector of errorSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          const text = await element.textContent();
          if (text && text.trim()) {
            console.log(`  - ${text.trim()}`);
          }
        }
      } catch (e) {
        // Selector not found, continue
      }
    }
    
    // Check for Clerk-specific elements
    console.log(`\n🔐 Clerk Integration Check:`);
    const clerkElements = await page.locator('[data-clerk-element], .cl-component, .cl-card').count();
    console.log(`  Clerk elements found: ${clerkElements}`);
    
    // Check for sign-in methods
    const socialButtons = await page.locator('button:has-text("Google"), button:has-text("GitHub"), button:has-text("Facebook")').count();
    console.log(`  Social login buttons: ${socialButtons}`);
    
    // Get full HTML for analysis
    const bodyHTML = await page.locator('body').innerHTML();
    
    // Analyze HTML content
    const htmlAnalysis = {
      hasEmailInput: bodyHTML.includes('type="email"') || bodyHTML.includes('name="identifier"'),
      hasPasswordInput: bodyHTML.includes('type="password"'),
      hasSignInButton: bodyHTML.includes('Sign in') || bodyHTML.includes('ログイン'),
      hasClerkComponent: bodyHTML.includes('cl-') || bodyHTML.includes('clerk'),
      hasErrorMessage: bodyHTML.includes('error') || bodyHTML.includes('disabled'),
      totalLength: bodyHTML.length
    };
    
    console.log(`\n📊 HTML Analysis:`);
    console.log(`  Has email input: ${htmlAnalysis.hasEmailInput}`);
    console.log(`  Has password input: ${htmlAnalysis.hasPasswordInput}`);
    console.log(`  Has sign-in button: ${htmlAnalysis.hasSignInButton}`);
    console.log(`  Has Clerk components: ${htmlAnalysis.hasClerkComponent}`);
    console.log(`  Has error messages: ${htmlAnalysis.hasErrorMessage}`);
    console.log(`  HTML size: ${htmlAnalysis.totalLength} characters`);
    
    // Save detailed HTML analysis
    const analysisReport = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      title,
      h1Elements,
      inputCount: inputElements.length,
      buttonCount: buttonElements.length,
      htmlAnalysis,
      recommendation: htmlAnalysis.hasEmailInput && htmlAnalysis.hasPasswordInput ? 
        'Email/Password authentication appears to be enabled' :
        'Email/Password authentication may be disabled or not loaded properly'
    };
    
    fs.writeFileSync('artifacts/prod-e2e/signin_analysis.json', JSON.stringify(analysisReport, null, 2));
    console.log(`\n📁 Analysis saved: artifacts/prod-e2e/signin_analysis.json`);
    
    // Save a snippet of HTML for debugging
    const htmlSnippet = bodyHTML.substring(0, 2000) + '...';
    fs.writeFileSync('artifacts/prod-e2e/signin_html_snippet.txt', htmlSnippet);
    
    return analysisReport;
    
  } catch (error) {
    console.error('❌ Failed to analyze sign-in page:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  analyzeSignInPage().catch(error => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = analyzeSignInPage;