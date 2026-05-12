import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/src/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(base ? { sitemap: new URL("/sitemap.xml", base).href } : {}),
  };
}
