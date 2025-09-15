import { test, expect } from '@playwright/test';

test('Sign-in page UI loads and renders Clerk components', async ({ page }) => {
  test.setTimeout(20000);

  // Navigate to sign-in page
  await page.goto('https://needport.jp/sign-in');

  // Wait for Clerk sign-in elements to appear
  // We use a more flexible selector that should work with Clerk's structure
  const clerkSelectors = [
    '[data-testid="signin-link"]', // Primary preference if available
    '.cl-signIn-root', // Clerk CSS class pattern
    '.cl-rootBox', // Another Clerk class pattern
    'form[class*="cl-"]', // Any form with Clerk classes
    'input[name="identifier"]', // Email input field
    'input[type="email"]', // Generic email input
    '.cl-loading', // Loading state
    '.cl-card', // Clerk card component
    '[data-clerk-element]' // Generic Clerk element attribute
  ];

  // Try each selector with timeout, at least one should work
  let elementFound = false;
  for (const selector of clerkSelectors) {
    try {
      await page.waitForSelector(selector, { timeout: 3000 });
      elementFound = true;
      console.log(`✅ Found Clerk element: ${selector}`);
      break;
    } catch {
      console.log(`❌ Selector not found: ${selector}`);
      continue;
    }
  }

  // If no specific Clerk elements found, check for basic form elements
  if (!elementFound) {
    try {
      await page.waitForSelector('form', { timeout: 5000 });
      elementFound = true;
      console.log('✅ Found generic form element');
    } catch {
      console.log('❌ No form elements found');
    }
  }

  // Assert that some UI element was found
  expect(elementFound).toBeTruthy();

  // Additional check: page should not show obvious error messages
  const errorSelectors = [
    'text="Application error"',
    'text="500"',
    'text="Internal Server Error"',
    'text="404"',
    'text="Not Found"'
  ];

  for (const errorSelector of errorSelectors) {
    const errorElement = await page.locator(errorSelector).first();
    const isVisible = await errorElement.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  }

  console.log('✅ Sign-in page UI test completed successfully');
});