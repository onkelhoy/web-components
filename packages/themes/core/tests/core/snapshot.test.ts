import { test, expect } from '@playwright/test';

test.describe.skip("@papit/theme-core visual regression", () => {
  test('default snapshot', async ({ page }) => {
    await page.goto('icon');
    await expect(page).toHaveScreenshot();
  });
})
