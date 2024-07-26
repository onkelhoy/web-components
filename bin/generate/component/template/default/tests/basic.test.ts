import { test, expect } from '@playwright/test';

test.describe("PLACEHOLDER_FULL_NAME basic tests", () => {
  test.only('available in DOM', async ({ page }) => {
    // Navigate to your test page
    await page.goto('/PLACEHOLDER_NAME');

    // Interact with your component and make assertions
    const component = await page.$('PLACEHOLDER_HTML_NAME');
    expect(component).not.toBeNull();
  });

  test.only('snapshot', async ({ page }) => {
    await page.goto('/PLACEHOLDER_NAME');
    await expect(page).toHaveScreenshot();
  });
});
