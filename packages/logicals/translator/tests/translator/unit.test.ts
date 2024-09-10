import { test, expect, Locator } from '@playwright/test';

declare global {
  interface Window {
    localization: any;
  }
}

async function toHaveText(loc: Locator, text: string) {
  const actualtext = await loc.evaluate(elm => {
    if (elm instanceof HTMLElement) {
      return {
        innerHTML: elm.innerHTML,
        innerText: elm.innerText,
        textContent: elm.textContent,
      }
    }
    return null;
  });

  expect(actualtext).not.toBeNull();
  expect(actualtext?.innerHTML).toBe(text);
  expect(actualtext?.innerText).toBe(text);
  expect(actualtext?.textContent).toBe(text);
}

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('translator');
  await page.waitForTimeout(1000);
});

// remember - since server will start from /tests and not /tests/translations 
// it cannot access the public folder within.. (maybe another advaced option for server - some lookahead)
test.describe("translator unit tests", () => {
  test("current translation", async ({ page }) => {
    const current = await page.evaluate(() => {
      return window.localization.current;
    });

    expect(current).not.toBeUndefined();
    expect(current).toMatchObject({
      id: "first",
      meta: {
        region: "GB",
        language: "en-UK"
      },
      translations: {
        hello: "world",
        "variable {name}": "{name} poop"
      }
    })
  })

  test("translate sentence", async ({ page }) => {
    const hello = page.getByTestId("hello");
    await toHaveText(hello, "world");
  });

  test("translate sentence with fallback", async ({ page }) => {
    const none = page.getByTestId("none");
    await toHaveText(none, "i dont have translation");
  });

  test("translate sentence with variables", async ({ page }) => {
    const variable = page.getByTestId("variable");
    await toHaveText(variable, "henry poop");
  });
});

test.describe("loading translations", () => {
  test("loading translations by code", async ({ page }) => {
    await page.evaluate(() => {
      window.localization.change('second');
    });

    const current = await page.evaluate(() => {
      return window.localization.current;
    });

    expect(current).not.toBeUndefined();
    expect(current).toMatchObject({
      id: 'second',
      meta: { region: 'second', language: 'second' },
      translations: {
        hello: 'second world',
        "variable {name}": 'second {name} poop'
      }
    });
  });

  test("loading translations by url", async ({ page }) => {
    const hello = page.getByTestId("hello");
    await toHaveText(hello, "world");

    await page.evaluate(() => {
      window.localization.change('custom');
    });

    const current = await page.evaluate(() => {
      return window.localization.current;
    });

    expect(current).not.toBeUndefined();
    expect(current).toMatchObject({
      id: 'custom',
      url: 'public/translations/custom.json',
      meta: { region: 'GB', language: 'en-UK' },
      translations: {
        meta: { region: 'GB', language: 'en-UK' },
        hello: 'custom world',
        variable: 'custom {name} poop'
      }
    });

    await toHaveText(hello, "custom world");
  });
});

test.describe("switching languages", () => {
  test("new translation", async ({ page }) => {
    const hello = page.getByTestId("hello");
    await toHaveText(hello, "world");

    await page.evaluate(() => {
      window.localization.change('second');
    });

    await toHaveText(hello, "second world");
  });

  test("with variables", async ({ page }) => {
    const variable = page.getByTestId("variable");
    await toHaveText(variable, "henry poop");

    await page.evaluate(() => {
      window.localization.change('second');
    });

    await toHaveText(variable, "second henry poop");
  });
});

test.describe.skip("detect", () => {
  test("should detect based on html lang attribute", async ({ page }) => {

  })
  test("should detect based on localStorage", async ({ page }) => {

  })
});
