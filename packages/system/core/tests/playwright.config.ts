import { defineConfig, devices } from '@playwright/test';
import path from "node:path";
import { fileURLToPath } from 'node:url';

// Resolve the directory name and base path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: __dirname,

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // reporter, with output path for HTML reports.
  reporter: [['html', { outputFolder: path.join(__dirname, 'test-reports') }]],

  outputDir: path.join(__dirname, "test-results"),

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: 'http://localhost:3500/',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Specify the directory for storing the test snapshots
  snapshotDir: path.join(__dirname, "snapshots"),

  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 10
    },
  },
  // Global setup and teardown scripts
  globalSetup: path.join(__dirname, 'setup.ts'),
  globalTeardown: path.join(__dirname, 'teardown.ts'),

  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  // running web-server before starting tests 
  webServer: {
    command: 'npx @papit/server -- --log-level=debug --location=$(pwd) --port=3500',
    url: 'http://localhost:3500',
    reuseExistingServer: !process.env.CI || !!process.env.GLOBAL,
    stdout: 'ignore',
    stderr: 'pipe'
  },
});