import { test, expect } from "@playwright/test";

test.describe("Pricing Page", () => {
  test("renders all three pricing tiers", async ({ page }) => {
    await page.goto("/pricing");

    // Free tier
    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("5 invoices per month")).toBeVisible();

    // Pro tier
    await expect(page.getByText("$29")).toBeVisible();
    await expect(page.getByText("50 invoices per month")).toBeVisible();

    // Business tier
    await expect(page.getByText("$59")).toBeVisible();
    await expect(page.getByText("500 invoices per month")).toBeVisible();
  });

  test("shows Most Popular badge on Pro plan", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("CTA buttons link to signup", async ({ page }) => {
    await page.goto("/pricing");
    const startFreeButton = page.getByRole("link", { name: "Start Free" });
    await expect(startFreeButton).toBeVisible();
  });
});
