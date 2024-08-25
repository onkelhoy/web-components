import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('showcase');
});

test.describe.skip("showcase unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('pap-showcase');
    expect(component).not.toBeNull();
  });
});
