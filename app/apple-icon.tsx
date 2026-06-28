import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch / PWA icon: the lime "stamp" mark on near-black. Larger mark so it
// reads on a home screen and survives maskable safe-zone cropping.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0d0f",
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 26,
            backgroundColor: "#c8ff4d",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
