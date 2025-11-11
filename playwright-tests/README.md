# Playwright Tests

This directory contains Playwright tests for the Cypress Real World App.

## Setup

Playwright is already installed with all necessary browser dependencies.

## Running Tests

To run Playwright tests, you need to have the application running first:

1. Start the application:
   ```bash
   yarn dev
   ```

2. In another terminal, run the Playwright tests:
   ```bash
   yarn test:playwright
   ```

   Or run them in headless mode:
   ```bash
   yarn test:playwright:headless
   ```

   To run tests in a specific browser:
   ```bash
   yarn test:playwright --project=chromium
   yarn test:playwright --project=firefox
   yarn test:playwright --project=webkit
   ```

## Available Scripts

- `yarn test:playwright` - Run tests in headed mode with UI
- `yarn test:playwright:headless` - Run tests in headless mode
- `yarn test:playwright:debug` - Run tests in debug mode with Playwright Inspector

## Test Structure

- `example.spec.js` - Example tests demonstrating Playwright capabilities
- Tests are configured to run against multiple browsers (Chromium, Firefox, WebKit)
- Mobile testing is included with device emulation

## Features

- **Cross-browser testing**: Tests run on Chromium, Firefox, and WebKit
- **Mobile testing**: Includes tests with mobile device emulation
- **Parallel execution**: Tests run in parallel for faster execution
- **Visual debugging**: Playwright Inspector for debugging tests
- **Trace viewer**: Automatic trace collection on test failures
- **Screenshots and videos**: Automatic capture on failures

## Writing Tests

Playwright tests use a simple and powerful API:

```javascript
const { test, expect } = require('@playwright/test');

test('example test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Welcome');
  await page.click('button');
  await expect(page).toHaveURL('/dashboard');
});
```

## Configuration

The main configuration is in `playwright.config.js` at the project root. Key settings:

- **Base URL**: http://localhost:3000
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Reporters**: HTML reporter with detailed results
- **Traces**: Collected on first retry for debugging

## Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Notes

- Tests expect the application to be running on http://localhost:3000
- Playwright automatically waits for elements to be ready
- Tests include both desktop and mobile viewport testing
- Failed tests automatically capture screenshots and traces for debugging