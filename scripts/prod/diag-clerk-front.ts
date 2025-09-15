#!/usr/bin/env tsx

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import fetch from 'node-fetch';

interface DiagResult {
  timestamp: string;
  url: string;
  clerkFrontendApi?: string;
  clerkLoaded: boolean;
  clerkHosts: string[];
  hostStatuses: Array<{
    host: string;
    dnsResolved: boolean;
    httpStatus?: number;
    error?: string;
  }>;
  consoleErrors: string[];
  scripts: Array<{ src?: string; content?: string }>;
  links: Array<{ href?: string; rel?: string }>;
  classification: 'A' | 'B' | 'C';
  summary: string;
}

async function checkHost(host: string): Promise<{ dnsResolved: boolean; httpStatus?: number; error?: string }> {
  try {
    console.log(`🔍 Checking host: ${host}`);
    const response = await fetch(`https://${host}`, { 
      method: 'GET',
      timeout: 5000,
      headers: { 'User-Agent': 'NeedPort-Clerk-Diagnostics/1.0' }
    });
    return {
      dnsResolved: true,
      httpStatus: response.status
    };
  } catch (error: any) {
    console.log(`❌ Host check failed: ${host} - ${error.message}`);
    if (error.message.includes('ENOTFOUND') || error.message.includes('NAME_NOT_RESOLVED')) {
      return {
        dnsResolved: false,
        error: 'DNS_NOT_RESOLVED'
      };
    }
    return {
      dnsResolved: true,
      error: error.message
    };
  }
}

function extractClerkHosts(html: string): string[] {
  const hosts = new Set<string>();
  
  // Script src から抽出
  const scriptMatches = html.match(/src="[^"]*"/g);
  scriptMatches?.forEach(match => {
    const src = match.match(/src="([^"]*)"/)?.[1];
    if (src) {
      if (src.includes('clerk')) {
        const url = new URL(src, 'https://needport.jp');
        hosts.add(url.hostname);
      }
    }
  });
  
  // Link href から抽出
  const linkMatches = html.match(/href="[^"]*"/g);
  linkMatches?.forEach(match => {
    const href = match.match(/href="([^"]*)"/)?.[1];
    if (href && href.includes('clerk')) {
      try {
        const url = new URL(href, 'https://needport.jp');
        hosts.add(url.hostname);
      } catch {}
    }
  });
  
  // 既知の Clerk ホストパターン
  const knownPatterns = [
    'clerk.needport.jp',
    'allowing-gnat-26.clerk.accounts.dev',
    /[a-z0-9-]+\.clerk\.accounts\.dev/
  ];
  
  knownPatterns.forEach(pattern => {
    if (typeof pattern === 'string') {
      if (html.includes(pattern)) {
        hosts.add(pattern);
      }
    } else {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => hosts.add(match));
      }
    }
  });
  
  return Array.from(hosts);
}

