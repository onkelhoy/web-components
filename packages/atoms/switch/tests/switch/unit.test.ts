import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('switch');
});

test.describe("@papit/switch unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('pap-switch');
    expect(component).not.toBeNull();
  });
});
