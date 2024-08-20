import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('router');
});

test.describe("router - basic unit tests", () => {
  test('available in DOM', async ({ page }) => {

    // Interact with your component and make assertions
    const component = await page.$('pap-router');
    expect(component).not.toBeNull();
  });


});

test.describe("router - configuration", () => {

  test("update-url: true", async ({ page }) => {
    const initialURL = page.url();

    const router = await page.getByTestId("target");
    await router.evaluate(element => element.setAttribute("update-url", "true"));

    // wait so router can initiate
    await page.waitForTimeout(2000);

    const url = page.url();

    expect(url).not.toBe(initialURL);
  });
  test("update-url: false", async ({ page }) => {
    const router = await page.getByTestId("target");
    await router.evaluate(element => element.setAttribute("update-url", "false"));

    const initialURL = page.url();

    // wait so router can initiate
    await page.waitForTimeout(2000);

    const url = page.url();

    expect(url).toBe(initialURL);
  });

  test("trailing slash: true", async ({ page }) => {
    const router = await page.getByTestId("target");
    await router.evaluate(element => element.setAttribute("trailing-slash", "true"));

    // wait so router can initiate
    await page.waitForTimeout(2000);

    const url = page.url();

    expect(url.endsWith("/router/#/")).toBeTruthy();
  });
  test("trailing slash: false", async ({ page }) => {
    const router = await page.getByTestId("target");
    await router.evaluate(element => element.setAttribute("trailing-slash", "false"));

    // wait so router can initiate
    await page.waitForTimeout(2000);

    const url = page.url();

    expect(url.endsWith("/router/#")).toBeTruthy();
  });

  test("omitters", async ({ page }) => {
    const router = await page.getByTestId("target");
    await router.evaluate(element => {
      (element as any).omitters = ["script"]; // this should make ALL scripts unavailable 
    });

    // wait so router can initiate
    await page.waitForTimeout(2000);

    // naviagate to document A 
    await page.getByTestId("button-a").click();

    const { scripts, styles } = await router.evaluate(element => {
      return {
        scripts: (element as any).head.querySelectorAll("script").length,
        styles: (element as any).head.querySelectorAll("style").length,
      }
    });

    expect(scripts).toBe(0);
    expect(styles).not.toBe(0);
  });
});

test.describe("router - mappings", () => {
  test("mappings - bash-based: false", async ({ page }) => {
    const router = await page.getByTestId("target");
    await router.evaluate(element => element.setAttribute("hash-based", "true"));

    // wait so router can initiate
    await page.waitForTimeout(2000);
    await page.getByTestId("button-hello-world").click()
    await page.waitForTimeout(2000);

    const url = page.url()

    // make sure a document was actully loaded
    const firstp = await page.getByTestId('first-p');
    expect(firstp).not.toBeNull();

    // make sure document A ws loaded
    expect(firstp).toHaveText("First Paragraph C updated");

    expect(url.endsWith("router/#/hello/world/")).toBeTruthy();
  });

  test("mappings - bash-based: true", async ({ page }) => {
    const router = await page.getByTestId("target");
    await router.evaluate(element => element.setAttribute("hash-based", "true"));

    // wait so router can initiate
    await page.waitForTimeout(2000);
    await page.getByTestId("button-hello-world").click()
    await page.waitForTimeout(2000);

    const url = page.url()

    // make sure a document was actully loaded
    const firstp = await page.getByTestId('first-p');
    expect(firstp).not.toBeNull();

    // make sure document A ws loaded
    expect(firstp).toHaveText("First Paragraph C updated");

    expect(url.endsWith("/router/#/hello/world/")).toBeTruthy();
  });

  test("mappings - param variable", async ({ page }) => {
    // wait so router can initiate
    await page.waitForTimeout(2000);
    await page.getByTestId("button-hello-foo-world-ABC").click()
    await page.waitForTimeout(2000);

    const router = await page.getByTestId("target");
    const foo = await router.evaluate(element => {
      return (element as any).params.foo;
    });

    expect(foo).toBe("ABC");

    const firstp = await page.getByTestId("first-p");
    expect(firstp).toHaveText("First Paragraph C updated")

    // make sure a document was actully loaded
    const param = await page.getByTestId('param');
    expect(param).not.toBeNull();

    // make sure document A ws loaded
    expect(param).toHaveText("ABC");
  });
})

