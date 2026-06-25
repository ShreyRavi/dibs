import { test, expect, request } from "@playwright/test";

test("list stores emoji/description/invite; comma adds many; wrap-up sets completed", async ({
  baseURL,
}) => {
  const ctx = await request.newContext({ baseURL });

  const create = await ctx.post("/api/lists", {
    data: {
      title: "Feature Test",
      emoji: "🏕️",
      description: "Camping weekend",
      invite_url: "https://partiful.com/e/abc123",
      tasks: [],
    },
  });
  expect(create.ok()).toBeTruthy();
  const { listId, code } = await create.json();

  // Comma-separated batch → three tasks at once.
  const add = await ctx.post(`/api/lists/${listId}/tasks`, {
    data: { titles: ["🔥 firewood", "tent", "s'mores"], op_id: "batch" },
  });
  const { tasks } = await add.json();
  expect(tasks.length).toBe(3);

  // Fields persisted + tasks present.
  const state = await (await ctx.get(`/api/lists/${listId}/state`)).json();
  expect(state.emoji).toBe("🏕️");
  expect(state.description).toBe("Camping weekend");
  expect(state.invite_url).toContain("partiful.com");
  expect(state.tasks.length).toBe(3);
  expect(state.completed).toBe(false);
  expect(code).toBeTruthy();

  // Wrap up → completed flips true.
  const patch = await ctx.patch(`/api/lists/${listId}`, {
    data: { completed: true },
  });
  expect(patch.ok()).toBeTruthy();
  const after = await (await ctx.get(`/api/lists/${listId}/state`)).json();
  expect(after.completed).toBe(true);

  await ctx.dispose();
});
