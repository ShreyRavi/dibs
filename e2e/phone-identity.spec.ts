import { test, expect, request } from "@playwright/test";

// Phone is the durable identity: the same number joins as the SAME member on a
// new device (no duplicate), even in different formats.
test("same phone on a new device adopts the same member", async ({ baseURL }) => {
  const ctx = await request.newContext({ baseURL });
  const create = await ctx.post("/api/lists", {
    data: { title: "Identity Test", tasks: [] },
  });
  const { listId } = await create.json();

  // Device 1 joins with a phone.
  const a = await ctx.post(`/api/lists/${listId}/join`, {
    data: { name: "Maya", phone: "(555) 222-3333", op_id: "a" },
  });
  const memberA = (await a.json()).member;

  // Device 2 (fresh cookie jar) joins with the SAME number, different format.
  const ctx2 = await request.newContext({ baseURL });
  const b = await ctx2.post(`/api/lists/${listId}/join`, {
    data: { name: "Maya on laptop", phone: "+1 555 222 3333", op_id: "b" },
  });
  const body = await b.json();

  // Adopted the existing member — no duplicate.
  expect(body.adopted).toBe(true);
  expect(body.member.id).toBe(memberA.id);

  // The list has exactly one member.
  const state = await ctx.get(`/api/lists/${listId}/state`);
  const { members } = await state.json();
  expect(members.length).toBe(1);

  await ctx.dispose();
  await ctx2.dispose();
});

test("a different phone is a different member", async ({ baseURL }) => {
  const ctx = await request.newContext({ baseURL });
  const create = await ctx.post("/api/lists", {
    data: { title: "Two People", tasks: [] },
  });
  const { listId } = await create.json();

  await ctx.post(`/api/lists/${listId}/join`, {
    data: { name: "A", phone: "555 111 0000", op_id: "a" },
  });
  const ctx2 = await request.newContext({ baseURL });
  await ctx2.post(`/api/lists/${listId}/join`, {
    data: { name: "B", phone: "555 222 0000", op_id: "b" },
  });

  const state = await ctx.get(`/api/lists/${listId}/state`);
  const { members } = await state.json();
  expect(members.length).toBe(2);

  await ctx.dispose();
  await ctx2.dispose();
});
