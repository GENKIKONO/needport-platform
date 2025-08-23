import { test, expect } from '@playwright/test';

test.describe('Payment Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('complete payment flow: post need → receive proposal → pay → chat access', async ({ page }) => {
    // Step 1: User posts a need
    await test.step('Post a new need', async () => {
      await page.click('[data-testid="post-need-button"]');
      await page.waitForSelector('[data-testid="need-form"]');
      
      await page.fill('[data-testid="need-title"]', 'Test Need for E2E Payment Flow');
      await page.fill('[data-testid="need-summary"]', 'This is a test need for automated testing of the payment flow');
      await page.fill('[data-testid="need-body"]', 'Detailed description of the test need with contact info: test@example.com');
      
      // Select area
      await page.selectOption('[data-testid="need-area"]', '高知市');
      
      // Select category
      await page.selectOption('[data-testid="need-category"]', 'Webサイト制作');
      
      // Submit form
      await page.click('[data-testid="submit-need"]');
      
      // Wait for success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    // Step 2: Navigate to need detail page (as anonymous user)
    await test.step('View need detail as anonymous user', async () => {
      await page.goto('/needs');
      await page.click('[data-testid="need-card"]:first-child');
      
      // Verify masked content
      await expect(page.locator('[data-testid="disclosure-warning"]')).toBeVisible();
      await expect(page.locator('text=[お支払い後に表示]')).toBeVisible();
      
      // Verify summary is visible
      await expect(page.locator('text=This is a test need for automated testing')).toBeVisible();
    });

    // Step 3: Business user creates proposal
    await test.step('Business user submits proposal', async () => {
      // Switch to business account
      await page.click('[data-testid="auth-menu"]');
      await page.click('[data-testid="login-as-business"]');
      
      // Fill business profile if needed
      await page.fill('[data-testid="business-name"]', 'Test Business Inc.');
      await page.fill('[data-testid="business-email"]', 'business@example.com');
      await page.click('[data-testid="save-profile"]');
      
      // Submit proposal
      await page.click('[data-testid="submit-proposal"]');
      await page.fill('[data-testid="proposal-description"]', 'We can handle this project professionally');
      await page.fill('[data-testid="proposal-amount"]', '100000');
      await page.click('[data-testid="confirm-proposal"]');
      
      await expect(page.locator('[data-testid="proposal-success"]')).toBeVisible();
    });

    // Step 4: Need owner selects proposal (creates match)
    await test.step('Need owner selects proposal', async () => {
      // Switch back to need owner
      await page.click('[data-testid="auth-menu"]');
      await page.click('[data-testid="switch-to-need-owner"]');
      
      // Navigate to my needs
      await page.goto('/me');
      await page.click('[data-testid="my-need"]:first-child');
      
      // Select the proposal
      await page.click('[data-testid="proposal-card"]:first-child');
      await page.click('[data-testid="select-proposal"]');
      
      await expect(page.locator('[data-testid="match-created"]')).toBeVisible();
    });

    // Step 5: Business pays matching fee
    await test.step('Business pays matching fee', async () => {
      // Switch back to business account
      await page.click('[data-testid="auth-menu"]');
      await page.click('[data-testid="switch-to-business"]');
      
      // Navigate to selected matches
      await page.goto('/business/matches');
      await page.click('[data-testid="match-card"]:first-child');
      
      // Initiate payment
      await page.click('[data-testid="pay-matching-fee"]');
      
      // Verify payment amount
      await expect(page.locator('[data-testid="payment-amount"]')).toHaveText('¥100,000');
      
      // Proceed to Stripe Checkout (in test mode)
      await page.click('[data-testid="proceed-to-payment"]');
      
      // Wait for Stripe Checkout page
      await page.waitForURL('**/checkout.stripe.com/**', { timeout: 10000 });
      
      // Fill test card details
      await page.fill('[data-testid="cardNumber"]', '4242424242424242');
      await page.fill('[data-testid="cardExpiry"]', '12/34');
      await page.fill('[data-testid="cardCvc"]', '123');
      await page.fill('[data-testid="billingName"]', 'Test Business');
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Wait for redirect back to app
      await page.waitForURL('**/rooms/**', { timeout: 15000 });
    });

    // Step 6: Verify chat access and profile disclosure
    await test.step('Verify chat access and profile disclosure', async () => {
      // Should be redirected to chat room
      await expect(page.locator('[data-testid="chat-room"]')).toBeVisible();
      
      // Verify can send messages
      await page.fill('[data-testid="message-input"]', 'Hello! Payment completed successfully.');
      await page.click('[data-testid="send-message"]');
      
      await expect(page.locator('[data-testid="message"]').last()).toContainText('Hello! Payment completed successfully.');
      
      // Verify profile disclosure (should show real contact info now)
      await page.goto('/needs/' + await page.getAttribute('[data-testid="need-id"]', 'value'));
      
      // Should no longer see masked content
      await expect(page.locator('[data-testid="disclosure-warning"]')).not.toBeVisible();
      await expect(page.locator('text=test@example.com')).toBeVisible();
      
      // Verify business profile is now visible
      await expect(page.locator('[data-testid="business-profile"]')).toBeVisible();
      await expect(page.locator('text=Test Business Inc.')).toBeVisible();
    });

    // Step 7: Verify payment record and audit trail
    await test.step('Verify payment record', async () => {
      // Check admin panel (if accessible)
      await page.goto('/admin/payments');
      
      // Verify payment record exists
      await expect(page.locator('[data-testid="payment-record"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="payment-status"]').first()).toHaveText('completed');
      await expect(page.locator('[data-testid="payment-amount"]').first()).toHaveText('¥100,000');
    });
  });

  test('payment failure handling', async ({ page }) => {
    // Similar setup but with failed payment scenario
    await test.step('Setup failed payment scenario', async () => {
      // ... similar setup steps ...
      
      // Use card that will be declined
      await page.fill('[data-testid="cardNumber"]', '4000000000000002');
      await page.fill('[data-testid="cardExpiry"]', '12/34');
      await page.fill('[data-testid="cardCvc"]', '123');
      
      await page.click('[data-testid="submit-payment"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      
      // Should not have access to chat
      await page.goto('/rooms/test-room');
      await expect(page.locator('[data-testid="payment-required"]')).toBeVisible();
    });
  });

  test('webhook idempotency', async ({ page, request }) => {
    await test.step('Test webhook idempotency', async () => {
      // Create a test session
      const sessionData = {
        id: 'cs_test_idempotency',
        payment_intent: 'pi_test_idempotency',
        amount_total: 5000,
        currency: 'jpy',
        metadata: {
          match_id: 'match-test',
          business_id: 'business-test',
          need_id: 'need-test'
        }
      };

      // Send webhook event twice
      const webhookPayload = {
        id: 'evt_test_idempotency',
        type: 'checkout.session.completed',
        data: {
          object: sessionData
        }
      };

      // First webhook call
      const response1 = await request.post('/api/stripe/webhook', {
        data: JSON.stringify(webhookPayload),
        headers: {
          'stripe-signature': 'test-signature',
          'content-type': 'application/json'
        }
      });

      expect(response1.status()).toBe(200);

      // Second webhook call (should be idempotent)
      const response2 = await request.post('/api/stripe/webhook', {
        data: JSON.stringify(webhookPayload),
        headers: {
          'stripe-signature': 'test-signature',
          'content-type': 'application/json'
        }
      });

      expect(response2.status()).toBe(200);

      // Verify only one payment record was created
      await page.goto('/admin/payments');
      const paymentRecords = await page.locator('[data-testid="payment-record"]').count();
      expect(paymentRecords).toBe(1);
    });
  });
});
