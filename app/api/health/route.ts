import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Keep-alive: hit daily by Vercel Cron (vercel.json) so the free Supabase
// project never pauses (7-day idle clock). Runs a trivial query to count.
export async function GET() {
  try {
    const { error } = await supabaseAdmin()
      .from("dibs_lists")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    );
  }
}
