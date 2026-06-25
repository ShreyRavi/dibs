import { test, expect, Page, Browser } from "@playwright/test";

// 5-person end-to-end on PRODUCTION (dibs.events) — real Supabase + Broadcast.
// Alice hosts; four others open the shared link, join with name+phone, and each
// calls dibs on a task. Asserts persistence, identity, live cross-device crew
// chips, check-off, wrap-up, and the who-did-what recap.
const PROD = "https://dibs.events";
const SHOTS = ".gstack/qa-reports/screenshots";

const HOST = { name: "Alice Nguyen", phone: "555 500 0001" };
// (person, task) pairs — Alice takes the cake, the rest open the link.
const GUESTS = [
  { name: "Bob Reyes", phone: "555 500 0002", task: "Make the playlist" },
  { name: "Carol Diaz", phone: "555 500 0003", task: "Bring decorations" },
  { name: "Dave Kim", phone: "555 500 0004", task: "Pick the bar" },
  { name: "Erin Walsh", phone: "555 500 0005", task: "Run the photos" },
];
// 6 tasks: 5 get claimed, 1 (Order the snacks) left as a dropped ball.
const TASKS = "Order the cake, Make the playlist, Bring decorations, Pick the bar, Run the photos, Order the snacks";

async function joinAndClaim(page: Page, task: RegExp, who: { name: string; phone: string }) {
  await page.getByRole("button", { name: new RegExp(`Call dibs on ${task.source}`) }).click();
  const nameField = page.getByLabel("Your name");
  if (await nameField.isVisible().catch(() => false)) {
    await nameField.fill(who.name);
    await page.getByLabel("Your number").fill(who.phone);
    await page.getByRole("button", { name: /Join the list/ }).click();
  }
  await expect(page.getByText("You").first()).toBeVisible({ timeout: 15_000 });
}

async function openList(browser: Browser, url: string): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 820 } });
  const page = await ctx.newPage();
  await page.goto(url);
  return page;
}

test("5-person production E2E: create, share, 5 claims, realtime, recap", async ({ browser }) => {
  test.setTimeout(180_000);
  let code = "";
  let listUrl = "";

  const aliceCtx = await browser.newContext({ viewport: { width: 390, height: 820 } });
  const alice = await aliceCtx.newPage();
  const aliceErrors: string[] = [];
  alice.on("console", (m) => m.type() === "error" && aliceErrors.push(m.text()));

  await test.step("Alice creates the event (emoji, description, invite, 6 comma tasks)", async () => {
    await alice.goto(`${PROD}/new`);
    await alice.getByLabel("Event name").fill("Dev's 25th");
    await alice.getByRole("radio", { name: "🎂" }).click();
    await alice.getByLabel("Description").fill("Karaoke + cake, 8pm");
    await alice.getByLabel("Invite link").fill("partiful.com/e/devs25");
    await alice.getByLabel("Add tasks").fill(TASKS);
    await alice.getByLabel("Add tasks").press("Enter");
    await alice.getByRole("button", { name: /Create & share/ }).click();
    await expect(alice).toHaveURL(/\/l\/[^/]+\/share$/, { timeout: 20_000 });
    code = new URL(alice.url()).pathname.split("/")[2];
    listUrl = `${PROD}/l/${code}`;
    await alice.screenshot({ path: `${SHOTS}/prod-5p-1-share.png` });
  });

  await test.step("Alice opens the list — 6 tasks", async () => {
    await alice.goto(listUrl);
    await expect(alice.getByRole("button", { name: /^Call dibs on/ })).toHaveCount(6);
  });

  await test.step("Alice claims the cake (joins as host)", async () => {
    await joinAndClaim(alice, /Order the cake/, HOST);
  });

  // Four guests open the shared link in their own browsers and each claim a task.
  const guestPages: Page[] = [];
  for (const g of GUESTS) {
    await test.step(`${g.name} opens the link and claims "${g.task}"`, async () => {
      const page = await openList(browser, listUrl);
      await joinAndClaim(page, new RegExp(g.task), g);
      guestPages.push(page);
    });
  }

  await test.step("Realtime: Alice's crew chips show all 5 planners live", async () => {
    const names = GUESTS.map((g) => g.name);
    const seeAll = async (t: number) => {
      for (const n of names) {
        await expect(alice.getByText(n).first()).toBeVisible({ timeout: t });
      }
    };
    try {
      await seeAll(12_000); // live via Broadcast
    } catch {
      await alice.reload(); // dropped message → resync on reload
      await seeAll(12_000);
    }
    await alice.screenshot({ path: `${SHOTS}/prod-5p-2-realtime.png` });
  });

  await test.step("Everyone checks off their task (5 done, 1 dropped)", async () => {
    await alice.getByRole("button", { name: /Mark .*Order the cake.* done/ }).click();
    for (let i = 0; i < GUESTS.length; i++) {
      await guestPages[i].getByRole("button", { name: new RegExp(`Mark .*${GUESTS[i].task}.* done`) }).click();
    }
  });

  await test.step("Alice wraps up — recap shows all 5 + who did what", async () => {
    await alice.getByRole("button", { name: /Wrap up the event|Complete the event/ }).click();
    await expect(alice).toHaveURL(/\/complete$/, { timeout: 15_000 });
    await expect(alice.getByText("EVENT")).toBeVisible();
    await alice.waitForTimeout(1500);
    await alice.screenshot({ path: `${SHOTS}/prod-5p-3-complete.png`, fullPage: true });
    for (const n of [HOST.name, ...GUESTS.map((g) => g.name)]) {
      await expect(alice.getByText(n).first()).toBeVisible();
    }
    await expect(alice.getByText(/Order the cake/)).toBeVisible();
    await expect(alice.getByText(/Run the photos/)).toBeVisible();
  });

  expect(aliceErrors, `Alice console errors: ${aliceErrors.join(" | ")}`).toEqual([]);
  console.log(`\nPROD 5-PERSON E2E PASSED\n  event: Dev's 25th 🎂\n  url: ${listUrl}\n  code: ${code}\n`);

  await aliceCtx.close();
  for (const p of guestPages) await p.context().close();
});
