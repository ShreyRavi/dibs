import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dibs — call dibs on the group to-do list";

// Default social card for the homepage (and any route without its own OG image).
// Brand mark + wordmark + tagline, matching the in-app shell.
export default function Og() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0d0d0f",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(255,93,162,0.18), transparent 55%), radial-gradient(circle at 80% 25%, rgba(200,255,77,0.16), transparent 55%)",
          padding: "96px",
          color: "#f5f3ef",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#1b1a20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-8deg)",
              boxShadow: "0 0 28px rgba(200,255,77,0.4)",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#c8ff4d" }} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Dibs</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          <div>Call dibs on the</div>
          <div>group to-do list.</div>
        </div>

        <div style={{ marginTop: 28, fontSize: 34, color: "rgba(245,243,239,0.6)" }}>
          Share a link. No app, no login. · dibs.events
        </div>
      </div>
    ),
    { ...size },
  );
}
