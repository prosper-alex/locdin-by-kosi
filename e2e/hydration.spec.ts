import { expect, test } from "@playwright/test";

test("hydrates with Grammarly attributes injected before React loads", async ({
  page,
}) => {
  const hydrationWarnings: string[] = [];
  page.on("console", (message) => {
    if (/hydration|hydrated|server rendered HTML/i.test(message.text())) {
      hydrationWarnings.push(message.text());
    }
  });
  page.on("pageerror", (error) => hydrationWarnings.push(error.message));

  await page.addInitScript(() => {
    const injectAttributes = () => {
      if (!document.body) return false;
      document.body.setAttribute("data-new-gr-c-s-check-loaded", "14.1343.0");
      document.body.setAttribute("data-gr-ext-installed", "");
      return true;
    };
    if (!injectAttributes()) {
      const observer = new MutationObserver(() => {
        if (injectAttributes()) observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
    }
  });

  await page.goto("/");
  await expect(page.locator("body")).toHaveAttribute(
    "data-gr-ext-installed",
    "",
  );
  await page
    .getByRole("button", {
      name: "Choose delivery country and display currency",
    })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(hydrationWarnings).toEqual([]);
});
