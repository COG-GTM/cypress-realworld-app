import { Builder, By, until, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

const BASE_URL = "http://localhost:3000";
const API_URL = "http://localhost:3001";

async function login(driver: WebDriver, username = "Heath93", password = "s3cret") {
  // Navigate to app first so we can clear storage (can't clear on data: URLs)
  await driver.get(`${BASE_URL}/signin`);
  await driver.manage().deleteAllCookies();
  await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
  // Reload to apply cleared state
  await driver.get(`${BASE_URL}/signin`);
  await driver.wait(until.elementLocated(By.css("[data-test='signin-username'] input")), 15000);

  const usernameInput = await driver.findElement(By.css("[data-test='signin-username'] input"));
  const passwordInput = await driver.findElement(By.css("[data-test='signin-password'] input"));

  await usernameInput.clear();
  await usernameInput.sendKeys(username);
  await passwordInput.clear();
  await passwordInput.sendKeys(password);

  const submitButton = await driver.findElement(By.css("[data-test='signin-submit']"));
  await submitButton.click();

  await driver.wait(until.urlIs(`${BASE_URL}/`), 15000);
}

describe("Selenium WebDriver - Transaction Tests", () => {
  let driver: WebDriver;

  // Selenium tests need longer timeouts for browser operations
  const TEST_TIMEOUT = 30000;

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments("--headless=new");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--disable-gpu");

    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async () => {
    await fetch(`${API_URL}/testData/seed`, { method: "POST" });
  });

  it("should display transaction list after login", { timeout: TEST_TIMEOUT }, async () => {
    await login(driver);

    await driver.wait(until.elementLocated(By.css("[data-test='transaction-list']")), 10000);
    const transactionList = await driver.findElement(By.css("[data-test='transaction-list']"));
    expect(await transactionList.isDisplayed()).toBe(true);
  });

  it("should navigate to new transaction page", { timeout: TEST_TIMEOUT }, async () => {
    await login(driver);

    await driver.wait(until.elementLocated(By.css("[data-test='nav-top-new-transaction']")), 10000);
    const newTxnButton = await driver.findElement(By.css("[data-test='nav-top-new-transaction']"));
    await newTxnButton.click();

    await driver.wait(until.urlContains("/transaction/new"), 10000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain("/transaction/new");
  });

  it("should display user list for new transaction", { timeout: TEST_TIMEOUT }, async () => {
    await login(driver);

    await driver.get(`${BASE_URL}/transaction/new`);
    await driver.wait(until.elementLocated(By.css("[data-test='users-list']")), 10000);

    const usersList = await driver.findElement(By.css("[data-test='users-list']"));
    expect(await usersList.isDisplayed()).toBe(true);
  });

  it("should filter transactions by personal tab", { timeout: TEST_TIMEOUT }, async () => {
    await login(driver);

    await driver.wait(until.elementLocated(By.css("[data-test='nav-personal-tab']")), 10000);
    const personalTab = await driver.findElement(By.css("[data-test='nav-personal-tab']"));
    await personalTab.click();

    await driver.wait(until.urlContains("/personal"), 10000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain("/personal");
  });
});
