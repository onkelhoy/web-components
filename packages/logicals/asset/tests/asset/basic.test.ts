import { test, expect } from '@playwright/test';

test.describe("@papit/asset basic tests", () => {
  test.only('available in DOM', async ({ page }) => {
    // Navigate to your test page
    await page.goto('/asset');

    // Interact with your component and make assertions
    const component = await page.$('pap-asset');
    expect(component).not.toBeNull();
  });

  test.only('snapshot', async ({ page }) => {
    await page.goto('/asset');
    await expect(page).toHaveScreenshot();
  });
});