async function diagClerkFrontend() {
  console.log('🔍 Starting Clerk frontend diagnostics...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  const result: DiagResult = {
    timestamp: new Date().toISOString(),
    url: 'https://needport.jp/sign-in',
    clerkLoaded: false,
    clerkHosts: [],
    hostStatuses: [],
    consoleErrors: [],
    scripts: [],
    links: [],
    classification: 'C',
    summary: ''
  };
  
  // コンソールエラーを収集
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      result.consoleErrors.push(text);
      console.log(`📋 Console Error: ${text}`);
    }
  });
  
  try {
    console.log('🌐 Navigating to https://needport.jp/sign-in...');
    await page.goto('https://needport.jp/sign-in', { waitUntil: 'networkidle', timeout: 30000 });
    
    // HTML取得
    const html = await page.content();
    
    // Clerk 関連ホスト抽出
    result.clerkHosts = extractClerkHosts(html);
    console.log(`🔍 Found Clerk hosts: ${result.clerkHosts.join(', ')}`);
    
    // スクリプト・リンク解析
    result.scripts = await page.$$eval('script', scripts => 
      scripts.map(script => ({
        src: script.src || undefined,
        content: script.src ? undefined : script.textContent?.substring(0, 200)
      }))
    );
    
    result.links = await page.$$eval('link', links =>
      links.map(link => ({
        href: link.href || undefined,
        rel: link.rel || undefined
      }))
    );
    
    // 3秒待機して Clerk 初期化を待つ
    await page.waitForTimeout(3000);
    
    // window オブジェクト検査
    const clerkData = await page.evaluate(() => {
      return {
        clerkFrontendApi: (window as any).__clerk_frontend_api,
        clerkLoaded: typeof (window as any).Clerk !== 'undefined',
        clerkInstance: (window as any).Clerk ? 'exists' : 'undefined'
      };
    });
    
    result.clerkFrontendApi = clerkData.clerkFrontendApi;
    result.clerkLoaded = clerkData.clerkLoaded;
    
    console.log(`📊 Clerk Frontend API: ${result.clerkFrontendApi || 'undefined'}`);
    console.log(`📊 Clerk Loaded: ${result.clerkLoaded}`);
    
    // スクリーンショット
    await page.screenshot({ 
      path: 'artifacts/prod-auth-check/02_diag.png',
      fullPage: true 
    });
    console.log('📷 Screenshot saved: artifacts/prod-auth-check/02_diag.png');
    
  } catch (error: any) {
    console.error('❌ Page load error:', error.message);
    result.consoleErrors.push(`Page load error: ${error.message}`);
    
    // エラー時もスクリーンショットを取る
    try {
      await page.screenshot({ 
        path: 'artifacts/prod-auth-check/02_diag_error.png',
        fullPage: true 
      });
    } catch {}
  }
  
  await browser.close();
  
  // ホスト状態チェック
  console.log('🔍 Checking host connectivity...');
  for (const host of result.clerkHosts) {
    const status = await checkHost(host);
    result.hostStatuses.push({
      host,
      ...status
    });
  }
  
  // 分類判定
  if (result.clerkFrontendApi && (result.clerkFrontendApi.includes('clerk.needport.jp') || result.clerkFrontendApi.includes('clerk.') && !result.clerkFrontendApi.includes('.clerk.accounts.dev'))) {
    const hostStatus = result.hostStatuses.find(h => h.host === result.clerkFrontendApi);
    if (hostStatus && !hostStatus.dnsResolved) {
      result.classification = 'A';
      result.summary = `独自ドメイン ${result.clerkFrontendApi} を参照しているがDNS解決できない (ERR_NAME_NOT_RESOLVED)`;
    }
  } else if (result.clerkFrontendApi && result.clerkFrontendApi.includes('.clerk.accounts.dev')) {
    const hasErrors = result.consoleErrors.some(err => err.includes('403') || err.includes('CORS') || err.includes('Failed to load'));
    if (hasErrors || result.hostStatuses.some(h => h.httpStatus && h.httpStatus >= 400)) {
      result.classification = 'B';
      result.summary = `標準 Clerk ドメイン ${result.clerkFrontendApi} を参照しているが 403/CORS/ロードエラー発生`;
    }
  }
  
  if (!result.clerkLoaded || !result.clerkFrontendApi) {
    result.classification = 'C';
    result.summary = `window.Clerk が未定義または __clerk_frontend_api が設定されていない (初期化前レンダリング or 環境変数不整合)`;
  }
  
  // 結果保存
  writeFileSync('artifacts/prod-auth-check/diag.json', JSON.stringify(result, null, 2));
  console.log('📄 Diagnostic report saved: artifacts/prod-auth-check/diag.json');
  
  // 結果サマリー
  console.log('\n🎯 DIAGNOSIS SUMMARY');
  console.log('==================');
  console.log(`Classification: ${result.classification}`);
  console.log(`Summary: ${result.summary}`);
  console.log(`Clerk Frontend API: ${result.clerkFrontendApi || 'undefined'}`);
  console.log(`Clerk Loaded: ${result.clerkLoaded}`);
  console.log(`Console Errors: ${result.consoleErrors.length}`);
  console.log(`Clerk Hosts Found: ${result.clerkHosts.join(', ')}`);
  
  if (result.consoleErrors.length > 0) {
    console.log('\nConsole Errors:');
    result.consoleErrors.slice(0, 3).forEach(err => console.log(`  - ${err}`));
  }
  
  return result;
}

if (require.main === module) {
  diagClerkFrontend()
    .then(result => {
      process.exit(result.classification === 'A' || result.classification === 'B' || result.classification === 'C' ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { diagClerkFrontend };