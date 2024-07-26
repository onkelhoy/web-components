import { test, expect } from '@playwright/test';

test.describe("@papit/icon basic tests", () => {
  test.only('available in DOM', async ({ page }) => {
    // Navigate to your test page
    await page.goto('/icon');

    // Interact with your component and make assertions
    const component = await page.$('pap-icon');
    expect(component).not.toBeNull();
  });

  test.only('snapshot', async ({ page }) => {
    await page.goto('/icon');
    await expect(page).toHaveScreenshot();
  });
})
