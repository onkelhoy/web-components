import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('binary-form-element');
});

test.describe("@papit/binary-form-element unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('');
    expect(component).not.toBeNull();
  });
});
