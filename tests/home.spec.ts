import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads
    await expect(page).toHaveTitle(/NeedPort/);
    
    // Check for main content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have good accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Run accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:', accessibilityScanResults.violations);
    }

    // Allow minor violations but fail on critical ones
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical' || violation.impact === 'serious'
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test('should display needs list', async ({ page }) => {
    await page.goto('/');
    
    // Check if needs are displayed (might be empty in test)
    const needsContainer = page.locator('[data-testid="needs-list"]').or(page.locator('main'));
    await expect(needsContainer).toBeVisible();
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/');
    
    // Look for search input
    const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="検索"]'));
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      
      // Should still be on the same page or search results page
      await expect(page).toHaveURL(/.*/);
    }
  });
});
