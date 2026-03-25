import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const API_URL = "http://localhost:3001";

test.beforeEach(async () => {
  await fetch(`${API_URL}/testData/seed`, { method: "POST" });
});

test.describe("Playwright - Auth Tests", () => {
  test("should redirect unauthenticated user to signin page", async ({ page }) => {
    await page.goto(`${BASE_URL}/personal`);
    await expect(page).toHaveURL(/\/signin/);
  });

  test("should display signin form elements", async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await expect(page.locator("[data-test='signin-username']")).toBeVisible();
    await expect(page.locator("[data-test='signin-password']")).toBeVisible();
    await expect(page.locator("[data-test='signin-submit']")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.locator("[data-test='signin-username'] input").fill("invalidUser");
    await page.locator("[data-test='signin-password'] input").fill("invalidPassword");
    await page.locator("[data-test='signin-submit']").click();

    await expect(page.locator("[data-test='signin-error']")).toBeVisible();
    await expect(page.locator("[data-test='signin-error']")).toContainText(
      "Username or password is invalid"
    );
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    await page.locator("[data-test='signin-username'] input").fill("Heath93");
    await page.locator("[data-test='signin-password'] input").fill("s3cret");
    await page.locator("[data-test='signin-submit']").click();

    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`);
    const signupLink = page.locator("[data-test='signup']");
    await signupLink.waitFor({ state: "visible" });

    // Use JavaScript navigation since React Router Link may not trigger native navigation
    await signupLink.evaluate((el) => (el as HTMLAnchorElement).click());
    await page.waitForURL(/\/signup/, { timeout: 10000 });

    await expect(page.locator("[data-test='signup-title']")).toContainText("Sign Up");
  });

  test("should display signup form validation errors", async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);

    // Trigger and clear first name
    await page.locator("[data-test='signup-first-name'] input").fill("First");
    await page.locator("[data-test='signup-first-name'] input").clear();
    await page.locator("[data-test='signup-first-name'] input").blur();
    await expect(page.locator("#firstName-helper-text")).toContainText("First Name is required");

    // Check submit is disabled
    await expect(page.locator("[data-test='signup-submit']")).toBeDisabled();
  });
});
