import { test, expect } from '@playwright/test';

test.describe.skip("@papit/server unit tests", () => {

  test('should render HTML page', async ({ page }) => {
    page.goto("server");

    const body = await page.$('body');
    expect(body?.innerText).toMatch("Hello World");
  });

  test('should fetch asset info', async ({ page }) => {

    /* to be implemented */
  });

  test('should render 404', async ({ page }) => {
    /* to be implemented */
  });

  test('should render TREE view', async ({ page }) => {
    /* to be implemented */
  });
});

// OBS these require some different setup where we now start server with CLI options 
test.describe.skip("@papit/server configuration tests", () => {

  test('should render HTML page with wrapper', async ({ page }) => {
    /* to be implemented */
  });

  test('should render TREE view with wrapper', async ({ page }) => {
    /* to be implemented */
  });

  test('should render 404 (custom)', async ({ page }) => {
    /* to be implemented */
  });
});
