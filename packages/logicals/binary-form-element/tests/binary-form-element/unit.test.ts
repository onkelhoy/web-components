import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('binary-form-element');
});

declare global {
  interface Window {
    EVENT_EMITTED: any;
    EVENT_VALUE: any;
  }
}

test.describe("unit tests", () => {
  test("sanity test", async ({ page }) => {
    const targeta = page.getByTestId("a");
    await expect(targeta).toHaveRole("checkbox");
    await targeta.setChecked(true);
    await expect(targeta).toBeChecked();
    await targeta.setChecked(false);
    await expect(targeta).not.toBeChecked();
  });

  test("clicking should trigger change event", async ({ page }) => {
    const target = page.getByTestId("a");
    expect(await target.evaluate(elm => (elm as any).checked)).toBeFalsy();
    await target.click();
    expect(await target.evaluate(elm => (elm as any).checked)).toBeTruthy();
  });

  test("enter keypress should trigger active class", async ({ page }) => {
    const target = page.getByTestId("a");

    await target.focus();

    await target.dispatchEvent("keydown", { key: "Enter" });
    await expect(target).toHaveClass("active");
    await target.dispatchEvent("keyup", { key: "Enter" });
    await expect(target).not.toHaveClass("active");
  })

  test.skip("enter should trigger change event", async ({ page }) => {
    const target = page.getByTestId("a");
    expect(await target.evaluate(elm => (elm as any).checked)).toBeFalsy();
    await target.focus();
    await target.press("Enter");
    expect(await target.evaluate(elm => (elm as any).checked)).toBeTruthy();
  });
});

test.describe("disabled tests", () => {
  test("disabled click should not trigger change event", async ({ page }) => {
    const target = page.getByTestId("disabled");
    expect(target).toBeDisabled();
  });

  test("disabledenter keypress should not trigger active class", async ({ page }) => {
    const target = page.getByTestId("disabled");

    await target.focus();

    await target.dispatchEvent("keydown", { key: "Enter" });
    await expect(target).not.toHaveClass("active");
  });

  test("disabled enter should not trigger change event", async ({ page }) => {
    const target = page.getByTestId("disabled");
    expect(await target.evaluate(elm => (elm as any).checked)).toBeFalsy();
    await target.focus();
    await target.press("Enter");
    expect(await target.evaluate(elm => (elm as any).checked)).toBeFalsy();
  });
})

test.describe("form tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test("form submit should receive default checked and checked (default html)", async ({ page }) => {
    await page.getByTestId("submit").click();

    const results = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return null;

      const formdata = new FormData(form);
      return {
        a: formdata.get("a") || "false",
        b: formdata.get("b") || "false",
        c: formdata.get("c") || "false",
      }
    });

    expect(results).not.toBe(null);
    expect(results).toMatchObject({
      a: "false",
      b: "true",
      c: "true",
    });
  });

  test("form submit should receive updated values", async ({ page }) => {
    await page.getByTestId("a").click();
    await page.getByTestId("b").click();
    await page.getByTestId("submit").click();

    const results = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return null;

      const formdata = new FormData(form);
      return {
        a: formdata.get("a") || "false",
        b: formdata.get("b") || "false",
        c: formdata.get("c") || "false",
      }
    });

    expect(results).not.toBe(null);
    expect(results).toMatchObject({
      a: "true",
      b: "false",
      c: "true",
    });
  });

  test("form reset should trigger reset with respect to default-checked", async ({ page }) => {
    await page.getByTestId("a").click();
    await page.getByTestId("b").click();
    await page.getByTestId("reset").click();
    await page.getByTestId("submit").click();

    const results = await page.evaluate(() => {
      const form = document.querySelector("form");
      if (!form) return null;

      const formdata = new FormData(form);
      return {
        a: formdata.get("a") || "false",
        b: formdata.get("b") || "false",
        c: formdata.get("c") || "false",
      }
    });

    expect(results).not.toBe(null);
    expect(results).toMatchObject({
      a: "false",
      b: "true",
      c: "true",
    });
  });
});
