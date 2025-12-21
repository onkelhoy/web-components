import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Navigate to your test page
  await page.goto('popover');
});

declare global {
  interface Window {
    EVENT_EMITTED: any;
  }
}

test.describe("@papit/popover unit tests", () => {
  test('available in DOM', async ({ page }) => {
    // Interact with your component and make assertions
    const component = await page.$('pap-popover');
    expect(component).not.toBeNull();
  });

});

test.describe('placements', () => {
  // TOP 
  test('top-left', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "top-left"));
    await page.waitForSelector("[data-testid='popover'][placement='top-left']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(bbox.x - wbox.x)).toBe(Math.floor(0));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y - wbox.height - 4));
  });

  test('top-center', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "top-center"));
    await page.waitForSelector("[data-testid='popover'][placement='top-center']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width/2 - wbox.width/2));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y - wbox.height - 4));
  });

  test('top-right', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "top-right"))
    await page.waitForSelector("[data-testid='popover'][placement='top-right']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width - wbox.width));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y - wbox.height - 4));
  });

  // LEFT 
  test('left-top', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "left-top"));
    await page.waitForSelector("[data-testid='popover'][placement='left-top']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x - 4 - wbox.width));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y));
  });

  test('left-center', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "left-center"));
    await page.waitForSelector("[data-testid='popover'][placement='left-center']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x - 4 - wbox.width));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height/2 - wbox.height/2));
  });

  test('left-bottom', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "left-bottom"))
    await page.waitForSelector("[data-testid='popover'][placement='left-bottom']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x - 4 - wbox.width));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height - wbox.height));
  });

  // RIGHT
  test('right-top', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "right-top"));
    await page.waitForSelector("[data-testid='popover'][placement='right-top']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width + 4));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y));
  });

  test('right-center', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "right-center"));
    await page.waitForSelector("[data-testid='popover'][placement='right-center']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width + 4));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height/2 - wbox.height/2));
  });

  test('right-bottom', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "right-bottom"))
    await page.waitForSelector("[data-testid='popover'][placement='right-bottom']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width + 4));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height - wbox.height));
  });

  // BOTTOM
  test('bottom-left', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "bottom-left"))
    await page.waitForSelector("[data-testid='popover'][placement='bottom-left']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(bbox.x - wbox.x)).toBe(Math.floor(0));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height + 4));
  });

  test('bottom-center', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "bottom-center"));
    await page.waitForSelector("[data-testid='popover'][placement='bottom-center']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width/2 - wbox.width/2));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height + 4));
  });

  test('bottom-right', async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "bottom-right"))
    await page.waitForSelector("[data-testid='popover'][placement='bottom-right']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });

    const bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    const wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width - wbox.width));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height + 4));
  });
});

test.describe("dynamic positioning", () => {
  test("scroll should move it down", async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "top-left"));
    await page.waitForSelector("[data-testid='popover'][placement='top-left']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    let bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    let wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    // top left 
    expect(Math.floor(bbox.x - wbox.x)).toBe(Math.floor(0));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y - wbox.height - 4));

    await page.evaluate(() => window.scroll(0, 230));

    // Wait for a slight delay to ensure IntersectionObserver triggers
    await page.waitForTimeout(500); // Adjust this timeout as needed for your page behavior

    bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;

    // bottom left 
    expect(Math.floor(bbox.x - wbox.x)).toBe(Math.floor(0));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height + 4));
  });

  test("resize should move it down", async ({ page }) => {
    const popover = page.getByTestId("popover");
    await popover.evaluate(element => element.setAttribute("placement", "right-center"));
    await page.waitForSelector("[data-testid='popover'][placement='right-center']");
    const button = page.getByTestId("button");
    await button.click();

    const wrapper = page.getByTestId("wrapper");
    await wrapper.waitFor({ state: 'visible' });
    
    let bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    let wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;
    
    // right-center
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width + 4));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height/2 - wbox.height/2));

    // Get the current viewport size
    const viewport = page.viewportSize();

    if (viewport) {
      const newHeight = viewport.height;

      // Set the new viewport size
      await page.setViewportSize({ width: 400, height: newHeight });
    }

    // Wait for a slight delay to ensure IntersectionObserver triggers
    await page.waitForTimeout(500); // Adjust this timeout as needed for your page behavior

    bbox = await button.boundingBox();
    expect(bbox).not.toBeNull();
    wbox = await wrapper.boundingBox();
    expect(wbox).not.toBeNull();

    if (!bbox) return;
    if (!wbox) return;

    // bottom center 
    expect(Math.floor(wbox.x)).toBe(Math.floor(bbox.x + bbox.width/2 - wbox.width/2));
    expect(Math.floor(wbox.y)).toBe(Math.floor(bbox.y + bbox.height + 4));
  });
});