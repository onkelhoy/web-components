import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('shadows');
});

test.describe.skip("@papit/page-theme-showcase unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('showcase-shadows');
    expect(component).not.toBeNull();
  });
});
