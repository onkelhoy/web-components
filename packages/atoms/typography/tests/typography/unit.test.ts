import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('typography');
});

test.describe("@papit/typography unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('pap-typography');
    expect(component).not.toBeNull();
  });
});
