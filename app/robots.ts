import type { MetadataRoute } from "next";

// Only the marketing homepage is indexable. List pages (and their sub-routes),
// personal restore links, the creation flow, and the API are private/ephemeral
// — keep them out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/l/", "/r/", "/new", "/api/"],
    },
    sitemap: "https://dibs.events/sitemap.xml",
    host: "https://dibs.events",
  };
}
