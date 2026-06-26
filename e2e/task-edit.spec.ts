import { test, expect } from "@playwright/test";

// Tapping a task's text opens an edit/delete modal (member-gated). The done
// circle keeps its own behavior. Runs against the local dev server.
test("edit + delete a task via the tap-to-edit modal", async ({ page }) => {
  // Seed a list with two tasks.
  const res = await page.request.post("/api/lists", {
    data: {
      title: "Edit Spec",
      emoji: "🎂",
      tasks: [
        { emoji: "🍰", title: "Order the cake" },
        { emoji: "🎵", title: "Make the playlist" },
      ],
    },
  });
  const { code } = await res.json();
  await page.goto(`/l/${code}`);

  // Tap the task text → identity prompt (gating) → join.
  await page.getByRole("button", { name: 'Edit "Order the cake"' }).click();
  await page.getByLabel("Your name").fill("Tess Quill");
  await page.getByLabel("Your number").fill("5551234567");
  await page.getByRole("button", { name: /Join the list/ }).click();

  // Modal auto-opens after join; edit the text.
  const modal = page.getByRole("dialog", { name: "Edit task" });
  await expect(modal).toBeVisible({ timeout: 10_000 });
  await page.getByLabel("Task text").fill("🎂 Order a giant cake");
  await page.getByRole("button", { name: /Update task/ }).click();
  await expect(page.getByText("Order a giant cake")).toBeVisible();

  // Delete the other task (two-step confirm).
  await page.getByRole("button", { name: 'Edit "Make the playlist"' }).click();
  await page.getByRole("button", { name: /^Delete task/ }).click();
  await page.getByRole("button", { name: /Delete for real/ }).click();
  await expect(page.getByText("Make the playlist")).toHaveCount(0);
});
