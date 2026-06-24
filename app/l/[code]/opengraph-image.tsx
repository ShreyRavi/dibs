import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatEventAt } from "@/lib/format";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A shared Dibs list";

// Static OG card (design decision): brand + title + date + "shared list" only.
// No live progress/crew — the unfurl bot is cookieless and iMessage caches the
// preview per-URL, so live state can't reach the thread. Live state is in-app.
export default async function Og({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data: list } = await supabaseAdmin()
    .from("dibs_lists")
    .select("title, event_at")
    .eq("code", code)
    .single();

  const title = list?.title ?? "A shared list";
  const date = formatEventAt(list?.event_at);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          // Satori needs backgroundColor + backgroundImage split — a solid hex
          // inside the gradient list is rejected ("Invalid background image").
          backgroundColor: "#0d0d0f",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(255,93,162,0.18), transparent 55%), radial-gradient(circle at 80% 25%, rgba(200,255,77,0.16), transparent 55%)",
          padding: "96px",
          color: "#f5f3ef",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand chiplet */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#1b1a20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-8deg)",
              boxShadow: "0 0 24px rgba(200,255,77,0.4)",
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "#c8ff4d" }} />
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 1,
              color: "rgba(245,243,239,0.6)",
            }}
          >
            DIBS · shared list
          </div>
        </div>

        {/* title */}
        <div
          style={{
            marginTop: 40,
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>

        {/* date */}
        {date && (
          <div style={{ marginTop: 20, fontSize: 34, color: "rgba(245,243,239,0.5)" }}>
            {date}
          </div>
        )}

        {/* footer cue */}
        <div
          style={{
            marginTop: 56,
            alignSelf: "flex-start",
            background: "#c8ff4d",
            color: "#0d0d0f",
            fontSize: 30,
            fontWeight: 700,
            padding: "16px 34px",
            borderRadius: 999,
          }}
        >
          Call dibs on a task →
        </div>
      </div>
    ),
    {
      ...size,
      // The card is static per list (title locks on first share), so cache hard.
      // Unfurl bots fetch this once; repeat opens hit the CDN, not the renderer.
      headers: {
        "cache-control": "public, immutable, no-transform, max-age=86400, s-maxage=604800",
      },
    },
  );
}
