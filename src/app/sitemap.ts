import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/src/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  if (!base) {
    return [];
  }
  return [
    {
      url: new URL("/", base).href,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
