import { test, expect } from '@playwright/test';

test.describe("showcase visual regression", () => {
  test('default snapshot', async ({ page }) => {
    await page.goto('pap-showcase');
    await expect(page).toHaveScreenshot();
  });
})
