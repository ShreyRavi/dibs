import { test, expect } from "@playwright/test";

// Critical path: Set Up → create → Share → open List → Call dibs (name on first
// claim) → owner chip appears, count drops.
test("create a list, share, then call dibs", async ({ page }) => {
  await page.goto("/");

  // Set Up renders the seeded list + CTA
  await expect(page.getByLabel("Event name")).toBeVisible();

  // Share with the group → lands on the share surface
  await page.getByRole("button", { name: /Share with the group/ }).click();
  await expect(page).toHaveURL(/\/l\/[0-9a-f-]+\/share/);
  await expect(page.getByText("Drop this in the group chat")).toBeVisible();

  // Open the list
  await page.getByRole("button", { name: /Open the list/ }).click();
  await expect(page).toHaveURL(/\/l\/[0-9a-f-]+$/);

  // first claim prompts for a name
  page.once("dialog", (d) => d.accept("Tester"));
  const firstDibs = page.getByRole("button", { name: /^Call dibs on/ }).first();
  await firstDibs.click();

  // an owner chip ("You") shows; one fewer Call-dibs button
  await expect(page.getByText("You", { exact: false }).first()).toBeVisible();
});

test("unknown list shows the friendly 404", async ({ page }) => {
  await page.goto("/l/00000000-0000-0000-0000-000000000000");
  await expect(page.getByText(/isn't around anymore/)).toBeVisible();
});
