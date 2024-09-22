import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('field');
});

test.describe("@papit/field unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('pap-field');
    expect(component).not.toBeNull();
  });
});

// test.describe("field states", () => {
//   test("")
// })
