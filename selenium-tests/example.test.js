const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { describe, test, beforeAll, afterAll, expect } = require('vitest');

describe('Cypress Real World App - Selenium Tests', () => {
  let driver;

  beforeAll(async () => {
    // Configure Chrome options
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in headless mode
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('should load the homepage', async () => {
    await driver.get('http://localhost:3000');

    // Wait for the page to load
    await driver.wait(until.titleContains('Cypress'), 10000);

    const title = await driver.getTitle();
    expect(title).toContain('Cypress');
  });

  test('should navigate to sign in page', async () => {
    await driver.get('http://localhost:3000');

    // Wait for and click the sign in button
    const signInButton = await driver.wait(
      until.elementLocated(By.css('[data-test="signin"]')),
      10000
    );
    await signInButton.click();

    // Verify we're on the sign in page
    await driver.wait(until.urlContains('/signin'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/signin');
  });

  test('should display sign in form elements', async () => {
    await driver.get('http://localhost:3000/signin');

    // Wait for form elements to be present
    const usernameField = await driver.wait(
      until.elementLocated(By.css('#username')),
      10000
    );
    const passwordField = await driver.wait(
      until.elementLocated(By.css('#password')),
      10000
    );
    const signInButton = await driver.wait(
      until.elementLocated(By.css('[data-test="signin-submit"]')),
      10000
    );

    expect(await usernameField.isDisplayed()).toBe(true);
    expect(await passwordField.isDisplayed()).toBe(true);
    expect(await signInButton.isDisplayed()).toBe(true);
  });
});
