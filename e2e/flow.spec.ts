import { test, expect } from "@playwright/test";

// Critical path: Set Up → create → Share → open List → Call dibs (name on first
// claim) → owner chip appears, count drops.
test("home shows a demo and links to create", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Call dibs on the/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create a list/ })).toBeVisible();
});

test("create a list, share, then call dibs", async ({ page }) => {
  // Set Up lives at /new and starts blank
  await page.goto("/new");
  await page.getByLabel("Event name").fill("Trip planning 🏔️");
  await page.getByLabel("Add tasks").fill("🚗 Book the car");
  await page.getByLabel("Add tasks").press("Enter");

  // Create → lands on the share surface with a SHORT code in the URL
  await page.getByRole("button", { name: /Create & share/ }).click();
  await expect(page).toHaveURL(/\/l\/[^/]+\/share$/);
  await expect(page).not.toHaveURL(/[0-9a-f]{8}-[0-9a-f]{4}-/); // not a uuid
  await expect(page.getByText("Drop this in the group chat")).toBeVisible();

  // Open the list
  await page.getByRole("button", { name: /Open the list/ }).click();
  await expect(page).toHaveURL(/\/l\/[^/]+$/);

  // first claim opens the identity prompt (name + phone)
  await page.getByRole("button", { name: /^Call dibs on/ }).first().click();
  await page.getByLabel("Your name").fill("Tester");
  await page.getByLabel("Your number").fill("555 010 7788");
  await page.getByRole("button", { name: /Join the list/ }).click();

  // owner chip ("You") shows
  await expect(page.getByText("You", { exact: false }).first()).toBeVisible();
});

test("unknown list shows the friendly 404", async ({ page }) => {
  await page.goto("/l/00000000-0000-0000-0000-000000000000");
  await expect(page.getByText(/isn't around anymore/)).toBeVisible();
});
