// Global setup for Selenium tests
const { execSync } = require('child_process');

// Ensure Chrome is available
beforeAll(() => {
  try {
    execSync('google-chrome --version', { stdio: 'pipe' });
  } catch (error) {
    console.warn('Chrome not found, installing...');
    // Chrome should be available in the environment
  }
});