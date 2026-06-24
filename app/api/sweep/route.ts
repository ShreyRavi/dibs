import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const TTL_DAYS = 90;
// Safety cap: if more lists are "active" than this, abort rather than build a
// huge inline NOT IN (...) (URL blowup) or risk an unsafe delete. Fail closed.
const MAX_ACTIVE = 500;

// GET /api/sweep — TTL cleanup on the shared instance: delete lists created over
// TTL_DAYS ago that have had NO task OR member activity in that window (FK
// cascade drops their members + tasks). Scheduled weekly in vercel.json.
//
// Destructive endpoint → fails CLOSED: requires CRON_SECRET (set it, and Vercel
// Cron sends it as a Bearer token). A list is "active" (protected) if any of its
// tasks was updated, or any member joined, within the window.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "sweep disabled — set CRON_SECRET" },
      { status: 503 },
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - TTL_DAYS * 86_400_000).toISOString();
  const db = supabaseAdmin();

  // Lists kept alive by recent task OR member activity.
  const [{ data: taskActive }, { data: memberActive }] = await Promise.all([
    db.from("dibs_tasks").select("list_id").gte("updated_at", cutoff),
    db.from("dibs_members").select("list_id").gte("created_at", cutoff),
  ]);
  const activeIds = Array.from(
    new Set([
      ...(taskActive ?? []).map((r) => r.list_id as string),
      ...(memberActive ?? []).map((r) => r.list_id as string),
    ]),
  );

  // Too many active lists to safely exclude inline → abort (don't risk a bad delete).
  if (activeIds.length > MAX_ACTIVE) {
    return NextResponse.json(
      { ok: false, skipped: "too many active lists to sweep safely", active: activeIds.length },
      { status: 200 },
    );
  }

  let q = db.from("dibs_lists").delete().lt("created_at", cutoff).select("id");
  if (activeIds.length) q = q.not("id", "in", `(${activeIds.join(",")})`);
  const { data: deleted, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: deleted?.length ?? 0 });
}
