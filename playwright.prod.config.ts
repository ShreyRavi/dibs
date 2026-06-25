import { defineConfig, devices } from "@playwright/test";

// Config for the production walkthrough (prod-e2e/). Hits the live site directly
// with absolute URLs; kept separate so the default suite never writes prod data.
export default defineConfig({
  testDir: "./prod-e2e",
  timeout: 120_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    trace: "off",
    viewport: { width: 390, height: 820 },
    // This runner's resolver still NXDOMAINs the fresh .events domain; map it to
    // Vercel's IP so Chromium hits the real site (SNI/cert stay dibs.events).
    launchOptions: {
      args: [
        "--host-resolver-rules=MAP dibs.events 216.198.79.1,MAP www.dibs.events 216.198.79.1",
      ],
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