test.describe("router - sources", () => {

  test("styles should have updated references", async ({ page }) => {

    await page.waitForTimeout(2000); // allow router to setup 
    await page.getByTestId("button-a").click();
    await page.waitForTimeout(2000); // wait for document to load 

    const firstp = await page.getByTestId("first-p");

    expect(firstp).toHaveCSS("color", "rgb(199, 75, 75)");
  });

  test("javascript should have updated references", async ({ page }) => {

    await page.waitForTimeout(2000); // allow router to setup 
    await page.getByTestId("button-a").click();
    await page.waitForTimeout(2000); // wait for document to load 

    const firstp = await page.getByTestId("first-p");
    expect(firstp).toHaveText("First Paragraph A updated")
  });

  test("switching document should flush the old sources", async ({ page }) => {

    await page.waitForTimeout(2000); // allow router to setup 
    await page.getByTestId("button-a").click();
    await page.waitForTimeout(2000); // wait for document to load 

    const router = await page.getByTestId("target");
    const hashes = await router.evaluate(element => {
      const hashes: string[] = [];
      ((element as any).head as HTMLElement).querySelectorAll("[data-hash]").forEach(source => {
        const hash = source.getAttribute("data-hash");
        if (hash) hashes.push(hash);
      });

      return hashes;
    });

    await page.getByTestId("button-c").click();
    await page.waitForTimeout(2000); // wait for document to load 

    const containsHashes = await router.evaluate((element, hashes) => {
      ((element as any).head as HTMLElement).querySelectorAll("[data-hash]").forEach(source => {
        const hash = source.getAttribute("data-hash");
        if (hash && hashes.includes(hash)) return true;
      });

      return false;
    }, hashes);

    expect(containsHashes).toBeFalsy();
  });

  test("hash based should also recieve their sources", async ({ page }) => {

    await page.waitForTimeout(2000); // allow router to setup 
    await page.getByTestId("button-a").click();
    await page.waitForTimeout(2000); // wait for document to load 

  });

  test("document load + refresh should also load sources", async ({ page }) => {
    const router = await page.getByTestId("target");
    // await router.evaluate(element => element.setAttribute("hash-based", "true"));

    await page.waitForTimeout(2000); // allow router to setup 
    await page.getByTestId("button-hello-world").click();
    await page.waitForTimeout(2000); // wait for document to load 

    const url = page.url();

    const oldsources = await router.evaluate(element => {
      return {
        scripts: (element as any).head.querySelectorAll("script").length,
        styles: (element as any).head.querySelectorAll("style").length,
      }
    });

    expect(oldsources.scripts).toBeGreaterThan(1);
    expect(oldsources.styles).toBeGreaterThan(1);

    // just playwright omitting hash urls so we "reload" then go to url (to simulate a real reload..)
    await page.reload();
    // await page.goto(url);
    await page.waitForTimeout(2000); // allow router to setup 

    expect(url).toBe(page.url());

    const newsources = await router.evaluate(element => {
      return {
        scripts: (element as any).head.querySelectorAll("script").length,
        styles: (element as any).head.querySelectorAll("style").length,
      }
    });

    expect(newsources.scripts).toBeGreaterThan(1);
    expect(newsources.styles).toBeGreaterThan(1);
  });

  test("trailing slashes should receive sources", async ({ page }) => {

    const router = await page.getByTestId("target");
    await router.evaluate(element => element.setAttribute("trailing-slash", "true"));

    await page.waitForTimeout(2000); // allow router to setup 
    await page.getByTestId("button-hello-world").click();
    await page.waitForTimeout(2000); // wait for document to load 


  });
});

