import { test, expect } from '@playwright/test';

test.describe.skip("@papit/theme-core unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Navigate to your test page
    await page.goto('core');
  });
});
