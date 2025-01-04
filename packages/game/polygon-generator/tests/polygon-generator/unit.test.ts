import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('polygon-generate');
});

test.describe("shape matcher", () => {
  test('image 01', async ({ page }) => {
    // Interact with your component and make assertions
    // const component = await page.$('polygon-generate');
    // expect(component).not.toBeNull();
  });
});
