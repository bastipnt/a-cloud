import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ["./setup-tests.ts", "./api-mock.ts"],
    globalSetup: ["./global-test-setup.ts"],
    include: ["**/*.test.tsx"],
    printConsoleTrace: true,
    browser: {
      provider: playwright(),
      enabled: true,
      // at least one instance is required
      instances: [{ browser: "chromium" }],
    },
    server: {
      deps: {
        inline: ["@swan-io/srp"],
      },
    },
  },
});
