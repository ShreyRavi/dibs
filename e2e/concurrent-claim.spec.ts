import { test, expect, request } from "@playwright/test";

// The core guarantee: a task can be claimed by exactly one person. Two members
// fire claims in parallel; the atomic null-guard means exactly one 200, one 409.
test("concurrent claim on one task yields exactly one winner", async ({
  baseURL,
}) => {
  // Member A creates a list with one task (cookie A set on this context).
  const ctxA = await request.newContext({ baseURL });
  const create = await ctxA.post("/api/lists", {
    data: {
      title: "Race Test",
      hostName: "A",
      tasks: [{ emoji: "🏁", title: "the contested task" }],
    },
  });
  expect(create.ok()).toBeTruthy();
  const { listId } = await create.json();

  // Find the task id via the state endpoint.
  const state = await ctxA.get(`/api/lists/${listId}/state`);
  const { tasks } = await state.json();
  const taskId = tasks[0].id as string;

  // Member B joins (separate cookie context).
  const ctxB = await request.newContext({ baseURL });
  const join = await ctxB.post(`/api/lists/${listId}/join`, {
    data: { name: "B", op_id: "join-b" },
  });
  expect(join.ok()).toBeTruthy();

  // Both claim the same task in parallel.
  const [resA, resB] = await Promise.all([
    ctxA.post(`/api/tasks/${taskId}`, { data: { action: "claim", op_id: "a" } }),
    ctxB.post(`/api/tasks/${taskId}`, { data: { action: "claim", op_id: "b" } }),
  ]);

  const statuses = [resA.status(), resB.status()].sort();
  // exactly one 200 (winner) and one 409 (lost the race)
  expect(statuses).toEqual([200, 409]);

  await ctxA.dispose();
  await ctxB.dispose();
});
