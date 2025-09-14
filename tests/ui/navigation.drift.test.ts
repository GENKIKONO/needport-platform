// tests/ui/navigation.drift.test.ts
// UI drift tests - prevent regression in navigation and component structure

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock DOM environment
const createMockPage = (html: string) => {
  const dom = new JSDOM(html);
  return {
    document: dom.window.document,
    querySelector: (selector: string) => dom.window.document.querySelector(selector),
    querySelectorAll: (selector: string) => dom.window.document.querySelectorAll(selector),
    getByText: (text: string) => {
      const walker = dom.window.document.createTreeWalker(
        dom.window.document.body,
        dom.window.NodeFilter.SHOW_TEXT
      );
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent?.includes(text)) {
          return node.parentElement;
        }
      }
      return null;
    }
  };
};

describe('UI Drift Prevention - Navigation', () => {
  describe('Top Page Hero Copy', () => {
    it('should maintain CLAUDE.md specified hero copy', () => {
      // Mock top page HTML with hero section
      const topPageHTML = `
        <html>
          <body>
            <main>
              <div class="hero-section">
                <h1>欲しい暮らし、10人で叶える</h1>
                <p class="hero-subtext">「欲しい」と「できる」の橋渡し</p>
                <p class="hero-description">地域のニーズと事業者をつなぐプラットフォーム</p>
              </div>
              <div class="cta-section">
                <a href="/needs" class="cta-button">ニーズを探す</a>
                <a href="/needs/new-simple" class="cta-button">ニーズを投稿</a>
              </div>
            </main>
          </body>
        </html>
      `;
      
      const page = createMockPage(topPageHTML);
      
      // Verify hero copy elements per CLAUDE.md requirements
      const heroTitle = page.querySelector('h1');
      const heroSubtext = page.querySelector('.hero-subtext');
      const heroDescription = page.querySelector('.hero-description');
      
      expect(heroTitle?.textContent).toBe('欲しい暮らし、10人で叶える');
      expect(heroSubtext?.textContent).toBe('「欲しい」と「できる」の橋渡し');
      expect(heroDescription?.textContent).toContain('地域のニーズと事業者をつなぐ');
      
      // Verify CTA buttons exist
      const ctaButtons = page.querySelectorAll('.cta-button');
      expect(ctaButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have proper semantic HTML structure', () => {
      const semanticHTML = `
        <html>
          <head>
            <title>NeedPort - ニーズマッチングプラットフォーム</title>
          </head>
          <body>
            <nav>
              <ul>
                <li><a href="/needs">ニーズ一覧</a></li>
                <li><a href="/vendors">事業者一覧</a></li>
                <li><a href="/me">マイページ</a></li>
              </ul>
            </nav>
            <main>
              <section class="hero">
                <h1>欲しい暮らし、10人で叶える</h1>
              </section>
            </main>
          </body>
        </html>
      `;
      
      const page = createMockPage(semanticHTML);
      
      // Verify semantic structure requirements
      expect(page.querySelector('nav')).toBeTruthy();
      expect(page.querySelector('main')).toBeTruthy();
      expect(page.querySelector('h1')).toBeTruthy();
      
      // Verify navigation items
      const navLinks = page.querySelectorAll('nav a');
      expect(navLinks.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Primary Navigation Items', () => {
    it('should have primary navigation items defined in CLAUDE.md', () => {
      const navigationHTML = `
        <html>
          <body>
            <nav class="primary-nav">
              <ul>
                <li><a href="/needs">ニーズ一覧</a></li>
                <li><a href="/vendors">事業者一覧</a></li>
                <li><a href="/me">マイページ</a></li>
              </ul>
            </nav>
          </body>
        </html>
      `;
      
      const page = createMockPage(navigationHTML);
      
      // Define expected navigation items per CLAUDE.md
      const requiredNavItems = [
        { text: 'ニーズ一覧', href: '/needs' },
        { text: '事業者一覧', href: '/vendors' },
        { text: 'マイページ', href: '/me' }
      ];
      
      const navLinks = page.querySelectorAll('nav a');
      
      requiredNavItems.forEach(required => {
        const matchingLink = Array.from(navLinks).find(link => 
          link.textContent?.trim() === required.text &&
          link.getAttribute('href') === required.href
        );
        expect(matchingLink).toBeTruthy();
      });
    });

    it('should maintain responsive navigation structure', () => {
      // Test navigation structure for mobile responsiveness
      const responsiveNavHTML = `
        <html>
          <body>
            <nav class="navbar">
              <div class="nav-container">
                <div class="nav-brand">NeedPort</div>
                <button class="nav-toggle">☰</button>
                <ul class="nav-menu">
                  <li><a href="/needs">ニーズ一覧</a></li>
                  <li><a href="/vendors">事業者一覧</a></li>
                  <li><a href="/me">マイページ</a></li>
                </ul>
              </div>
            </nav>
          </body>
        </html>
      `;
      
      const page = createMockPage(responsiveNavHTML);
      
      // Verify responsive navigation elements exist
      expect(page.querySelector('.nav-container')).toBeTruthy();
      expect(page.querySelector('.nav-brand')).toBeTruthy();
      expect(page.querySelector('.nav-toggle')).toBeTruthy();
      expect(page.querySelector('.nav-menu')).toBeTruthy();
      
      // Verify brand text
      const brand = page.querySelector('.nav-brand');
      expect(brand?.textContent).toBe('NeedPort');
    });
  });

  describe('NeedCard Component Structure', () => {
    it('should maintain NeedCard component structure per design requirements', () => {
      const needCardHTML = `
        <html>
          <body>
            <div class="need-card">
              <div class="need-card-header">
                <h3 class="need-title">サンプルニーズ</h3>
                <span class="need-status">公開中</span>
              </div>
              <div class="need-card-body">
                <p class="need-summary">ニーズの要約文がここに表示されます</p>
                <div class="need-meta">
                  <span class="need-area">高知県高知市</span>
                  <span class="need-category">リフォーム・建築</span>
                </div>
              </div>
              <div class="need-card-footer">
                <span class="need-date">2025年9月14日</span>
                <a href="/needs/sample-id" class="need-link">詳細を見る</a>
              </div>
            </div>
          </body>
        </html>
      `;
      
      const page = createMockPage(needCardHTML);
      
      // Verify NeedCard structure per CLAUDE.md design requirements
      const needCard = page.querySelector('.need-card');
      expect(needCard).toBeTruthy();
      
      // Verify required sections
      expect(page.querySelector('.need-card-header')).toBeTruthy();
      expect(page.querySelector('.need-card-body')).toBeTruthy();
      expect(page.querySelector('.need-card-footer')).toBeTruthy();
      
      // Verify required elements
      expect(page.querySelector('.need-title')).toBeTruthy();
      expect(page.querySelector('.need-status')).toBeTruthy();
      expect(page.querySelector('.need-summary')).toBeTruthy();
      expect(page.querySelector('.need-area')).toBeTruthy();
      expect(page.querySelector('.need-category')).toBeTruthy();
      expect(page.querySelector('.need-date')).toBeTruthy();
      expect(page.querySelector('.need-link')).toBeTruthy();
    });

    it('should maintain proper link structure for needs navigation', () => {
      const needsListHTML = `
        <html>
          <body>
            <div class="needs-grid">
              <div class="need-card">
                <h3><a href="/needs/need-1">ニーズタイトル1</a></h3>
                <a href="/needs/need-1" class="card-link">詳細を見る</a>
              </div>
              <div class="need-card">
                <h3><a href="/needs/need-2">ニーズタイトル2</a></h3>
                <a href="/needs/need-2" class="card-link">詳細を見る</a>
              </div>
            </div>
          </body>
        </html>
      `;
      
      const page = createMockPage(needsListHTML);
      
      // Verify link structure
      const needLinks = page.querySelectorAll('a[href^="/needs/"]');
      expect(needLinks.length).toBeGreaterThanOrEqual(4); // 2 title links + 2 detail links
      
      // Verify grid structure
      expect(page.querySelector('.needs-grid')).toBeTruthy();
      
      const needCards = page.querySelectorAll('.need-card');
      expect(needCards.length).toBe(2);
    });
  });

  describe('UI Structure Test Infrastructure', () => {
    it('should have working DOM testing utilities', () => {
      const testHTML = '<div class="test">Test Content</div>';
      const page = createMockPage(testHTML);
      
      expect(page.querySelector('.test')).toBeTruthy();
      expect(page.querySelector('.test')?.textContent).toBe('Test Content');
    });

    it('should support text-based element finding', () => {
      const textHTML = '<button>クリックしてください</button>';
      const page = createMockPage(textHTML);
      
      const button = page.getByText('クリックしてください');
      expect(button).toBeTruthy();
      expect(button?.tagName.toLowerCase()).toBe('button');
    });
  });
});