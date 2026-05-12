import type { MetadataRoute } from "next";

import {
  getCurrentSeasonAnime,
  getTrendingAnime,
} from "@/src/lib/anilist";
import { animeDetailPath } from "@/src/lib/slugify";
import { getSiteUrl } from "@/src/lib/site";
import { getGuideSlugs } from "@/src/lib/guides";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  if (!base) {
    return [];
  }

  const home: MetadataRoute.Sitemap = [
    {
      url: new URL("/", base).href,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: new URL("/guides", base).href,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  const guideEntries: MetadataRoute.Sitemap = getGuideSlugs().map((slug) => ({
    url: new URL(`/guides/${slug}`, base).href,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  try {
    const [trending, season] = await Promise.all([
      getTrendingAnime(24),
      getCurrentSeasonAnime(24),
    ]);
    const seen = new Set<number>();
    const animeEntries: MetadataRoute.Sitemap = [];

    for (const item of [...trending, ...season]) {
      if (!Number.isFinite(item.id) || item.id <= 0 || seen.has(item.id)) {
        continue;
      }
      seen.add(item.id);
      animeEntries.push({
        url: new URL(animeDetailPath(item), base).href,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.65,
      });
    }

    return [...home, ...guideEntries, ...animeEntries];
  } catch {
    return [...home, ...guideEntries];
  }
}
