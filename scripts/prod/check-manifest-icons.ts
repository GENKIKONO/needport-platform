#!/usr/bin/env tsx

import fetch from 'node-fetch';

const BASE_URL = process.env.PROD_BASE_URL || "https://needport.jp";

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

async function checkUrl(url: string, expectedContentType: string, minContentLength = 0): Promise<CheckResult> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        name: url,
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);

    // Check content type
    if (!contentType.includes(expectedContentType.split('/')[0])) {
      return {
        name: url,
        status: 'FAIL',
        message: `Expected content-type containing '${expectedContentType.split('/')[0]}', got '${contentType}'`
      };
    }

    // Check content length
    if (contentLength < minContentLength) {
      return {
        name: url,
        status: 'FAIL',
        message: `Content too small: ${contentLength} bytes (min: ${minContentLength})`
      };
    }

    return {
      name: url,
      status: 'PASS',
      message: `OK (${contentType}, ${contentLength} bytes)`
    };

  } catch (error) {
    return {
      name: url,
      status: 'FAIL',
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function main(): Promise<void> {
  console.log(`🔍 Checking PWA manifest and icons at ${BASE_URL}...`);
  console.log('');

  const checks: Promise<CheckResult>[] = [
    // Check manifest
    checkUrl(`${BASE_URL}/manifest.webmanifest`, 'application/json'),
    // Check icons
    checkUrl(`${BASE_URL}/icon-192.png`, 'image/png', 1000),
    checkUrl(`${BASE_URL}/icon-512.png`, 'image/png', 1000)
  ];

  const results = await Promise.all(checks);
  
  // Print results
  let hasFailures = false;
  for (const result of results) {
    const emoji = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${emoji} ${result.name}: ${result.message}`);
    if (result.status === 'FAIL') {
      hasFailures = true;
    }
  }

  console.log('');
  
  if (hasFailures) {
    console.log('❌ MANIFEST CHECK FAILED');
    process.exit(1);
  } else {
    console.log('✅ MANIFEST CHECK PASSED');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}