import { test, expect } from "@playwright/test";

test.describe("404 Page", () => {
  test("shows branded 404 for unknown routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("Back to Home")).toBeVisible();
    await expect(page.getByText("Go to Dashboard")).toBeVisible();
  });
});
