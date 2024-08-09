import { test, expect } from '@playwright/test';

test.describe("PLACEHOLDER_FULL_NAME visual regression", () => {
  test('default snapshot', async ({ page }) => {
    await page.goto('PLACEHOLDER_HTML_NAME');
    await expect(page).toHaveScreenshot();
  });
})
