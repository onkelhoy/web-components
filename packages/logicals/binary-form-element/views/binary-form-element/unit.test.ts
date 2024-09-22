import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('binary-form-element');
});

test.describe("bindary-form-element unit tests", () => {
  test("clicking should trigger change event", async ({ page }) => {
    const target = page.getByTestId("a");
    const event = target.evaluate(element => new Promise<boolean>(res => element.addEventListener("change", e => res(!!(e.target as any)?.checked))));

    await target.click();
    const result = await event;
    expect(result).toBeTruthy();
  });

  test.only("enter keypress should trigger active class", async ({ page }) => {
    const target = page.getByTestId("a");

    await target.focus();

    await target.press("Enter", { delay: 10 });

    await expect(target).toHaveClass("active");

    await page.waitForTimeout(10);

    await expect(target).not.toHaveClass("active");
  })

  test("enter should trigger change event", async ({ page }) => {
    const target = page.getByTestId("a");
    const event = target.evaluate(element => new Promise<boolean>(res => element.addEventListener("change", e => res(!!(e.target as any)?.checked))));

    await target.focus();
    await page.keyboard.up("Enter");
    const result = await event;
    expect(result).toBeTruthy();
  });
});

test.describe("bindary-form-element form tests", () => {
  test("form submit should receive values", async ({ page }) => {
    // const 
  });

  test("form reset should trigger reset with respect to default-checked", async ({ page }) => {

  });
});
