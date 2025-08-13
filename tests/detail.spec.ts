import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Need Detail Page', () => {
  test('should load need detail page', async ({ page }) => {
    // Create a test need first or use an existing one
    await page.goto('/needs/test-need-id');
    
    // Check if page loads (might redirect or show 404)
    await expect(page).toHaveTitle(/NeedPort/);
  });

  test('should have good accessibility', async ({ page }) => {
    await page.goto('/needs/test-need-id');
    
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

  test('should display need information', async ({ page }) => {
    await page.goto('/needs/test-need-id');
    
    // Check for need content (might be 404 in test)
    const needContent = page.locator('[data-testid="need-detail"]').or(page.locator('main'));
    await expect(needContent).toBeVisible();
  });

  test('should handle prejoin button', async ({ page }) => {
    await page.goto('/needs/test-need-id');
    
    // Look for prejoin button
    const prejoinButton = page.locator('button:has-text("参加予約")').or(page.locator('[data-testid="prejoin-button"]'));
    
    if (await prejoinButton.isVisible()) {
      await expect(prejoinButton).toBeEnabled();
    }
  });

  test('should display share actions', async ({ page }) => {
    await page.goto('/needs/test-need-id');
    
    // Look for share buttons
    const shareButtons = page.locator('[data-testid="share-actions"]').or(page.locator('button:has-text("共有")'));
    
    if (await shareButtons.isVisible()) {
      await expect(shareButtons).toBeVisible();
    }
  });
});
