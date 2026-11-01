import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("reduced motion keeps editorial content still and shopping controls usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your locs. Your style. Your way." }),
  ).toBeVisible();
  const presentation = await page.evaluate(() => ({
    bodySize: parseFloat(getComputedStyle(document.body).fontSize),
    heroAnimations: [
      ...document.querySelectorAll(".hero h1, .hero-photograph > img"),
    ]
      .flatMap((element) => element.getAnimations())
      .filter((animation) => animation.playState === "running").length,
  }));
  expect(presentation.bodySize).toBeGreaterThanOrEqual(16);
  expect(presentation.heroAnimations).toBe(0);
  await page
    .getByRole("button", {
      name: "Choose delivery country and display currency",
    })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("homepage, responsive composition and image loading", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Static review captures use the accessible, settled composition. The motion
  // preference has its own interaction check above, outside screenshot timing.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mkdir(".impeccable/review", { recursive: true });
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
    ["mobile-small", 360, 800],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.getByRole("heading", { name: "Your locs. Your style. Your way." }),
    ).toBeVisible();
    await page.locator("img").evaluateAll((images) =>
      images.forEach((image) => {
        if (image instanceof HTMLImageElement) image.loading = "eager";
      }),
    );
    await page
      .locator("img")
      .evaluateAll((images) =>
        Promise.all(
          images.map((image) =>
            image instanceof HTMLImageElement
              ? image.decode().catch(() => undefined)
              : undefined,
          ),
        ),
      );
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
        ),
    ).toBe(true);
    await page.screenshot({
      path: `.impeccable/review/${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
  expect(errors).toEqual([]);
});
test("international shopping preferences and accessible drawer", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Choose delivery country and display currency",
    })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Deliver to", { exact: true }).selectOption("US");
  await page
    .getByRole("combobox", { name: "Display currency", exact: true })
    .selectOption("USD");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.goto("/shop");
  await expect(page.locator(".product-price").first()).toContainText("Approx.");
  await page.reload();
  await expect(page.locator(".product-price").first()).toContainText("$");
  await page
    .getByRole("button", {
      name: "Choose delivery country and display currency",
    })
    .first()
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("product configuration, persistent bag and international preview checkout", async ({
  page,
}) => {
  await page.goto("/products/traditional-locs");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(page.locator(".form-error")).toContainText(
    "Choose an available length",
  );
  await page.getByRole("button", { name: "12″", exact: true }).click();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.goto("/cart");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Traditional locs" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Delivery country", exact: true })
    .selectOption("US");
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await expect(page.getByText("Charge currency: NGN")).toBeVisible();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("preview@example.com");
  await page.getByLabel("Full name").fill("Preview Customer");
  await page.getByLabel("Address", { exact: true }).fill("10 Example Avenue");
  await page.getByLabel("City", { exact: true }).fill("New York");
  await page.getByLabel("State", { exact: true }).fill("NY");
  await page.getByLabel("Postal code", { exact: true }).fill("10001");
  await page.getByLabel("Phone with country code").fill("+1 212 555 0100");
  await page.getByRole("checkbox").check();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.screenshot({
    path: ".impeccable/review/checkout-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.screenshot({
    path: ".impeccable/review/checkout-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Preview the final step" }).click();
  await expect(
    page.getByText("Preview complete", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No payment was taken", { exact: false }),
  ).toBeVisible();
});
test("search, mobile navigation, enquiries, and private admin boundary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Shop", exact: true })
    .click();
  await expect(page).toHaveURL(/shop/);
  await page
    .getByRole("textbox", { name: "Search products" })
    .fill("not-a-real-style");
  await page.getByRole("button", { name: "Submit product search" }).click();
  await expect(
    page.getByRole("heading", { name: "No locs found just yet." }),
  ).toBeVisible();
  await page.goto("/custom-order");
  await page.getByLabel("Your name").fill("Preview Customer");
  await page.getByLabel("Email address").fill("preview@example.com");
  await page.getByLabel("Your starting style").selectOption("Traditional locs");
  await page
    .getByLabel("Tell us more")
    .fill("A natural black style with warm copper ends.");
  await page.getByRole("button", { name: "Preview your request" }).click();
  await expect(
    page.getByRole("heading", { name: "Your vision, previewed." }),
  ).toBeVisible();
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "The studio, ready to connect." }),
  ).toBeVisible();
  await expect(page.getByText("No orders yet.")).not.toBeVisible();
});
test("server rejects manipulated prices and cross-origin checkout", async ({
  request,
}) => {
  const response = await request.post("/api/quote", {
    headers: { Origin: "http://127.0.0.1:3000" },
    data: {
      lines: [
        { variantId: "traditional-8-black", quantity: 1, expectedUnitPrice: 1 },
      ],
      country: "US",
    },
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).error).toContain("price has changed");
  const denied = await request.post("/api/quote", {
    headers: { Origin: "https://other.example" },
    data: { lines: [], country: "US" },
  });
  expect(denied.status()).toBe(400);
});
