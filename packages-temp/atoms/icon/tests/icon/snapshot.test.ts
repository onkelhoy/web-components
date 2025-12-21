import { test, expect } from '@playwright/test';

test.describe("@papit/icon visual regression", () => {
  test('default snapshot', async ({ page }) => {
    await page.goto('icon');
    await expect(page).toHaveScreenshot();
  });
})
