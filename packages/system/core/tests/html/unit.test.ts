import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('html');
  await page.waitForTimeout(1); // wait for wc to load
});

test.describe("attribute cases", () => {
  test("update should reflected content", async ({ page }) => {
    const component = page.getByTestId("inside");
    expect(component).toHaveAttribute("name", "oscar");
    let pText = await component.evaluate((el: any) => el.querySelector("p")?.textContent);
    expect(pText).not.toBeNull();
    expect(pText).toBe("oscar");

    await component.evaluate((el: any) => el.setAttribute("name", "henry"));
    await page.waitForTimeout(300); // allow to load

    pText = await component.evaluate((el: any) => el.querySelector("p")?.textContent);
    expect(pText).not.toBeNull();
    expect(pText).toBe("henry");
  });

  test("update should reflected content - nested", async ({ page }) => {
    const component = page.getByTestId("outside");
    expect(component).toHaveAttribute("name", "oscar");
    await page.waitForTimeout(300); // allow to load

    let pText = await component.evaluate((el: any) => el.querySelector("attr-inside")?.querySelector('p')?.textContent);
    expect(pText).not.toBeNull();
    expect(pText).toBe("oscar");

    await component.evaluate((el: any) => el.setAttribute("name", "henry"));
    await page.waitForTimeout(300); // allow to load

    pText = await component.evaluate((el: any) => el.querySelector("attr-inside")?.querySelector('p')?.textContent);
    expect(pText).not.toBeNull();
    expect(pText).toBe("henry");
  });

  test("select case base", async ({ page }) => {
    const component = page.getByTestId("select");
    expect(component).toHaveAttribute("name", "oscar");
    const option = await component.evaluate((el: any) => el.querySelector("option[selected]")?.value);
    expect(option).not.toBeNull();
    expect(option).toBe("oscar");
  });

  test("select case update", async ({ page }) => {
    const component = page.getByTestId("select");
    await component.evaluate((el: any) => el.setAttribute("name", "henry"));
    await page.waitForTimeout(300); // allow to load

    const option = await component.evaluate((el: any) => el.querySelector("option[selected]")?.value);
    expect(option).not.toBeNull();
    expect(option).toBe("henry");
  });
});