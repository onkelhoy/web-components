import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('theme-showcase');
});

test.describe.skip("theme-showcase unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('theme-showcase');
    expect(component).not.toBeNull();
  });
});