test.describe("router - Single Page Application Tests", () => {

  test("link click should not cause refresh", async ({ page }) => {
    let didPageReload = false;

    // Set up listener for the 'load' event before any actions
    page.on('load', () => {
      didPageReload = true;
    });

    await page.waitForTimeout(2000); // allow router to setup 

    // Click on the link that triggers SPA navigation
    await page.getByTestId("button-a").click();

    // Wait for any SPA actions to complete, if necessary
    await page.waitForTimeout(2000); // Adjust based on your SPA behavior

    // Ensure that no full page reload happened
    expect(didPageReload).toBe(false); // Page reload should NOT have occurred
  });

  test("URL should be updated on link click", async ({ page }) => {

    // Get initial page state
    const initialURL = page.url();

    // Click on the link that triggers SPA navigation
    await page.getByTestId("button-a").click();

    // Wait for any SPA actions to complete, if necessary
    await page.waitForTimeout(2000); // Adjust based on your SPA behavior

    // Ensure that the URL changed due to SPA routing
    const currentURL = page.url();
    expect(currentURL).not.toBe(initialURL);
  });

  test("link click should result in new page", async ({ page }) => {
    await page.waitForTimeout(2000); // allow router to setup 

    const initialContent = await page.content();

    // Click on the link that triggers SPA navigation
    await page.getByTestId("button-a").click();

    // Wait for any SPA actions to complete, if necessary
    await page.waitForTimeout(2000); // Adjust based on your SPA behavior

    // Ensure the content is different, meaning SPA routing updated the DOM
    const currentContent = await page.content();
    expect(currentContent).not.toBe(initialContent);

    // make sure a document was actully loaded
    const firstp = await page.getByTestId('first-p');
    expect(firstp).not.toBeNull();

    // make sure document A ws loaded
    expect(firstp).toHaveText("First Paragraph A updated");

  })
});

test.describe("router - hashbased setup", () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      const router = document.querySelector("pap-router") as any;
      if (router) {
        router.hashbased = true;
      }
    });
  });

  test("initial page should include hashtag", async ({ page }) => {
    const initialURL = page.url();

    // wait for web component to load fully
    await page.waitForTimeout(2000);

    const navigatedURL = page.url();
    expect(navigatedURL).not.toBe(initialURL); // Check if the URL has changed

    expect(navigatedURL).toBe(initialURL + "/#/");
  });

  test("loading document A", async ({ page }) => {
    // wait for web component to load fully
    await page.waitForTimeout(2000);

    // store current url 
    const initialURL = page.url();

    // navigate to document-A
    await page.getByTestId("button-a").click();

    // wait again to make sure content was loaded
    await page.waitForTimeout(2000);

    const navigatedURL = page.url();
    expect(navigatedURL).not.toBe(initialURL); // Check if the URL has changed

    expect(navigatedURL).toBe(initialURL + "a/");
  });

  test("refresh should render same page", async ({ page }) => {

    // Get the initial page content and URL
    const initialURL = page.url();

    // Step 2: Click on the link that triggers SPA navigation
    await page.getByTestId("button-a").click();
    await page.waitForTimeout(2000); // Adjust based on your SPA behavior

    const navigatedURL = page.url();
    expect(navigatedURL).not.toBe(initialURL); // Check if the URL has changed

    // Step 3: Refresh the page
    await page.reload(); // Refresh the page  

    // Wait for any SPA actions to complete, if necessary
    await page.waitForTimeout(2000); // Adjust based on your SPA behavior

    // Step 4: Verify that the content or state remains consistent after refresh
    const refreshedURL = page.url();

    // Verify that the URL is the same as after the SPA navigation
    expect(refreshedURL).toBe(navigatedURL);
  });
});
