#!/usr/bin/env ts-node

interface SmokeTest {
  name: string;
  url: string;
  expectedStatus: number;
  description: string;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const tests: SmokeTest[] = [
  {
    name: 'Home Page',
    url: '/',
    expectedStatus: 200,
    description: 'ホームページが正常に読み込まれる'
  },
  {
    name: 'Discover Page',
    url: '/discover',
    expectedStatus: 200,
    description: 'ディスカバーページが正常に読み込まれる'
  },
  {
    name: 'New Need Page',
    url: '/needs/new',
    expectedStatus: 200,
    description: '新規ニーズ作成ページが正常に読み込まれる'
  },
  {
    name: 'Admin Login Page',
    url: '/admin/login',
    expectedStatus: 200,
    description: '管理者ログインページが正常に読み込まれる'
  },
  {
    name: 'Status Page',
    url: '/status',
    expectedStatus: 200,
    description: 'ステータスページが正常に読み込まれる'
  },
  {
    name: 'Terms Page',
    url: '/terms',
    expectedStatus: 200,
    description: '利用規約ページが正常に読み込まれる'
  },
  {
    name: 'Privacy Page',
    url: '/privacy',
    expectedStatus: 200,
    description: 'プライバシーポリシーページが正常に読み込まれる'
  },
  {
    name: 'Robots.txt',
    url: '/robots.txt',
    expectedStatus: 200,
    description: 'robots.txtが正常に読み込まれる'
  },
  {
    name: 'Sitemap',
    url: '/sitemap.xml',
    expectedStatus: 200,
    description: 'サイトマップが正常に読み込まれる'
  }
];

async function runSmokeTest(test: SmokeTest): Promise<boolean> {
  try {
    console.log(`🔍 Testing: ${test.name}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${BASE_URL}${test.url}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'SmokeTest/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    const success = response.status === test.expectedStatus;
    
    if (success) {
      console.log(`✅ ${test.name}: ${response.status} - ${test.description}`);
    } else {
      console.log(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${response.status} - ${test.description}`);
    }

    return success;
  } catch (error) {
    console.log(`❌ ${test.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function main() {
  console.log(`🚀 Starting smoke tests for ${BASE_URL}`);
  console.log('=' .repeat(50));

  const results = await Promise.all(tests.map(runSmokeTest));
  const passed = results.filter(Boolean).length;
  const total = tests.length;

  console.log('=' .repeat(50));
  console.log(`📊 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All smoke tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some smoke tests failed!');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('Smoke test failed:', error);
  process.exit(1);
});
