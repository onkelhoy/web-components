import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('prefix-suffix');
});

test.describe("prefix-suffix unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('pap-prefix-suffix');
    expect(component).not.toBeNull();
  });
});
