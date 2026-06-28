import type { MetadataRoute } from "next";

// PWA manifest — makes Dibs installable / "Add to Home Screen" and gives the
// eventual mobile wrapper a real app identity. Colors match the app shell.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dibs by Kansoboard",
    short_name: "Dibs",
    description: "Call dibs on the group to-do list. No app, no login.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0d0f",
    theme_color: "#0d0d0f",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
