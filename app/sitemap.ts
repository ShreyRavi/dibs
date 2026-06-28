import type { MetadataRoute } from "next";

// Only the public homepage belongs in the sitemap — list pages are private,
// per-group, and short-lived, so they're intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://dibs.events",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
