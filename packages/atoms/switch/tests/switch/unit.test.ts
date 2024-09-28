import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('switch');
});

test.describe("@papit/switch unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('pap-switch');
    expect(component).not.toBeNull();
  });

  test("clicking should result in switch checked", async ({ page }) => {
    const switchelm = page.getByTestId("base-target");
    await switchelm.click();

    let state = await switchelm.evaluate(elm => {
      return { property: (elm as any).checked, attribute: elm.getAttribute("checked") }
    });

    expect(state.property).toBeTruthy();
    expect(state.attribute).toBe("true");

    // now toggle it back
    await switchelm.click();

    state = await switchelm.evaluate(elm => {
      return { property: (elm as any).checked, attribute: elm.getAttribute("checked") }
    });

    expect(state.property).toBeFalsy();
    expect(state.attribute).toBe(null);
  });

  test("clicking should trigger change event", async ({ page }) => {
    const switchelm = page.getByTestId("base-target");
    const event = switchelm.evaluate(element => {
      return new Promise<number>(res => element.addEventListener("change", () => res(1)));
    });

    await switchelm.click();
    const changeevent = await event;
    expect(changeevent).toBe(1);
  });

  test.only("enter keypress should trigger change event", async ({ page }) => {
    const switchelm = page.getByTestId("base-target");
    const event = switchelm.evaluate(element => {
      return new Promise<number>(res => element.addEventListener("change", () => res(1)));
    });

    await switchelm.focus();
    await page.keyboard.up("Enter");

    const changeevent = await event;
    expect(changeevent).toBe(1);
  });
});

test.describe.skip("switch form", () => {
  test("should submit a form", async ({ page }) => {
    const form = page.getByTestId("form");
    const submitevent = await form.evaluate((element) => {
      return () => new Promise<{ a: string, b: string } | null>(res => {
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

    await page.getByTestId("a").click();
    await page.getByTestId("submit").click();

    const results = await submitevent();
    expect(results).not.toBe(null);
    expect(results).toMatchObject({
      a: true,
      b: false,
    });
  });

  test("should reset a form", async ({ page }) => {
    const form = page.getByTestId("form");
    const submitevent = await form.evaluate((element) => {
      return () => new Promise<{ a: string, b: string } | null>(res => {
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

    await page.getByTestId("a").click();
    await page.getByTestId("reset").click();
    await page.getByTestId("submit").click();

    const results = await submitevent();
    expect(results).not.toBe(null);
    expect(results).toMatchObject({
      a: false,
      b: false,
    });
  });
});
