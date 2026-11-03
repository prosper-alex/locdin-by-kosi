import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("opening screen fits the viewport across sizes and rotation without clipping", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mkdir(".impeccable/review/hero-viewport", { recursive: true });
  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["laptop", 1366, 768],
    ["wide", 2560, 1440],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
    ["mobile-small", 360, 800],
    ["compact", 320, 568],
    ["landscape", 844, 390],
    ["landscape-small", 667, 375],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { name: "Your locs. Your style. Your way." })).toBeVisible();
    await expect.poll(async () => page.evaluate(() => {
      const hero = document.querySelector(".hero")!.getBoundingClientRect();
      return Math.abs(hero.bottom - innerHeight);
    }), { message: `${name}: header and hero should fill one viewport` }).toBeLessThanOrEqual(2);
    const geometry = await page.evaluate(() => {
      const hero = document.querySelector(".hero")!.getBoundingClientRect();
      const photo = document.querySelector(".hero-photograph")!.getBoundingClientRect();
      const actions = document.querySelector(".hero-actions")!.getBoundingClientRect();
      const copy = document.querySelector(".hero-copy")!.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        photoHeight: photo.height,
        actionsInsideHero: actions.bottom <= hero.bottom && actions.right <= hero.right,
        actionsInsideCopy: actions.bottom <= copy.bottom && actions.right <= copy.right,
        actionsOnScreen: actions.bottom <= innerHeight,
      };
    });
    expect(geometry, name).toMatchObject({ overflow: false, actionsInsideHero: true, actionsInsideCopy: true, actionsOnScreen: true });
    expect(geometry.photoHeight, name).toBeGreaterThanOrEqual(100);
    await page.locator(".hero-photograph img").evaluate((image: HTMLImageElement) => image.decode());
    await page.screenshot({ path: `.impeccable/review/hero-viewport/${name}.png`, animations: "disabled", style: "nextjs-portal { visibility: hidden !important; }" });
  }
});

test("large text can grow the hero without overlapping the following content", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await page.addStyleTag({ content: ".hero h1 { font-size: 64px !important; } .hero-copy > p { font-size: 24px !important; } .hero-actions a { font-size: 20px !important; }" });
  const geometry = await page.evaluate(() => {
    const hero = document.querySelector(".hero")!.getBoundingClientRect();
    const actions = document.querySelector(".hero-actions")!.getBoundingClientRect();
    const next = document.querySelector(".service-strip")!.getBoundingClientRect();
    return { actionsBottom: actions.bottom, heroBottom: hero.bottom, nextTop: next.top, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  expect(geometry.actionsBottom).toBeLessThanOrEqual(geometry.heroBottom);
  expect(geometry.nextTop).toBeGreaterThanOrEqual(geometry.heroBottom - 1);
  expect(geometry.overflow).toBe(false);
});
