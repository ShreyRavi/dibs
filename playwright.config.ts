import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT || "3001";
const baseURL = `http://localhost:${PORT}`;

// E2E runs against a running dev server (default :3001). Start one first:
//   PORT=3001 bun run dev
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "off",
    viewport: { width: 390, height: 820 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
