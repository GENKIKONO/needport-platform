#!/usr/bin/env node

/**
 * Navigation UX Test for Unauthenticated Posting Links
 * 
 * Tests that all "ニーズを投稿する" links redirect unauthenticated users
 * to /sign-in?redirect_url=/needs/new properly.
 */

const { chromium } = require('playwright');

async function testNavigationUX() {
  console.log('🔍 Testing Navigation UX for unauthenticated posting links...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { passed: 0, failed: 0 }
  };
  
  function log(test, status, message, details = null) {
    const result = { test, status, message, details, timestamp: new Date().toISOString() };
    results.tests.push(result);
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
    console.log(`${emoji} ${test}: ${message}`);
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
    
    if (status === 'PASS') results.summary.passed++;
    if (status === 'FAIL') results.summary.failed++;
  }
  
  try {
    // Test 1: Homepage posting link
    log('HOMEPAGE_LINK', 'INFO', 'Testing homepage posting link');
    await page.goto('https://needport.jp', { timeout: 30000 });
    
    // Look for posting-related links
    const postingSelectors = [
      'a[href*="/needs/new"]',
      'a:has-text("投稿")',
      'a:has-text("ニーズを投稿")',
      'button:has-text("投稿")'
    ];
    
    let foundPostingLink = false;
    let postingLinkHref = null;
    
    for (const selector of postingSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          postingLinkHref = await element.getAttribute('href');
          foundPostingLink = true;
          break;
        }
      } catch (e) {
        // Selector not found, continue
      }
    }
    
    if (foundPostingLink) {
      log('HOMEPAGE_LINK', 'PASS', 'Found posting link on homepage', { href: postingLinkHref });
      
      // Test the link behavior
      if (postingLinkHref && postingLinkHref.includes('/needs/new')) {
        log('HOMEPAGE_LINK_TARGET', 'PASS', 'Posting link targets /needs/new correctly');
      } else {
        log('HOMEPAGE_LINK_TARGET', 'FAIL', 'Posting link does not target /needs/new', { href: postingLinkHref });
      }
    } else {
      log('HOMEPAGE_LINK', 'WARN', 'No posting link found on homepage');
    }
    
    // Test 2: Header navigation
    log('HEADER_NAV', 'INFO', 'Testing header navigation');
    
    const headerSelectors = [
      'header a[href*="/needs/new"]',
      'nav a[href*="/needs/new"]',
      '.header a[href*="/needs/new"]'
    ];
    
    let foundHeaderLink = false;
    for (const selector of headerSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          const href = await element.getAttribute('href');
          log('HEADER_NAV', 'PASS', 'Found posting link in header', { href });
          foundHeaderLink = true;
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!foundHeaderLink) {
      log('HEADER_NAV', 'WARN', 'No posting link found in header navigation');
    }
    
    // Test 3: Actual redirect behavior
    log('REDIRECT_TEST', 'INFO', 'Testing actual redirect behavior');
    
    await page.goto('https://needport.jp/needs/new', { timeout: 30000 });
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/sign-in')) {
      log('REDIRECT_TEST', 'PASS', 'Successfully redirected to sign-in', { 
        finalUrl: currentUrl 
      });
      
      // Check for redirect_url parameter
      const url = new URL(currentUrl);
      const redirectUrl = url.searchParams.get('redirect_url') || url.searchParams.get('fallback_redirect_url');
      
      if (redirectUrl && redirectUrl.includes('/needs/new')) {
        log('REDIRECT_PARAM', 'PASS', 'Redirect URL parameter correctly set', { 
          redirectUrl 
        });
      } else {
        log('REDIRECT_PARAM', 'FAIL', 'Redirect URL parameter missing or incorrect', { 
          redirectUrl,
          allParams: Object.fromEntries(url.searchParams)
        });
      }
    } else {
      log('REDIRECT_TEST', 'FAIL', 'Did not redirect to sign-in', { 
        finalUrl: currentUrl 
      });
    }
    
    // Test 4: Sign-in page elements
    if (currentUrl.includes('/sign-in')) {
      log('SIGNIN_PAGE', 'INFO', 'Testing sign-in page elements');
      
      try {
        // Check for form elements
        const emailInput = page.locator('input[type="email"], input[name="identifier"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        
        if (await emailInput.isVisible() && await passwordInput.isVisible()) {
          log('SIGNIN_PAGE', 'PASS', 'Sign-in form elements present');
        } else {
          log('SIGNIN_PAGE', 'WARN', 'Sign-in form elements not found');
        }
      } catch (e) {
        log('SIGNIN_PAGE', 'WARN', 'Could not verify sign-in form elements', { error: e.message });
      }
    }
    
  } catch (error) {
    log('NAVIGATION_TEST', 'FAIL', 'Navigation test failed', { error: error.message });
  }
  
  await browser.close();
  
  // Output results
  console.log('\n' + '='.repeat(60));
  console.log('📊 NAVIGATION UX TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Warnings: ${results.tests.filter(t => t.status === 'WARN').length}`);
  
  // Save results
  const fs = require('fs');
  fs.writeFileSync('artifacts/prod-e2e/navigation-ux-results.json', JSON.stringify(results, null, 2));
  
  console.log('\n📁 Results saved to: artifacts/prod-e2e/navigation-ux-results.json');
  
  return results.summary.failed === 0;
}

if (require.main === module) {
  testNavigationUX().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Navigation UX test failed:', error);
    process.exit(1);
  });
}

module.exports = testNavigationUX;