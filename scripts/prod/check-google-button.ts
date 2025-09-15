#!/usr/bin/env tsx

import { chromium } from 'playwright';

async function checkGoogleButton() {
  console.log('🔍 Checking Google OAuth button on https://needport.jp/sign-in...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to sign-in page
    await page.goto('https://needport.jp/sign-in');
    await page.waitForLoadState('networkidle');
    
    // Wait up to 25s for any of the specified Google button selectors
    const googleSelectors = [
      'button:has-text("Google")',
      '[data-testid="google-button"]',
      '[aria-label*="Google"]',
      '.cl-socialButtons button >> text=/google/i'
    ];
    
    console.log('⏳ Waiting up to 25s for Google OAuth button...');
    
    let found = false;
    let foundSelector = '';
    
    for (const selector of googleSelectors) {
      try {
        console.log(`🔍 Trying selector: ${selector}`);
        await page.waitForSelector(selector, { state: 'visible', timeout: 25000 / googleSelectors.length });
        found = true;
        foundSelector = selector;
        console.log(`✅ Found Google button with selector: ${selector}`);
        break;
      } catch {
        console.log(`❌ Selector not found: ${selector}`);
        continue;
      }
    }
    
    // Save screenshot regardless of result
    await page.screenshot({ 
      path: 'artifacts/prod-google-check/signin.png',
      fullPage: true 
    });
    console.log('📷 Screenshot saved: artifacts/prod-google-check/signin.png');
    
    // Print clear result
    if (found) {
      console.log('');
      console.log('🎉 PASS - Google OAuth button found!');
      console.log(`✅ Selector: ${foundSelector}`);
      return true;
    } else {
      console.log('');
      console.log('❌ FAIL - Google OAuth button not found');
      console.log('❌ Tried all selectors within 25s timeout');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error during Google button check:', error);
    
    // Save error screenshot
    await page.screenshot({ 
      path: 'artifacts/prod-google-check/signin-error.png',
      fullPage: true 
    });
    console.log('📷 Error screenshot saved: artifacts/prod-google-check/signin-error.png');
    
    console.log('❌ FAIL - Error occurred during check');
    return false;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  checkGoogleButton()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { checkGoogleButton };