#!/usr/bin/env node

/**
 * Clerk Configuration Checker
 * 
 * Validates Clerk settings that could affect E2E testing
 */

const https = require('https');

async function checkClerkConfig() {
  console.log('🔍 Checking Clerk Configuration for E2E Testing...\n');
  
  const checks = {
    emailPasswordEnabled: false,
    testAccountCreatable: false,
    productionInstance: false
  };
  
  // Check if we can access the sign-in page and identify auth methods
  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request('https://needport.jp/sign-in', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.end();
    });
    
    console.log(`✅ Sign-in page accessible (${response.statusCode})`);
    
    // Check for email/password form elements
    if (response.body.includes('input[type="email"]') || 
        response.body.includes('input[name="identifier"]') ||
        response.body.includes('input[type="password"]')) {
      checks.emailPasswordEnabled = true;
      console.log('✅ Email/Password authentication appears enabled');
    } else {
      console.log('❌ Email/Password authentication may be disabled');
      console.log('   Check Clerk Dashboard → User & Authentication → Email, phone, username');
    }
    
    // Check for production instance indicators
    if (response.body.includes('clerk') && !response.body.includes('localhost')) {
      checks.productionInstance = true;
      console.log('✅ Production Clerk instance detected');
    }
    
  } catch (error) {
    console.log('❌ Failed to access sign-in page:', error.message);
  }
  
  console.log('\n🔧 Required Clerk Dashboard Settings:');
  console.log('1. User & Authentication → Email, phone, username:');
  console.log('   ✓ Email address: Required');
  console.log('   ✓ Password: Required');
  console.log('');
  console.log('2. User & Authentication → Restrictions:');
  console.log('   ✓ Allow sign-ups: Enabled (for test account creation)');
  console.log('');
  console.log('3. User & Authentication → Social connections:');
  console.log('   ✓ Email/Password should be primary method');
  console.log('');
  console.log('4. Sessions:');
  console.log('   ✓ Session token lifetime: Standard (not too short)');
  
  console.log('\n📋 Verification Checklist:');
  console.log(`${checks.emailPasswordEnabled ? '✅' : '❌'} Email/Password authentication`);
  console.log(`${checks.productionInstance ? '✅' : '❌'} Production instance`);
  
  if (!checks.emailPasswordEnabled) {
    console.log('\n🚨 Action Required:');
    console.log('1. Go to Clerk Dashboard → Your App → User & Authentication');
    console.log('2. Ensure "Email address" is set to "Required"');
    console.log('3. Ensure "Password" is set to "Required"');
    console.log('4. Save settings and wait for propagation');
  }
  
  console.log('\n🧪 Test Account Requirements:');
  console.log('- Email: Valid format, accessible for verification');
  console.log('- Password: Meet strength requirements (8+ chars, mixed case, numbers)');
  console.log('- Account: Should be created through normal sign-up flow');
  
  return checks;
}

if (require.main === module) {
  checkClerkConfig().catch(console.error);
}

module.exports = checkClerkConfig;