import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['selenium-tests/**/*.test.js'],
    setupFiles: ['selenium-tests/setup.js'],
    testTimeout: 30000, // 30 seconds timeout for Selenium tests
    globals: true
  }
});
