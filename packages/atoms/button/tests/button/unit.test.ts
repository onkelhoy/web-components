import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('button');
});

test.describe("button unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('pap-button');
    expect(component).not.toBeNull();
  });
});

test.describe("button form", () => {
  test("should submit a form", async ({ page }) => {
    const form = page.getByTestId("form");
    const submitevent = form.evaluate((element) => {
      return new Promise<{ a: string, b: string } | null>(res => {
        (element as HTMLFormElement).addEventListener("submit", (e: SubmitEvent) => {
          if (e.target instanceof HTMLFormElement) {
            const formdata = new FormData(e.target);
            res({
              a: formdata.get("a") as string,
              b: formdata.get("b") as string,
            });
          }
          else {
            res(null);
          }
        });
      })
    });

    await page.getByTestId("a").fill("hello");
    await page.getByTestId("submit").click();

    const results = await submitevent;
    expect(results).not.toBe(null);
    expect(results).toMatchObject({
      a: "hello",
      b: "value",
    });
  });

  test("should reset a form", async ({ page }) => {
    const form = page.getByTestId("form");
    const submitevent = form.evaluate((element) => {
      return new Promise<{ a: string, b: string } | null>(res => {
        (element as HTMLFormElement).addEventListener("submit", (e: SubmitEvent) => {
          if (e.target instanceof HTMLFormElement) {
            const formdata = new FormData(e.target);
            res({
              a: formdata.get("a") as string,
              b: formdata.get("b") as string,
            });
          }
          else {
            res(null);
          }
        });
      })
    });

    await page.getByTestId("a").fill("hello");
    await page.getByTestId("reset").click();
    await page.getByTestId("submit").click();

    const results = await submitevent;
    expect(results).not.toBe(null);
    expect(results).toMatchObject({
      a: "value",
      b: "value",
    });
  });
})
