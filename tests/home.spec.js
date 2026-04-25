const { test, expect } = require("@playwright/test");

test.describe("Privacy Filter landing page", () => {
  test("desktop homepage renders key content and metadata", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/OpenAI Privacy Filter/i);
    await expect(page.locator("h1")).toHaveText(/PII detection and masking/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /PII detection and masking/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://privacyfilter.lol/");

    const waitlistLinks = page.getByRole("link", { name: "Join the Waitlist" });
    await expect(waitlistLinks.first()).toBeVisible();
    await expect(waitlistLinks).toHaveCount(2);
    await expect(waitlistLinks.first()).toHaveAttribute("href", "https://mirofish.my/");
    await expect(waitlistLinks.nth(1)).toHaveAttribute("href", "https://mirofish.my/");
    await expect(page.getByRole("link", { name: "View GitHub" })).toHaveAttribute("href", "https://mirofish.my/");

    await expect(page.locator("#taxonomy .taxonomy-card")).toHaveCount(8);
    await expect(page.locator("#modes .mode-card")).toHaveCount(3);
    await expect(page.locator("#faq details")).toHaveCount(5);

    const faq = page.locator("#faq details").first();
    await faq.locator("summary").click();
    await expect(faq).toHaveAttribute("open", "");
    const imagesLoaded = await page.evaluate(() =>
      Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)
    );
    expect(imagesLoaded).toBe(true);
  });

  test("cta buttons navigate to mirofish", async ({ page }) => {
    await page.goto("/");

    await Promise.all([
      page.waitForURL(/https:\/\/mirofish\.my\/?/, { waitUntil: "commit" }),
      page.getByRole("link", { name: "Join the Waitlist" }).first().click()
    ]);
    await expect(page).toHaveURL(/https:\/\/mirofish\.my\/?/);

    await page.goto("/");

    await Promise.all([
      page.waitForURL(/https:\/\/mirofish\.my\/?/, { waitUntil: "commit" }),
      page.getByRole("link", { name: "View GitHub" }).click()
    ]);
    await expect(page).toHaveURL(/https:\/\/mirofish\.my\/?/);
  });

  test("mobile layout stays within viewport and keeps CTA accessible", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: "Join the Waitlist" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "hello@privacyfilter.lol" })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByRole("link", { name: "Taxonomy" }).click();
    await expect(page.locator("#taxonomy")).toBeInViewport();
    await context.close();
  });
});
