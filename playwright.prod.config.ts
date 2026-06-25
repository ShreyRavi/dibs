import { defineConfig, devices } from "@playwright/test";

// Config for the production walkthrough (prod-e2e/). Hits the live site directly
// with absolute URLs; kept separate so the default suite never writes prod data.
export default defineConfig({
  testDir: "./prod-e2e",
  timeout: 120_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: { trace: "off", viewport: { width: 390, height: 820 } },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
