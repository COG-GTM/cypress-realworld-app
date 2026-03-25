import { test, expect, Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const API_URL = "http://localhost:3001";

async function login(page: Page, username = "Heath93", password = "s3cret") {
  await page.goto(`${BASE_URL}/signin`);
  await page.locator("[data-test='signin-username'] input").fill(username);
  await page.locator("[data-test='signin-password'] input").fill(password);
  await page.locator("[data-test='signin-submit']").click();
  await expect(page).toHaveURL(`${BASE_URL}/`);
}

test.beforeEach(async () => {
  await fetch(`${API_URL}/testData/seed`, { method: "POST" });
});

test.describe("Playwright - Transaction Tests", () => {
  test("should display transaction list after login", async ({ page }) => {
    await login(page);
    await expect(page.locator("[data-test='transaction-list']")).toBeVisible();
  });

  test("should navigate to new transaction page", async ({ page }) => {
    await login(page);
    await page.locator("[data-test='nav-top-new-transaction']").click();
    await expect(page).toHaveURL(/\/transaction\/new/);
  });

  test("should display user list for new transaction", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/transaction/new`);
    await expect(page.locator("[data-test='users-list']")).toBeVisible();
  });

  test("should filter transactions by personal tab", async ({ page }) => {
    await login(page);
    await page.locator("[data-test='nav-personal-tab']").click();
    await expect(page).toHaveURL(/\/personal/);
  });

  test("should view transaction detail", async ({ page }) => {
    await login(page);
    await page.locator("[data-test='transaction-list']").waitFor();

    // Click on the first transaction item
    const firstItem = page.locator("[data-test*='transaction-item']").first();
    await firstItem.click();

    // Should navigate to transaction detail
    await expect(page).toHaveURL(/\/transaction\//);
  });
});
