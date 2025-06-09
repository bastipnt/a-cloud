import { getFullPath } from "@acloud/config";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

const DEV_URL = "http://localhost:5173";

dotenv.config({ path: getFullPath(import.meta.url, ".env") });

export default defineConfig({
  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: "tests",

  // Run all tests in parallel.
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: "html",

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: DEV_URL,

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: "setup db",
      testMatch: /global\.setup\.ts/,
      teardown: "cleanup db",
    },
    {
      name: "cleanup db",
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup db"],
    },
  ],
  // Run your local dev server before starting the tests.
  webServer: {
    cwd: "../../",
    command: "NODE_ENV=test bun run dev",
    url: DEV_URL,
    reuseExistingServer: !process.env.CI,
  },
});
