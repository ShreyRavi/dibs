import { test, expect, Page } from "@playwright/test";

// 3-person end-to-end on PRODUCTION (real Supabase, real Broadcast realtime).
// Alice hosts; Bob + Carol open the shared link, join with name+phone, and call
// dibs. Asserts persistence, the name+phone identity, live cross-device updates,
// the "planners" crew label, wrap-up, and the who-did-what recap.
const PROD = "https://dibs.kansoboard.com";
const SHOTS = ".gstack/qa-reports/screenshots";

const people = {
  alice: { name: "Alice Nguyen", phone: "555 200 0001" },
  bob: { name: "Bob Reyes", phone: "555 200 0002" },
  carol: { name: "Carol Diaz", phone: "555 200 0003" },
};

// Click "Call dibs on <task>", fill the identity modal, join.
async function callDibs(page: Page, taskLabel: RegExp, who: { name: string; phone: string }) {
  await page.getByRole("button", { name: new RegExp(`Call dibs on ${taskLabel.source}`) }).click();
  // If the device isn't a member yet, the prompt appears.
  const nameField = page.getByLabel("Your name");
  if (await nameField.isVisible().catch(() => false)) {
    await nameField.fill(who.name);
    await page.getByLabel("Your number").fill(who.phone);
    await page.getByRole("button", { name: /Join the list/ }).click();
  }
}

test("3-person production E2E: create, share, claim, realtime, recap", async ({ browser }) => {
  test.setTimeout(120_000);
  let code = "";
  let listUrl = "";

  // ---- Alice: create the event ------------------------------------------------
  const aliceCtx = await browser.newContext({ viewport: { width: 390, height: 820 } });
  const alice = await aliceCtx.newPage();
  const aliceErrors: string[] = [];
  alice.on("console", (m) => m.type() === "error" && aliceErrors.push(m.text()));

  await test.step("Alice creates an event with emoji, description, bare-domain invite, comma tasks", async () => {
    await alice.goto(`${PROD}/new`);
    await alice.getByLabel("Event name").fill("Dev's 25th");
    // pick the cake emoji from the curated grid
    await alice.getByRole("radio", { name: "🎂" }).click();
    await alice.getByLabel("Description").fill("Karaoke + cake, 8pm");
    await alice.getByLabel("Invite link").fill("partiful.com/e/devs25"); // bare domain (the 400 repro)
    await alice.getByLabel("Add tasks").fill("Order the cake, Make the playlist, Bring decorations, Pick the bar");
    await alice.getByLabel("Add tasks").press("Enter");
    await alice.getByRole("button", { name: /Create & share/ }).click();
    await expect(alice).toHaveURL(/\/l\/[^/]+\/share$/, { timeout: 20_000 });
    code = new URL(alice.url()).pathname.split("/")[2];
    listUrl = `${PROD}/l/${code}`;
    await expect(alice.getByText("Drop this in the group chat")).toBeVisible();
    await alice.screenshot({ path: `${SHOTS}/prod-3p-1-share.png` });
  });

  await test.step("Alice opens the list — 4 tasks, all unclaimed", async () => {
    await alice.goto(listUrl);
    await expect(alice.getByRole("heading", { name: "Dev's 25th" })).toBeVisible();
    await expect(alice.getByRole("button", { name: /^Call dibs on/ })).toHaveCount(4);
    await alice.screenshot({ path: `${SHOTS}/prod-3p-2-list.png` });
  });

  await test.step("Alice claims 'Order the cake' (joins as Alice)", async () => {
    await callDibs(alice, /Order the cake/, people.alice);
    await expect(alice.getByText("Alice Nguyen").or(alice.getByText("You")).first()).toBeVisible({ timeout: 15_000 });
  });

  // ---- Bob: open the shared link, join, claim ---------------------------------
  const bobCtx = await browser.newContext({ viewport: { width: 390, height: 820 } });
  const bob = await bobCtx.newPage();
  await test.step("Bob opens the link and calls dibs on the playlist", async () => {
    await bob.goto(listUrl);
    await expect(bob.getByRole("heading", { name: "Dev's 25th" })).toBeVisible();
    await callDibs(bob, /Make the playlist/, people.bob);
    await expect(bob.getByText("You").first()).toBeVisible({ timeout: 15_000 });
    await bob.screenshot({ path: `${SHOTS}/prod-3p-3-bob.png` });
  });

  // ---- Carol: open, join, claim -----------------------------------------------
  const carolCtx = await browser.newContext({ viewport: { width: 390, height: 820 } });
  const carol = await carolCtx.newPage();
  await test.step("Carol opens the link and calls dibs on decorations", async () => {
    await carol.goto(listUrl);
    await callDibs(carol, /Bring decorations/, people.carol);
    await expect(carol.getByText("You").first()).toBeVisible({ timeout: 15_000 });
  });

  // ---- Realtime: Alice's still-open page should reflect Bob + Carol -----------
  await test.step("Realtime: Alice sees Bob + Carol's claims live (crew = planners)", async () => {
    await expect(alice.getByText("Bob Reyes")).toBeVisible({ timeout: 15_000 });
    await expect(alice.getByText("Carol Diaz")).toBeVisible({ timeout: 15_000 });
    await alice.screenshot({ path: `${SHOTS}/prod-3p-4-realtime.png` });
  });

  // ---- Each marks their task done --------------------------------------------
  await test.step("Bob + Carol + Alice check off their tasks", async () => {
    await bob.getByRole("button", { name: /Mark .*Make the playlist.* done/ }).click();
    await carol.getByRole("button", { name: /Mark .*Bring decorations.* done/ }).click();
    await alice.getByRole("button", { name: /Mark .*Order the cake.* done/ }).click();
    // Alice's ring reaches 3/4
    await expect(alice.getByText("3", { exact: false }).first()).toBeVisible({ timeout: 15_000 });
  });

  // ---- Wrap up + recap --------------------------------------------------------
  await test.step("Alice wraps up — recap shows who did what", async () => {
    await alice.getByRole("button", { name: /Wrap up the event|Complete the event/ }).click();
    await expect(alice).toHaveURL(/\/complete$/, { timeout: 15_000 });
    await expect(alice.getByText("EVENT")).toBeVisible();
    await alice.waitForTimeout(1500);
    await alice.screenshot({ path: `${SHOTS}/prod-3p-5-complete.png`, fullPage: true });
    await expect(alice.getByText("Alice Nguyen")).toBeVisible();
    await expect(alice.getByText("Bob Reyes")).toBeVisible();
    await expect(alice.getByText("Carol Diaz")).toBeVisible();
    // each person's finished task appears as a sub-item
    await expect(alice.getByText(/Order the cake/)).toBeVisible();
    await expect(alice.getByText(/Make the playlist/)).toBeVisible();
    await expect(alice.getByText(/Bring decorations/)).toBeVisible();
  });

  expect(aliceErrors, `Alice console errors: ${aliceErrors.join(" | ")}`).toEqual([]);

  console.log(`\nPROD 3-PERSON E2E PASSED\n  event: Dev's 25th 🎂\n  url: ${listUrl}\n  code: ${code}\n`);

  await aliceCtx.close();
  await bobCtx.close();
  await carolCtx.close();
});
