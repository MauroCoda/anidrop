import type { MetadataRoute } from "next";

import { getCanonicalSiteUrlForSeo } from "@/src/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalSiteUrlForSeo();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: new URL("/sitemap.xml", base).href,
  };
}
