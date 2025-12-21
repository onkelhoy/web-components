import { test, expect } from '@playwright/test';

test.describe("@papit/asset unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Navigate to your test page
    await page.goto('asset');

    // Interact with your component and make assertions
    const component = await page.$('pap-asset');
    expect(component).not.toBeNull();
  });
});
