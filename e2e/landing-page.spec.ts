import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section with correct heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Analyze invoices");
  });

  test("renders navigation with brand name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toContainText("Mirqolyzer");
  });

  test("has Sign In and Get Started buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();
  });

  test("renders features section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Everything you need to process invoices")).toBeVisible();
  });

  test("renders pricing section with 3 plans", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Simple, transparent pricing")).toBeVisible();
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Pro")).toBeVisible();
    await expect(page.getByText("Business")).toBeVisible();
  });

  test("renders CTA section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Ready to streamline your invoices?")).toBeVisible();
  });

  test("navigates to pricing page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Pricing" }).first().click();
    await expect(page).toHaveURL("/pricing");
    await expect(page.getByText("Simple, transparent pricing")).toBeVisible();
  });

  test("navigates to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("navigates to signup page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Get Started" }).first().click();
    await expect(page).toHaveURL("/signup");
  });
});
