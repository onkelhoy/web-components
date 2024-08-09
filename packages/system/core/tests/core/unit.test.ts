import { test, expect } from '@playwright/test';

test.describe.skip("@papit/core unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Navigate to your test page
    await page.goto('core');

    // Interact with your component and make assertions
    const component = await page.$('pap-core');
    expect(component).not.toBeNull();
  });
});
