// tests/monitoring-critical.spec.ts
// Minimal E2E test suite for production monitoring and difference detection

import { test, expect } from '@playwright/test';

test.describe('🎯 Critical Flow Monitoring', () => {
  test.setTimeout(30000); // 30 second timeout for production tests

  test('Homepage accessibility and core navigation', async ({ page }) => {
    // Go to production homepage
    await page.goto(process.env.BASE_URL || 'https://needport.jp');
    
    // Basic accessibility: page should load and have proper title
    await expect(page).toHaveTitle(/NeedPort/);
    
    // Core navigation should be present
    const needsLink = page.locator('a[href*="/needs"], a:has-text("ニーズ")').first();
    await expect(needsLink).toBeVisible({ timeout: 10000 });
    
    // Check for basic page structure
    const mainContent = page.locator('main, [role="main"], .main, #main').first();
    await expect(mainContent).toBeVisible({ timeout: 5000 });
  });

  test('Needs listing page core functionality', async ({ page }) => {
    // Navigate to needs page
    await page.goto(`${process.env.BASE_URL || 'https://needport.jp'}/needs`);
    
    // Page should load successfully
    await expect(page).toHaveTitle(/ニーズ|needs/i);
    
    // Should have some needs content or proper empty state
    const needsContainer = page.locator('.needs, [data-testid="needs"], .card-container, .list').first();
    const emptyMessage = page.locator(':has-text("ニーズがありません"), :has-text("No needs"), :has-text("empty")').first();
    
    // Either needs are present or there's a proper empty state
    const hasContent = await needsContainer.isVisible().catch(() => false);
    const hasEmptyState = await emptyMessage.isVisible().catch(() => false);
    
    expect(hasContent || hasEmptyState).toBe(true);
    
    // If needs are present, check basic card structure
    if (hasContent) {
      const firstNeed = page.locator('.card, [data-testid="need-card"], .need').first();
      await expect(firstNeed).toBeVisible({ timeout: 10000 });
      
      // Should have clickable need title/link
      const needLink = firstNeed.locator('a, [role="button"]').first();
      await expect(needLink).toBeVisible();
    }
  });

  test('Need detail page core functionality', async ({ page }) => {
    // Go to needs listing first
    await page.goto(`${process.env.BASE_URL || 'https://needport.jp'}/needs`);
    
    // Try to click on the first need if available
    const firstNeedLink = page.locator('.card a, [data-testid="need-card"] a, .need a').first();
    
    const linkExists = await firstNeedLink.isVisible().catch(() => false);
    if (linkExists) {
      await firstNeedLink.click();
      
      // Should navigate to detail page
      await page.waitForURL(/\/needs\/[^\/]+/, { timeout: 10000 });
      
      // Detail page should have proper structure
      const needTitle = page.locator('h1, .title, [data-testid="need-title"]').first();
      await expect(needTitle).toBeVisible({ timeout: 5000 });
      
      // Should have some engagement options (button, form, etc)
      const engagementElement = page.locator(
        'button:has-text("応募"), button:has-text("提案"), button:has-text("興味"), .engagement, .apply, [data-testid="engagement"]'
      ).first();
      await expect(engagementElement).toBeVisible({ timeout: 5000 });
    } else {
      console.log('⏭️ No needs available for detail page test - skipping');
    }
  });

  test('Health endpoint comprehensive check', async ({ request }) => {
    const response = await request.get(`${process.env.BASE_URL || 'https://needport.jp'}/api/health`);
    
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    
    // Basic health checks
    expect(health.ok).toBe(true);
    expect(health.version).toBeDefined();
    expect(health.timestamp).toBeDefined();
    
    // System checks
    expect(health.checks).toBeDefined();
    expect(health.checks.nodejs.status).toBe('ok');
    expect(health.checks.database.status).toBe('ok');
    expect(health.checks.supabase.configured).toBe(true);
    
    // Performance check - should respond reasonably fast
    expect(health.responseTimeMs).toBeLessThan(3000);
  });

  test('API endpoints basic availability', async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'https://needport.jp';
    
    // Test key API endpoints return appropriate responses
    const endpoints = [
      { path: '/api/needs', expectStatus: [200, 401] }, // May require auth
      { path: '/api/ready', expectStatus: [200] },
      { path: '/api/health', expectStatus: [200] }
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(`${baseUrl}${endpoint.path}`);
      
      expect(endpoint.expectStatus).toContain(response.status());
      
      // Should return JSON (except for some specific endpoints)
      const contentType = response.headers()['content-type'] || '';
      if (response.status() === 200 && !endpoint.path.includes('/ready')) {
        expect(contentType).toContain('json');
      }
    }
  });

  test('Basic UI responsiveness check', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'https://needport.jp');
    
    // Test different viewport sizes
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Page should still be functional
      const mainContent = page.locator('main, [role="main"], .main, #main, body > div').first();
      await expect(mainContent).toBeVisible();
      
      // Navigation should be accessible (may be in hamburger menu on mobile)
      const needsLink = page.locator('a[href*="/needs"], a:has-text("ニーズ"), .nav-link, .menu-item').first();
      await expect(needsLink).toBeVisible();
    }
  });
});

test.describe('🔧 Performance & Accessibility', () => {
  test('Performance metrics check', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'https://needport.jp');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Basic performance checks using browser APIs
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // Basic performance thresholds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000); // 3s
    expect(performanceMetrics.loadComplete).toBeLessThan(5000); // 5s
    
    console.log('📊 Performance Metrics:', performanceMetrics);
  });

  test('Basic accessibility check', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'https://needport.jp');
    
    // Check for basic accessibility features
    const checks = await page.evaluate(() => {
      return {
        hasTitle: !!document.title,
        hasHeadings: document.querySelectorAll('h1, h2, h3').length > 0,
        hasMainLandmark: !!document.querySelector('main, [role="main"]'),
        hasNavLandmark: !!document.querySelector('nav, [role="navigation"]'),
        imagesWithAlt: Array.from(document.images).every(img => img.alt !== undefined)
      };
    });
    
    expect(checks.hasTitle).toBe(true);
    expect(checks.hasHeadings).toBe(true);
    
    console.log('♿ Accessibility Check Results:', checks);
  });
});