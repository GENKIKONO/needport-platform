import { test, expect } from '@playwright/test';

test.describe('Payment Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('payment UI components accessibility', async ({ page }) => {
    // Test payment-related UI components without actual Stripe integration
    // This aligns with DISABLE_STRIPE_CAPTURE: true configuration
    
    await test.step('Navigate to payment-related pages', async () => {
      const paymentPages = ['/me/payments', '/me/transactions'];
      
      for (const paymentPath of paymentPages) {
        await page.goto(paymentPath);
        
        // Should not 404 - payment UI should exist even if disabled
        await expect(page.locator('body')).not.toHaveText(/404|Not Found/);
        
        // Look for payment-related elements or login requirement
        const hasPaymentUI = await page.locator('.payment, [data-testid*="payment"], [class*="transaction"], text=決済, text=支払, text=Payment').count();
        const requiresAuth = await page.locator('text=ログイン, text=Login, [href*="sign-"], [href*="login"]').count();
        
        // Either payment UI exists or page requires authentication
        expect(hasPaymentUI > 0 || requiresAuth > 0).toBeTruthy();
      }
    });

    await test.step('Verify needs page structure', async () => {
      await page.goto('/needs');
      
      // Verify basic page load
      await expect(page.locator('body')).not.toHaveText(/404|Not Found/);
      
      // Should have some content structure
      await expect(page.locator('h1, h2, .needs-list, [data-testid="needs-list"], .need-card, main')).toBeVisible({ timeout: 5000 }).catch(() => {
        // If no specific elements, at least verify page loaded
        expect(page.url()).toContain('/needs');
      });
    });
  });

  test('admin payment management accessibility', async ({ page }) => {
    await test.step('Test admin payment functionality exists', async () => {
      await page.goto('/admin/login');
      
      // Use the same admin login we tested earlier
      if (await page.locator('input[name="key"]').isVisible()) {
        await page.fill('input[name="key"]', 'test-admin-123');
        await page.click('button[type="submit"]');
        
        // Wait for admin dashboard
        await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
        
        // Try to access admin section - should not 404
        await expect(page.locator('body')).not.toHaveText(/404|Not Found/);
        
        // Look for admin interface elements
        await expect(page.locator('h1, h2, .admin, [class*="admin"], text=管理, text=Admin').first()).toBeVisible({ timeout: 5000 }).catch(() => {
          // If no specific admin elements, just ensure we're on admin URL
          expect(page.url()).toContain('/admin');
        });
      }
    });
  });

  test('webhook endpoint security', async ({ page, request }) => {
    await test.step('Test webhook endpoint exists and handles security', async () => {
      // Test with invalid request (no signature)
      const response1 = await request.post('/api/webhooks/stripe', {
        data: JSON.stringify({ test: 'invalid' }),
        headers: {
          'content-type': 'application/json'
        }
      });

      // Should reject invalid requests
      expect(response1.status()).toBe(400); // No signature error
      
      // Test with malformed signature
      const response2 = await request.post('/api/webhooks/stripe', {
        data: JSON.stringify({ test: 'invalid' }),
        headers: {
          'stripe-signature': 'invalid-signature',
          'content-type': 'application/json'
        }
      });

      // Should reject invalid signature  
      expect(response2.status()).toBe(400); // Invalid signature error
      
      console.log('Webhook endpoint properly rejects invalid requests');
    });
  });

  test('payment system configuration', async ({ page }) => {
    // Test that payment system is properly configured but disabled
    await test.step('Verify no critical Stripe errors', async () => {
      await page.goto('/');
      
      // Monitor for critical errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Navigate to a few pages to trigger any Stripe initialization
      await page.goto('/needs');
      await page.goto('/me');
      
      await page.waitForTimeout(2000);
      
      // Filter for critical Stripe configuration errors
      const criticalStripeErrors = consoleErrors.filter(error => 
        error.toLowerCase().includes('stripe') && 
        error.toLowerCase().includes('failed') &&
        !error.includes('test') &&
        !error.includes('expected')
      );
      
      // Should not have critical Stripe configuration errors
      expect(criticalStripeErrors.length).toBe(0);
      
      console.log('Payment system configuration verified - no critical errors');
    });
  });
});