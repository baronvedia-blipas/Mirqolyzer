import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("renders login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign in to your account")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("has Google OAuth button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
  });

  test("has link to signup page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL("/signup");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("invalid@test.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();
    // Should show an error (Supabase will return an error since no project is configured)
    await expect(page.locator(".bg-destructive\\/10")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Signup Page", () => {
  test("renders signup form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create your free account")).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("has link to login page", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/login");
  });
});
