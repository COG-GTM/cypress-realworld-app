const { test, expect } = require('@playwright/test');

test.describe('Cypress Real World App - Playwright Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load and check title
    await expect(page).toHaveTitle(/Cypress/);
    
    // Check that the sign in button is visible
    await expect(page.locator('[data-test="signin"]')).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');
    
    // Click the sign in button
    await page.click('[data-test="signin"]');
    
    // Verify we're on the sign in page
    await expect(page).toHaveURL(/.*signin/);
    
    // Check that sign in form is visible
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('[data-test="signin-submit"]')).toBeVisible();
  });

  test('should display sign in form elements', async ({ page }) => {
    await page.goto('/signin');
    
    // Check form elements are present and visible
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('[data-test="signin-submit"]')).toBeVisible();
    
    // Check form labels
    await expect(page.locator('text=Username')).toBeVisible();
    await expect(page.locator('text=Password')).toBeVisible();
  });

  test('should handle login attempt', async ({ page }) => {
    await page.goto('/signin');
    
    // Fill in the form with test credentials
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'wrongpassword');
    
    // Submit the form
    await page.click('[data-test="signin-submit"]');
    
    // Should show an error message for invalid credentials
    // Note: This test might need adjustment based on actual app behavior
    await expect(page.locator('text=Username or password is invalid')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check that the page loads and key elements are visible on mobile
    await expect(page.locator('[data-test="signin"]')).toBeVisible();
    
    // Navigate to sign in
    await page.click('[data-test="signin"]');
    await expect(page).toHaveURL(/.*signin/);
    
    // Check form is usable on mobile
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});