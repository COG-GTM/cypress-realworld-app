# Selenium UI Tests

This directory contains Selenium WebDriver tests for the Cypress Real World App.

## Setup

Selenium WebDriver and ChromeDriver are already installed as dev dependencies.

## Running Tests

To run Selenium tests, you need to have the application running first:

1. Start the application:
   ```bash
   yarn dev
   ```

2. In another terminal, run the Selenium tests:
   ```bash
   yarn test:selenium
   ```

   Or run them in CI mode (headless):
   ```bash
   yarn test:selenium:ci
   ```

## Test Structure

- `example.test.js` - Basic example tests demonstrating Selenium WebDriver usage
- `vitest.config.js` - Vitest configuration for Selenium tests
- `setup.js` - Global setup for Selenium tests

## Writing Tests

Tests use Selenium WebDriver with Vitest as the test runner. Example:

```javascript
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

test('should load the homepage', async () => {
  const options = new chrome.Options();
  options.addArguments('--headless');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    
  try {
    await driver.get('http://localhost:3000');
    const title = await driver.getTitle();
    expect(title).toContain('Cypress');
  } finally {
    await driver.quit();
  }
});
```

## Notes

- Tests run in headless Chrome by default
- The application must be running on http://localhost:3000 before running tests
- Tests have a 30-second timeout configured