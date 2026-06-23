import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const TTL_DAYS = 90;

// GET /api/sweep — TTL cleanup on the shared instance: delete lists created over
// TTL_DAYS ago whose tasks haven't been touched in that window (FK cascade drops
// their members + tasks). Protected by CRON_SECRET (Vercel Cron sends it as a
// Bearer token). Scheduled weekly in vercel.json.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - TTL_DAYS * 86_400_000).toISOString();
  const db = supabaseAdmin();

  // Lists kept alive by recent task activity.
  const { data: active } = await db
    .from("dibs_tasks")
    .select("list_id")
    .gte("updated_at", cutoff);
  const activeIds = Array.from(new Set((active ?? []).map((r) => r.list_id)));

  let q = db.from("dibs_lists").delete().lt("created_at", cutoff).select("id");
  if (activeIds.length) q = q.not("id", "in", `(${activeIds.join(",")})`);
  const { data: deleted, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deleted: deleted?.length ?? 0 });
}
