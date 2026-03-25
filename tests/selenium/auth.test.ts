import { Builder, By, until, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

const BASE_URL = "http://localhost:3000";
const API_URL = "http://localhost:3001";

describe("Selenium WebDriver - Auth Tests", () => {
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
    // Seed the database before each test
    await fetch(`${API_URL}/testData/seed`, { method: "POST" });
  });

  it("should redirect unauthenticated user to signin page", { timeout: TEST_TIMEOUT }, async () => {
    await driver.get(`${BASE_URL}/personal`);
    await driver.wait(until.urlContains("/signin"), 10000);
    const url = await driver.getCurrentUrl();
    expect(url).toContain("/signin");
  });

  it("should display signin form elements", { timeout: TEST_TIMEOUT }, async () => {
    await driver.get(`${BASE_URL}/signin`);
    await driver.wait(until.elementLocated(By.css("[data-test='signin-username']")), 10000);

    const usernameField = await driver.findElement(By.css("[data-test='signin-username']"));
    const passwordField = await driver.findElement(By.css("[data-test='signin-password']"));
    const submitButton = await driver.findElement(By.css("[data-test='signin-submit']"));

    expect(await usernameField.isDisplayed()).toBe(true);
    expect(await passwordField.isDisplayed()).toBe(true);
    expect(await submitButton.isDisplayed()).toBe(true);
  });

  it("should show error for invalid credentials", { timeout: TEST_TIMEOUT }, async () => {
    await driver.get(`${BASE_URL}/signin`);
    await driver.wait(until.elementLocated(By.css("[data-test='signin-username']")), 10000);

    const usernameInput = await driver.findElement(By.css("[data-test='signin-username'] input"));
    const passwordInput = await driver.findElement(By.css("[data-test='signin-password'] input"));

    await usernameInput.sendKeys("invalidUser");
    await passwordInput.sendKeys("invalidPassword");

    const submitButton = await driver.findElement(By.css("[data-test='signin-submit']"));
    await submitButton.click();

    await driver.wait(until.elementLocated(By.css("[data-test='signin-error']")), 10000);
    const errorText = await driver.findElement(By.css("[data-test='signin-error']")).getText();
    expect(errorText).toContain("Username or password is invalid");
  });

  it("should login successfully with valid credentials", { timeout: TEST_TIMEOUT }, async () => {
    await driver.get(`${BASE_URL}/signin`);
    await driver.wait(until.elementLocated(By.css("[data-test='signin-username']")), 10000);

    const usernameInput = await driver.findElement(By.css("[data-test='signin-username'] input"));
    const passwordInput = await driver.findElement(By.css("[data-test='signin-password'] input"));

    await usernameInput.sendKeys("Heath93");
    await passwordInput.sendKeys("s3cret");

    const submitButton = await driver.findElement(By.css("[data-test='signin-submit']"));
    await submitButton.click();

    // Wait for redirect to home page
    await driver.wait(until.urlIs(`${BASE_URL}/`), 10000);
    const url = await driver.getCurrentUrl();
    expect(url).toBe(`${BASE_URL}/`);
  });

  it("should display signup form elements", { timeout: TEST_TIMEOUT }, async () => {
    // Clear cookies/storage to ensure we're not authenticated
    await driver.manage().deleteAllCookies();
    await driver.executeScript("window.localStorage.clear(); window.sessionStorage.clear();");
    await driver.get(`${BASE_URL}/signup`);
    await driver.wait(until.elementLocated(By.css("[data-test='signup-title']")), 10000);

    const title = await driver.findElement(By.css("[data-test='signup-title']"));
    expect(await title.getText()).toContain("Sign Up");

    const firstNameField = await driver.findElement(By.css("[data-test='signup-first-name']"));
    const lastNameField = await driver.findElement(By.css("[data-test='signup-last-name']"));
    const usernameField = await driver.findElement(By.css("[data-test='signup-username']"));
    const passwordField = await driver.findElement(By.css("[data-test='signup-password']"));

    expect(await firstNameField.isDisplayed()).toBe(true);
    expect(await lastNameField.isDisplayed()).toBe(true);
    expect(await usernameField.isDisplayed()).toBe(true);
    expect(await passwordField.isDisplayed()).toBe(true);
  });
});
